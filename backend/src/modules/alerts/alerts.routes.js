const express = require('express');
const controller = require('./alerts.controller');
const requireAuth = require('../../shared/middlewares/requireAuth');

const router = express.Router();

router.use(requireAuth);

router.get('/alerts', controller.getAll);
router.post('/alerts/generate', controller.generate);
router.patch('/alerts/read-all', controller.markAllAsRead);
router.patch('/alerts/:id/read', controller.markAsRead);
router.delete('/alerts/:id', controller.delete);

module.exports = router;
