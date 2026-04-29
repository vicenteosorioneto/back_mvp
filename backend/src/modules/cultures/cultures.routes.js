const express = require('express');
const controller = require('./cultures.controller');
const optionalAuth = require('../../shared/middlewares/optionalAuth');

const router = express.Router();

router.use(optionalAuth);

router.get('/cultures', controller.getAll);
router.get('/cultures/:id', controller.getById);
router.post('/cultures', controller.create);
router.put('/cultures/:id', controller.update);
router.delete('/cultures/:id', controller.delete);

module.exports = router;
