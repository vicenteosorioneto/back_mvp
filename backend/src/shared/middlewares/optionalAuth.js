const supabase = require('../../database/supabase');

const decodeJwt = (token) => {
  try {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf8'));
  } catch {
    return null;
  }
};

const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return next();

  const token   = authHeader.split(' ')[1];
  const payload = decodeJwt(token);

  if (!payload?.sub || (payload.exp && payload.exp < Date.now() / 1000)) {
    return next();
  }

  const { data: { user } } = await supabase.auth.admin.getUserById(payload.sub);

  if (user) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    req.user    = user;
    req.profile = profile || { id: user.id, role: 'produtor' };
  }

  next();
};

module.exports = optionalAuth;
