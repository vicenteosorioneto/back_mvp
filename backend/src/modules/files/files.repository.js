const supabase = require('../../database/supabase');
const { toCamel, toSnake } = require('../../shared/mappers/fileMapper');
const AppError = require('../../shared/errors/AppError');

const TABLE = 'files';
const BUCKET = 'agro-files';

const handleSupabaseError = (error, context) => {
  throw new AppError(`Erro ao ${context}: ${error.message}`, 500);
};

const uploadToStorage = async (buffer, path, mimeType) => {
  const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType: mimeType,
    upsert: false,
  });
  if (error) handleSupabaseError(error, 'fazer upload do arquivo');

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return urlData.publicUrl;
};

const deleteFromStorage = async (storagePath) => {
  const { error } = await supabase.storage.from(BUCKET).remove([storagePath]);
  if (error) handleSupabaseError(error, 'deletar arquivo do storage');
};

const saveMetadata = async (data) => {
  const { data: created, error } = await supabase.from(TABLE).insert(toSnake(data)).select().single();
  if (error) handleSupabaseError(error, 'salvar metadados do arquivo');
  return toCamel(created);
};

const getAll = async (scope = null, filters = {}) => {
  let query = supabase.from(TABLE).select('*').order('created_at', { ascending: false });
  if (scope?.userId) query = query.eq('owner_id', scope.userId);
  if (filters.activityId) query = query.eq('activity_id', filters.activityId);
  if (filters.cultureId)  query = query.eq('culture_id', filters.cultureId);
  const { data, error } = await query;
  if (error) handleSupabaseError(error, 'buscar arquivos');
  return data.map(toCamel);
};

const getById = async (id) => {
  const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single();
  if (error) {
    if (error.code === 'PGRST116') return null;
    handleSupabaseError(error, 'buscar arquivo');
  }
  return toCamel(data);
};

const deleteMetadata = async (id) => {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) handleSupabaseError(error, 'deletar metadados do arquivo');
};

module.exports = {
  uploadToStorage,
  deleteFromStorage,
  saveMetadata,
  getAll,
  getById,
  deleteMetadata,
};
