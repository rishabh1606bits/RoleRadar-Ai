const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────
const jobRoutes            = require('./routes/jobroutes');
const resumeRoutes         = require('./routes/resumeRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');

app.use('/api/jobs',            jobRoutes);
app.use('/api/resume',          resumeRoutes);
app.use('/api/recommendations', recommendationRoutes);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/', (req, res) => res.json({ message: 'RoleRadar API running' }));

// ─── Daily cron ───────────────────────────────────────────────────────────────
const { syncAllJobs } = require('./services/jobService');
cron.schedule('0 0 * * *', async () => {
  console.log('[Cron] Running daily job sync...');
  try {
    const result = await syncAllJobs();
    console.log(`[Cron] Sync complete — created: ${result.created}, skipped: ${result.skipped}`);
  } catch (err) {
    console.error('[Cron] Sync failed:', err.message);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server on port ${PORT}`));