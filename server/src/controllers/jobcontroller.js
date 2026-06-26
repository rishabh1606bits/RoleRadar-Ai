const prisma = require('../prisma/client');
const { syncAllJobs } = require('../services/jobService');

// POST /api/jobs/sync
const syncJobs = async (req, res) => {
  try {
    const result = await syncAllJobs();
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('[syncJobs]', err);
    res.status(500).json({ error: 'Job sync failed' });
  }
};

// GET /api/jobs
const getJobs = async (req, res) => {
  try {
    const { domain, location, minStipend, search, country, type, page = 1, limit = 20 } = req.query;

    const where = {
      isActive: true,
      ...(domain && domain !== 'All' && { domain }),
      ...(location === 'Remote' && { isRemote: true }),
      ...(location === 'On-site' && { isRemote: false }),
      ...(minStipend && { stipend: { gte: Number(minStipend) } }),
      ...(country && country !== 'All' && { country }),
      ...(type && { type }), // 'Internship' or 'Job'
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { company: { name: { contains: search, mode: 'insensitive' } } },
        ],
      }),
    };

    const [internships, total] = await Promise.all([
      prisma.internship.findMany({
        where,
        include: { company: true },
        orderBy: { postedAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      }),
      prisma.internship.count({ where }),
    ]);

    res.json({
      data: internships,
      meta: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) {
    console.error('[getJobs]', err);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
};

// GET /api/jobs/:id
const getJobById = async (req, res) => {
  try {
    const internship = await prisma.internship.findUnique({
      where: { id: req.params.id },
      include: { company: true },
    });
    if (!internship) return res.status(404).json({ error: 'Job not found' });
    res.json(internship);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch job' });
  }
};

// POST /api/jobs/:id/bookmark
const bookmarkJob = async (req, res) => {
  try {
    const { id: internshipId } = req.params;
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const existing = await prisma.savedRole.findUnique({
      where: { userId_internshipId: { userId, internshipId } },
    });

    if (existing) {
      await prisma.savedRole.delete({ where: { userId_internshipId: { userId, internshipId } } });
      return res.json({ bookmarked: false });
    }

    await prisma.savedRole.create({ data: { userId, internshipId } });
    res.json({ bookmarked: true });
  } catch (err) {
    res.status(500).json({ error: 'Bookmark action failed' });
  }
};

// GET /api/jobs/bookmarks
const getBookmarks = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const saved = await prisma.savedRole.findMany({
      where: { userId },
      include: { internship: { include: { company: true } } },
      orderBy: { savedAt: 'desc' },
    });

    res.json(saved.map(s => s.internship));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bookmarks' });
  }
};

module.exports = { syncJobs, getJobs, getJobById, bookmarkJob, getBookmarks };