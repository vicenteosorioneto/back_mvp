const express = require('express');
const multer = require('multer');
const controller = require('./files.controller');
const requireAuth = require('../../shared/middlewares/requireAuth');
const AppError = require('../../shared/errors/AppError');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [
      'image/jpeg', 'image/png', 'image/webp', 'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError('Tipo de arquivo não permitido', 400), false);
    }
  },
});

const router = express.Router();

router.use(requireAuth);

router.post('/files/upload', upload.single('file'), controller.upload);
router.get('/files', controller.getAll);
router.delete('/files/:id', controller.delete);

module.exports = router;
