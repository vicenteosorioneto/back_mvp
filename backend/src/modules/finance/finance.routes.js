const express = require('express');
const controller = require('./finance.controller');
const requireAuth = require('../../shared/middlewares/requireAuth');

const router = express.Router();

router.get('/finance', requireAuth, controller.getFinance);

module.exports = router;
