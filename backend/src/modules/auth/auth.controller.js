const service = require('./auth.service');

const register = async (req, res, next) => {
  try {
    const user = await service.register(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await service.login(req.body);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) await service.logout(token);
    res.json({ success: true, message: 'Logout realizado com sucesso' });
  } catch (err) {
    next(err);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const profile = await service.getProfile(req.profile.id);
    res.json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const profile = await service.updateProfile(req.profile.id, req.body);
    res.json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, logout, getProfile, updateProfile };
