const service = require('./weather.service');

const getWeather = async (req, res, next) => {
  try {
    const data = await service.getWeather();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

module.exports = { getWeather };
