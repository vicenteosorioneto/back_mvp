const express = require('express');
const controller = require('./auth.controller');
const requireAuth = require('../../shared/middlewares/requireAuth');

const router = express.Router();

router.post('/auth/register', controller.register);
router.post('/auth/login', controller.login);
router.post('/auth/logout', controller.logout);
router.get('/auth/me', requireAuth, controller.getProfile);
router.put('/auth/me', requireAuth, controller.updateProfile);

module.exports = router;
