const service = require('./properties.service');

const getAll = async (req, res, next) => {
  try {
    const properties = await service.getAll(req.profile);
    res.json({ success: true, data: properties });
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const property = await service.getById(req.params.id, req.profile);
    res.json({ success: true, data: property });
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const property = await service.create(req.body, req.profile);
    res.status(201).json({ success: true, data: property });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const property = await service.update(req.params.id, req.body, req.profile);
    res.json({ success: true, data: property });
  } catch (err) {
    next(err);
  }
};

const deleteProperty = async (req, res, next) => {
  try {
    await service.delete(req.params.id, req.profile);
    res.json({ success: true, message: 'Propriedade deletada' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getById, create, update, delete: deleteProperty };
