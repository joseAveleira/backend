const express = require('express');
const MatchController = require('../controllers/match');
const { AdminAuthMiddleware } = require('../middlewares/auth');

const router = express.Router();

router.post('/', AdminAuthMiddleware, MatchController.create);
router.get('/:match_id/logs', MatchController.getLogs);

module.exports = router;
