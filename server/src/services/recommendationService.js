const prisma = require('../prisma/client');
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ── Score a single job against user skills ────────────────────────────────────
function scoreJob(job, userSkills) {
  if (!userSkills || userSkills.length === 0) return { score: 0, matchedSkills: [], missingSkills: [] };

  const userSkillsLower = userSkills.map(s => s.toLowerCase());
  const jobSkills = job.skills || [];
  const jobSkillsLower = jobSkills.map(s => s.toLowerCase());

  const matchedSkills = jobSkills.filter(s => userSkillsLower.includes(s.toLowerCase()));
  const missingSkills = jobSkills.filter(s => !userSkillsLower.includes(s.toLowerCase()));

  // Score = % of job skills matched, bonus for more matches
  const score = jobSkills.length > 0
    ? Math.round((matchedSkills.length / jobSkills.length) * 100)
    : 0;

  return { score, matchedSkills, missingSkills };
}

// ── Get ranked recommendations for a user ────────────────────────────────────
async function getRecommendations(userId, limit = 10) {
  // Get user's skills from profile
  const profile = await prisma.profile.findUnique({
    where: { userId },
    include: { skills: true },
  });

  if (!profile || profile.skills.length === 0) {
    // No profile — return latest jobs
    const jobs = await prisma.internship.findMany({
      where: { isActive: true },
      include: { company: true },
      orderBy: { postedAt: 'desc' },
      take: limit,
    });
    return jobs.map(job => ({ ...job, matchScore: 0, matchedSkills: [], missingSkills: [], explanation: null }));
  }

  const userSkills = profile.skills.map(s => s.name);

  // Get all active jobs
  const jobs = await prisma.internship.findMany({
    where: { isActive: true },
    include: { company: true },
    orderBy: { postedAt: 'desc' },
    take: 100, // score top 100 then sort
  });

  // Score and rank
  const scored = jobs.map(job => ({
    ...job,
    ...scoreJob(job, userSkills),
  }));

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, limit);
}

// ── Generate "Why this job matches you" explanation ───────────────────────────
async function generateMatchExplanation(job, userSkills) {
  const matchedSkills = (job.skills || []).filter(s =>
    userSkills.map(u => u.toLowerCase()).includes(s.toLowerCase())
  );
  const missingSkills = (job.skills || []).filter(s =>
    !userSkills.map(u => u.toLowerCase()).includes(s.toLowerCase())
  );

  const prompt = `You are a career advisor. In 2 short sentences, explain why this job is a good match for this candidate.
Be specific about their matching skills. Be encouraging but honest about gaps.
Return ONLY the 2 sentences. No labels, no markdown.

Job: ${job.title} at ${job.company?.name || 'a company'}
Matched skills: ${matchedSkills.join(', ') || 'none'}
Missing skills: ${missingSkills.join(', ') || 'none'}
Candidate skills: ${userSkills.slice(0, 10).join(', ')}`;

  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      max_tokens: 150,
    });
    return response.choices[0].message.content.trim();
  } catch (err) {
    console.error('[generateMatchExplanation]', err.message);
    return matchedSkills.length > 0
      ? `Your ${matchedSkills.slice(0, 2).join(' and ')} skills align well with this role.`
      : 'This role could help you expand your skillset in new areas.';
  }
}

module.exports = { getRecommendations, generateMatchExplanation, scoreJob };