const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  syncJobs,
  getJobs,
  getJobById,
  bookmarkJob,
  getBookmarks,
} = require('../controllers/jobController');

router.get('/', getJobs);
router.get('/bookmarks', protect, getBookmarks);
router.get('/:id', getJobById);
router.post('/sync', syncJobs);
router.post('/:id/bookmark', protect, bookmarkJob);

module.exports = router;