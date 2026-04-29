const supabase = require('../../database/supabase');
const AppError = require('../../shared/errors/AppError');

const register = async (data) => {
  // Validar que os campos obrigatórios existem
  const { name, email, password, role = 'produtor' } = data;

  // Mensagens de erro detalhadas
  if (!name) throw new AppError('Campo "name" (nome) é obrigatório', 400);
  if (!email) throw new AppError('Campo "email" é obrigatório', 400);
  if (!password) throw new AppError('Campo "password" (senha) é obrigatório', 400);

  // Validar formato do email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new AppError('Email inválido. Use formato: user@example.com', 400);
  }

  // Validar tamanho mínimo da senha
  if (password.length < 6) {
    throw new AppError('Senha deve ter no mínimo 6 caracteres', 400);
  }

  if (!['admin', 'produtor', 'tecnico'].includes(role)) {
    throw new AppError('Perfil inválido. Use: admin, produtor ou tecnico', 400);
  }

  const { data: authData, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, role },
  });

  if (error) throw new AppError(`Erro ao registrar: ${error.message}`, 400);

  const { position } = data;

  const { error: profileError } = await supabase.from('user_profiles').insert({
    id: authData.user.id,
    name,
    email,
    role,
    ...(position ? { position } : {}),
  });

  if (profileError) throw new AppError(`Erro ao criar perfil: ${profileError.message}`, 500);

  return {
    id: authData.user.id,
    name,
    email,
    role,
    position: position || null,
  };
};

const login = async ({ email, password }) => {
  if (!email || !password) throw new AppError('Email e senha são obrigatórios', 400);

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) throw new AppError('Email ou senha inválidos', 401);

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('id, name, email, role')
    .eq('id', data.user.id)
    .single();

  return {
    token: data.session.access_token,
    refreshToken: data.session.refresh_token,
    expiresAt: data.session.expires_at,
    user: profile || { id: data.user.id, email, role: 'produtor' },
  };
};

const logout = async (token) => {
  const { error } = await supabase.auth.admin.signOut(token);
  if (error) throw new AppError(`Erro ao fazer logout: ${error.message}`, 500);
};

const getProfile = async (userId) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) throw new AppError('Perfil não encontrado', 404);
  return data;
};

const updateProfile = async (userId, body) => {
  const { name, position } = body;
  if (!name && position === undefined) throw new AppError('Nenhum campo para atualizar', 400);

  const updates = { updated_at: new Date().toISOString() };
  if (name) updates.name = name;
  if (position !== undefined) updates.position = position;

  const { data, error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw new AppError(`Erro ao atualizar perfil: ${error.message}`, 500);
  return data;
};

module.exports = { register, login, logout, getProfile, updateProfile };
