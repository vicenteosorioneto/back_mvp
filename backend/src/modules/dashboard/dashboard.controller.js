const service = require('./dashboard.service');

const getDashboard = async (req, res, next) => {
  try {
    const data = await service.getDashboard(req.profile);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboard };
