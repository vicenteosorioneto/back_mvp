const supabase = require('../../database/supabase');
const { toCamel, toSnake } = require('../../shared/mappers/propertyMapper');
const AppError = require('../../shared/errors/AppError');

const TABLE = 'properties';

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
  if (error) handleSupabaseError(error, 'buscar propriedades');
  return data.map(toCamel);
};

const getById = async (id) => {
  const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single();
  if (error) {
    if (error.code === 'PGRST116') return null;
    handleSupabaseError(error, 'buscar propriedade');
  }
  return toCamel(data);
};

const create = async (data) => {
  const { data: created, error } = await supabase.from(TABLE).insert(toSnake(data)).select().single();
  if (error) handleSupabaseError(error, 'criar propriedade');
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
    handleSupabaseError(error, 'atualizar propriedade');
  }
  return toCamel(updated);
};

const deleteProperty = async (id) => {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) handleSupabaseError(error, 'deletar propriedade');
};

module.exports = { getAll, getById, create, update, delete: deleteProperty };
