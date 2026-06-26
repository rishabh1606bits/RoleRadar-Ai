const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadResume, getProfile, getMatchScore } = require('../controllers/resumeController');

// Multer — store in memory (we upload directly to Cloudinary)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
});

// ── Routes ────────────────────────────────────────────────────────────────────
router.post('/upload', upload.single('resume'), uploadResume);
router.get('/profile/:userId', getProfile);
router.post('/match', getMatchScore);

module.exports = router;