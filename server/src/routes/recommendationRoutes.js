const express = require('express');
const router = express.Router();
const { getJobRecommendations, explainMatch } = require('../controllers/recommendationController');

router.get('/', getJobRecommendations);
router.post('/explain', explainMatch);

module.exports = router;