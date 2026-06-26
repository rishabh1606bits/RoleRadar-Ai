const { v2: cloudinary } = require('cloudinary');
const pdfParse = require('pdf-parse');
const Groq = require('groq-sdk');
const prisma = require('../prisma/client');

// ── Cloudinary config ─────────────────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── Groq config ───────────────────────────────────────────────────────────────
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function callAI(prompt) {
  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    max_tokens: 1000,
  });
  return response.choices[0].message.content.trim();
}

// ── 1. Upload PDF to Cloudinary ───────────────────────────────────────────────
async function uploadResumeToCloudinary(fileBuffer, originalName) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'raw',
        folder: 'roleradar/resumes',
        public_id: `resume_${Date.now()}`,
        format: 'pdf',
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    uploadStream.end(fileBuffer);
  });
}

// ── 2. Extract text from PDF buffer ──────────────────────────────────────────
async function extractTextFromPDF(fileBuffer) {
  const data = await pdfParse(fileBuffer);
  return data.text;
}

// ── 3. Extract skills ─────────────────────────────────────────────────────────
async function extractSkillsWithAI(resumeText) {
  const prompt = `You are a resume parser. Extract all technical and soft skills from the resume text below.
Return ONLY a valid JSON array of strings. No explanation, no markdown, no extra text.
Example output: ["JavaScript", "React", "Node.js", "Problem Solving"]

Resume text:
${resumeText.slice(0, 3000)}`;

  const text = await callAI(prompt);

  try {
    const cleaned = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return text.replace(/[\[\]"]/g, '').split(',').map(s => s.trim()).filter(Boolean);
  }
}

// ── 4. Generate profile summary ───────────────────────────────────────────────
async function generateProfileSummary(resumeText) {
  const prompt = `You are a career coach. Based on the resume below, write a concise 3-sentence professional profile summary.
Focus on: the candidate's background, key strengths, and career goal.
Return ONLY the summary text. No labels, no markdown.

Resume text:
${resumeText.slice(0, 3000)}`;

  return await callAI(prompt);
}

// ── 5. Calculate match score ──────────────────────────────────────────────────
async function calculateMatchScore(resumeText, job) {
  const prompt = `You are a hiring expert. Score how well this candidate matches the job on a scale of 0-100.
Return ONLY a valid JSON object. No explanation, no markdown.
Example: {"score": 78, "reasons": ["Strong React skills", "Missing Java experience"]}

Job Title: ${job.title}
Job Domain: ${job.domain}
Required Skills: ${(job.skills || []).join(', ')}
Job Description: ${(job.description || '').slice(0, 1000)}

Candidate Resume:
${resumeText.slice(0, 3000)}`;

  const text = await callAI(prompt);

  try {
    const cleaned = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return { score: 50, reasons: ['Could not parse match details'] };
  }
}

// ── 6. Full resume processing pipeline ───────────────────────────────────────
async function processResume(fileBuffer, originalName, userId) {
  const resumeUrl = await uploadResumeToCloudinary(fileBuffer, originalName);
  const resumeText = await extractTextFromPDF(fileBuffer);

  const [skills, summary] = await Promise.all([
    extractSkillsWithAI(resumeText),
    generateProfileSummary(resumeText),
  ]);

  const profile = await prisma.profile.upsert({
    where: { userId },
    update: {
      resumeUrl,
      bio: summary,
      skills: {
        deleteMany: {},
        create: skills.map(name => ({ name })),
      },
    },
    create: {
      userId,
      resumeUrl,
      bio: summary,
      skills: {
        create: skills.map(name => ({ name })),
      },
    },
    include: { skills: true },
  });

  return { profile, resumeText, skills, summary, resumeUrl };
}

module.exports = {
  processResume,
  calculateMatchScore,
  extractTextFromPDF,
};