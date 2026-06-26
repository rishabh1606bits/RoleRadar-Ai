const prisma = require('../prisma/client');

// ─── Remotive — global remote jobs ───────────────────────────────────────────
async function fetchFromRemotive() {
  const categories = ['software-dev', 'data', 'devops', 'backend', 'frontend'];

  const results = await Promise.allSettled(
    categories.map(cat =>
      fetch(`https://remotive.com/api/remote-jobs?category=${cat}&limit=50`)
        .then(r => r.json())
        .then(d => d.jobs || [])
    )
  );

  const allJobs = results
    .filter(r => r.status === 'fulfilled')
    .flatMap(r => r.value);

  const seen = new Set();
  return allJobs
    .filter(job => {
      if (seen.has(job.id)) return false;
      seen.add(job.id);
      return true;
    })
    .map(job => ({
      source: 'remotive',
      externalId: String(job.id),
      title: job.title,
      companyName: job.company_name,
      companyLogo: job.company_logo || null,
      description: job.description || '',
      location: job.candidate_required_location || 'Remote',
      isRemote: true,
      stipend: null,
      applyUrl: job.url,
      domain: mapCategory(job.category, job.title),
      tags: job.tags || [],
      postedAt: new Date(job.publication_date),
      country: 'Global',
      type: inferType(job.title), // Internship or Job
    }));
}

// ─── Adzuna India ─────────────────────────────────────────────────────────────
async function fetchFromAdzuna() {
  const APP_ID  = process.env.ADZUNA_APP_ID;
  const APP_KEY = process.env.ADZUNA_APP_KEY;

  if (!APP_ID || !APP_KEY) {
    console.warn('[Adzuna] Missing keys — skipping');
    return [];
  }

  // Separate internship and job search terms
  const internshipTerms = [
    'software intern', 'frontend intern', 'backend intern',
    'data science intern', 'machine learning intern', 'web development intern',
    'react intern', 'python intern',
  ];

  const jobTerms = [
    'frontend developer', 'backend developer', 'full stack developer',
    'machine learning engineer', 'data analyst', 'react developer',
    'node developer', 'python developer', 'java developer',
    'devops engineer', 'software engineer', 'web developer',
  ];

  const fetchTerms = (terms, type) =>
    Promise.allSettled(
      terms.map(term => {
        const url = `https://api.adzuna.com/v1/api/jobs/in/search/1?app_id=${APP_ID}&app_key=${APP_KEY}&results_per_page=50&what=${encodeURIComponent(term)}&content-type=application/json`;
        return fetch(url)
          .then(r => r.json())
          .then(d => (d.results || []).map(job => ({ ...job, _type: type })));
      })
    );

  const [internshipResults, jobResults] = await Promise.all([
    fetchTerms(internshipTerms, 'Internship'),
    fetchTerms(jobTerms, 'Job'),
  ]);

  const allJobs = [
    ...internshipResults.filter(r => r.status === 'fulfilled').flatMap(r => r.value),
    ...jobResults.filter(r => r.status === 'fulfilled').flatMap(r => r.value),
  ];

  const seen = new Set();
  return allJobs
    .filter(job => {
      if (seen.has(job.id)) return false;
      seen.add(job.id);
      return true;
    })
    .map(job => ({
      source: 'adzuna',
      externalId: String(job.id),
      title: job.title,
      companyName: job?.company?.display_name || 'Unknown',
      companyLogo: null,
      description: stripHtml(job.description || ''),
      location: job?.location?.display_name || 'India',
      isRemote: job.title.toLowerCase().includes('remote'),
      stipend: job.salary_min ? Math.round(job.salary_min / 12) : null,
      applyUrl: job.redirect_url,
      domain: mapCategory(job.category?.label || '', job.title || ''),
      tags: [],
      postedAt: new Date(job.created),
      country: 'India',
      type: job._type || inferType(job.title),
    }));
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function inferType(title = '') {
  const t = title.toLowerCase();
  if (t.includes('intern') || t.includes('trainee') || t.includes('apprentice')) return 'Internship';
  return 'Job';
}

function stripHtml(html) {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

function mapCategory(category = '', title = '') {
  const c = (category + ' ' + title).toLowerCase();
  if (c.includes('machine learning') || c.includes(' ml ') || c.includes('data scientist') || c.includes('nlp') || c.includes('artificial intelligence')) return 'AI/ML';
  if (c.includes('frontend') || c.includes('front-end') || c.includes('react') || c.includes('vue') || c.includes('angular') || c.includes('ui developer')) return 'Frontend';
  if (c.includes('backend') || c.includes('back-end') || c.includes('node') || c.includes('django') || c.includes('spring') || c.includes('java developer') || c.includes('python developer')) return 'Backend';
  if (c.includes('full stack') || c.includes('fullstack') || c.includes('full-stack') || c.includes('mern') || c.includes('mean')) return 'Fullstack';
  if (c.includes('android') || c.includes('ios') || c.includes('flutter') || c.includes('mobile')) return 'Frontend';
  if (c.includes('devops') || c.includes('cloud') || c.includes('aws') || c.includes('kubernetes')) return 'Backend';
  return 'Fullstack';
}

// ─── Upsert jobs into DB ──────────────────────────────────────────────────────
async function upsertJobs(jobs) {
  let created = 0;
  let skipped = 0;

  for (const job of jobs) {
    try {
      let company = await prisma.company.findFirst({ where: { name: job.companyName } });
      if (!company) {
        company = await prisma.company.create({
          data: { name: job.companyName, logoUrl: job.companyLogo },
        });
      }

      const existing = await prisma.internship.findFirst({ where: { applyUrl: job.applyUrl } });
      if (existing) { skipped++; continue; }

      await prisma.internship.create({
        data: {
          title: job.title,
          companyId: company.id,
          description: job.description.slice(0, 5000),
          requirements: [],
          skills: job.tags.slice(0, 10),
          location: job.location,
          isRemote: job.isRemote,
          stipend: job.stipend,
          applyUrl: job.applyUrl,
          domain: job.domain,
          country: job.country,
          type: job.type,
          isActive: true,
          postedAt: job.postedAt,
        },
      });
      created++;
    } catch (err) {
      console.error(`[upsertJobs] Failed for "${job.title}":`, err.message);
    }
  }

  return { created, skipped };
}

// ─── Main sync ────────────────────────────────────────────────────────────────
async function syncAllJobs() {
  console.log('[Sync] Starting job sync...');

  const [remotiveJobs, adzunaJobs] = await Promise.all([
    fetchFromRemotive(),
    fetchFromAdzuna(),
  ]);

  const allJobs = [...remotiveJobs, ...adzunaJobs];
  console.log(`[Sync] Fetched ${allJobs.length} jobs (Remotive: ${remotiveJobs.length}, Adzuna: ${adzunaJobs.length})`);
  console.log(`[Sync] Internships: ${allJobs.filter(j => j.type === 'Internship').length}, Jobs: ${allJobs.filter(j => j.type === 'Job').length}`);

  const result = await upsertJobs(allJobs);
  console.log(`[Sync] Done — created: ${result.created}, skipped: ${result.skipped}`);

  return { total: allJobs.length, ...result };
}

module.exports = { syncAllJobs };