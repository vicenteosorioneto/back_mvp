const express = require('express');
const controller = require('./properties.controller');
const requireAuth = require('../../shared/middlewares/requireAuth');

const router = express.Router();

router.use(requireAuth);

router.get('/properties', controller.getAll);
router.get('/properties/:id', controller.getById);
router.post('/properties', controller.create);
router.put('/properties/:id', controller.update);
router.delete('/properties/:id', controller.delete);

module.exports = router;
