const prisma = require('../prisma/client');
const { processResume, calculateMatchScore, extractTextFromPDF } = require('../services/resumeService');

// POST /api/resume/upload
// Accepts: multipart/form-data with field "resume" (PDF)
const uploadResume = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    // For now userId comes from query param — replace with auth middleware later
    const userId = req.query.userId || req.body.userId;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const result = await processResume(req.file.buffer, req.file.originalname, userId);

    res.json({
      success: true,
      resumeUrl: result.resumeUrl,
      skills: result.skills,
      summary: result.summary,
    });
  } catch (err) {
    console.error('[uploadResume] FULL ERROR:', JSON.stringify(err, null, 2));
    console.error('[uploadResume] MESSAGE:', err.message);
    console.error('[uploadResume] STACK:', err.stack);
    res.status(500).json({ error: 'Resume processing failed', detail: err.message });
  }
};

// GET /api/resume/profile/:userId
const getProfile = async (req, res) => {
  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: req.params.userId },
      include: { skills: true },
    });

    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

// POST /api/resume/match
// Body: { userId, jobId }
const getMatchScore = async (req, res) => {
  try {
    const { userId, jobId } = req.body;
    if (!userId || !jobId) return res.status(400).json({ error: 'userId and jobId required' });

    // Get profile + job
    const [profile, job] = await Promise.all([
      prisma.profile.findUnique({ where: { userId }, include: { skills: true } }),
      prisma.internship.findUnique({ where: { id: jobId }, include: { company: true } }),
    ]);

    if (!profile) return res.status(404).json({ error: 'Profile not found. Upload resume first.' });
    if (!job) return res.status(404).json({ error: 'Job not found' });
    if (!profile.resumeUrl) return res.status(400).json({ error: 'No resume found. Upload resume first.' });

    // Build resume text from bio + skills as fallback (no need to re-parse PDF)
    const resumeText = `
      ${profile.bio || ''}
      Skills: ${profile.skills.map(s => s.name).join(', ')}
    `;

    const match = await calculateMatchScore(resumeText, job);

    res.json({
      jobId,
      jobTitle: job.title,
      ...match,
    });
  } catch (err) {
    console.error('[getMatchScore]', err);
    res.status(500).json({ error: 'Match score failed', detail: err.message });
  }
};

module.exports = { uploadResume, getProfile, getMatchScore };