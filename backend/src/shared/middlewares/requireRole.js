const AppError = require('../errors/AppError');

const requireRole = (...roles) => (req, res, next) => {
  if (!req.profile) {
    return next(new AppError('Não autenticado', 401));
  }
  if (!roles.includes(req.profile.role)) {
    return next(new AppError('Acesso não autorizado para este perfil', 403));
  }
  next();
};

module.exports = requireRole;
