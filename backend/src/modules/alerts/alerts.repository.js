const supabase = require('../../database/supabase');
const { toCamel, toSnake } = require('../../shared/mappers/alertMapper');
const AppError = require('../../shared/errors/AppError');

const TABLE = 'alerts';

const handleSupabaseError = (error, context) => {
  throw new AppError(`Erro ao ${context}: ${error.message}`, 500);
};

const getAll = async (scope = null) => {
  let query = supabase
    .from(TABLE)
    .select('*')
    .order('read', { ascending: true })
    .order('created_at', { ascending: false });

  if (scope?.userId) query = query.eq('owner_id', scope.userId);

  const { data, error } = await query;
  if (error) handleSupabaseError(error, 'buscar alertas');
  return data.map(toCamel);
};

const getCount = async (ownerId = null) => {
  let totalQuery = supabase.from(TABLE).select('id', { count: 'exact', head: true });
  let unreadQuery = supabase.from(TABLE).select('id', { count: 'exact', head: true }).eq('read', false);
  if (ownerId) {
    totalQuery = totalQuery.eq('owner_id', ownerId);
    unreadQuery = unreadQuery.eq('owner_id', ownerId);
  }
  const [{ count: total }, { count: unread }] = await Promise.all([totalQuery, unreadQuery]);
  return { total: total || 0, unread: unread || 0, read: (total || 0) - (unread || 0) };
};

const getById = async (id) => {
  const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single();
  if (error) {
    if (error.code === 'PGRST116') return null;
    handleSupabaseError(error, 'buscar alerta');
  }
  return toCamel(data);
};

const createMany = async (alerts) => {
  if (!alerts.length) return [];
  const { data, error } = await supabase.from(TABLE).insert(alerts.map(toSnake)).select();
  if (error) handleSupabaseError(error, 'criar alertas');
  return data.map(toCamel);
};

const markAsRead = async (id) => {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ read: true })
    .eq('id', id)
    .select()
    .single();
  if (error) {
    if (error.code === 'PGRST116') return null;
    handleSupabaseError(error, 'marcar alerta como lido');
  }
  return toCamel(data);
};

const markAllAsRead = async (ownerId = null) => {
  let query = supabase.from(TABLE).update({ read: true }).eq('read', false);
  if (ownerId) query = query.eq('owner_id', ownerId);
  const { error } = await query;
  if (error) handleSupabaseError(error, 'marcar todos alertas como lidos');
};

const deleteAlert = async (id) => {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) handleSupabaseError(error, 'deletar alerta');
};

const existsUnread = async (ownerId, type, referenceId) => {
  let query = supabase
    .from(TABLE)
    .select('id')
    .eq('type', type)
    .eq('read', false);
  if (ownerId) query = query.eq('owner_id', ownerId);
  if (referenceId) query = query.eq('reference_id', referenceId);
  const { data } = await query.limit(1);
  return data && data.length > 0;
};

module.exports = { getAll, getCount, getById, createMany, markAsRead, markAllAsRead, delete: deleteAlert, existsUnread };
