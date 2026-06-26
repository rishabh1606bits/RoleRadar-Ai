const { getRecommendations, generateMatchExplanation } = require('../services/recommendationService');
const prisma = require('../prisma/client');

// GET /api/recommendations?userId=xxx&limit=10
const getJobRecommendations = async (req, res) => {
  try {
    const { userId, limit = 10 } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const jobs = await getRecommendations(userId, Number(limit));
    res.json({ data: jobs });
  } catch (err) {
    console.error('[getJobRecommendations]', err);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
};

// POST /api/recommendations/explain
// Body: { userId, jobId }
const explainMatch = async (req, res) => {
  try {
    const { userId, jobId } = req.body;
    if (!userId || !jobId) return res.status(400).json({ error: 'userId and jobId required' });

    const [profile, job] = await Promise.all([
      prisma.profile.findUnique({ where: { userId }, include: { skills: true } }),
      prisma.internship.findUnique({ where: { id: jobId }, include: { company: true } }),
    ]);

    if (!profile) return res.status(404).json({ error: 'Profile not found. Upload resume first.' });
    if (!job) return res.status(404).json({ error: 'Job not found' });

    const userSkills = profile.skills.map(s => s.name);
    const explanation = await generateMatchExplanation(job, userSkills);

    res.json({ explanation, jobId, jobTitle: job.title });
  } catch (err) {
    console.error('[explainMatch]', err);
    res.status(500).json({ error: 'Failed to generate explanation' });
  }
};

module.exports = { getJobRecommendations, explainMatch };