const supabase = require('../../database/supabase');
const { toCamel, toSnake } = require('../../shared/mappers/cultureMapper');
const AppError = require('../../shared/errors/AppError');

const TABLE = 'cultures';

const handleSupabaseError = (error, context) => {
  throw new AppError(`Erro ao ${context}: ${error.message}`, 500);
};

const buildScopeQuery = (query, { userId, role, allowedIds = [] }) => {
  if (role === 'admin') return query;
  if (role === 'tecnico') return query.in('owner_id', allowedIds.length ? allowedIds : [userId]);
  return query.eq('owner_id', userId);
};

const getAll = async (scope = null) => {
  let query = supabase.from(TABLE).select('*').order('created_at', { ascending: false });
  if (scope) query = buildScopeQuery(query, scope);
  const { data, error } = await query;
  if (error) handleSupabaseError(error, 'buscar culturas');
  return data.map(toCamel);
};

const getById = async (id) => {
  const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single();
  if (error) {
    if (error.code === 'PGRST116') return null;
    handleSupabaseError(error, 'buscar cultura');
  }
  return toCamel(data);
};

const create = async (data) => {
  const { data: created, error } = await supabase.from(TABLE).insert(toSnake(data)).select().single();
  if (error) handleSupabaseError(error, 'criar cultura');
  return toCamel(created);
};

const update = async (id, data) => {
  const { data: updated, error } = await supabase
    .from(TABLE)
    .update({ ...toSnake(data), updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) {
    if (error.code === 'PGRST116') return null;
    handleSupabaseError(error, 'atualizar cultura');
  }
  return toCamel(updated);
};

const deleteCulture = async (id) => {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) handleSupabaseError(error, 'deletar cultura');
};

const getActivitiesByCultureId = async (cultureId) => {
  const { data, error } = await supabase
    .from('activities')
    .select('id')
    .eq('culture_id', cultureId);
  if (error) handleSupabaseError(error, 'buscar atividades da cultura');
  return data;
};

module.exports = { getAll, getById, create, update, delete: deleteCulture, getActivitiesByCultureId };
