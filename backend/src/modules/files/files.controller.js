const service = require('./files.service');

const upload = async (req, res, next) => {
  try {
    const { activityId, cultureId } = req.body;
    const file = await service.upload(req.file, { activityId: activityId || null, cultureId: cultureId || null }, req.profile);
    res.status(201).json({ success: true, data: file });
  } catch (err) {
    next(err);
  }
};

const getAll = async (req, res, next) => {
  try {
    const files = await service.getAll(req.profile, req.query);
    res.json({ success: true, data: files });
  } catch (err) {
    next(err);
  }
};

const deleteFile = async (req, res, next) => {
  try {
    await service.delete(req.params.id, req.profile);
    res.json({ success: true, message: 'Arquivo deletado' });
  } catch (err) {
    next(err);
  }
};

module.exports = { upload, getAll, delete: deleteFile };
