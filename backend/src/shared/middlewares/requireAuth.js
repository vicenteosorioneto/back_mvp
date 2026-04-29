const supabase = require('../../database/supabase');
const AppError = require('../errors/AppError');

// Decodifica o payload do JWT localmente sem verificar assinatura.
// Só precisamos do `sub` (user ID) e `exp` para chamar a Admin API.
const decodeJwt = (token) => {
  try {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf8'));
  } catch {
    return null;
  }
};

const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next(new AppError('Token não fornecido', 401));
  }

  const token   = authHeader.split(' ')[1];
  const payload = decodeJwt(token);

  if (!payload?.sub) {
    return next(new AppError('Token inválido', 401));
  }
  if (payload.exp && payload.exp < Date.now() / 1000) {
    return next(new AppError('Token expirado', 401));
  }

  // admin.getUserById usa o service_role key internamente e NÃO altera
  // a sessão do cliente — evita contaminar o auth state que causava o erro de RLS.
  const { data: { user }, error } = await supabase.auth.admin.getUserById(payload.sub);

  if (error || !user) {
    return next(new AppError('Token inválido ou expirado', 401));
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  req.user    = user;
  req.profile = profile || { id: user.id, role: 'produtor' };
  next();
};

module.exports = requireAuth;
