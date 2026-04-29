const repository = require('./properties.repository');
const AppError = require('../../shared/errors/AppError');

const buildScope = (profile) => {
  if (!profile) return null;
  return { userId: profile.id, role: profile.role, allowedIds: profile.allowedIds || [] };
};

const getAll = async (profile) => {
  return await repository.getAll(buildScope(profile));
};

const getById = async (id, profile) => {
  const property = await repository.getById(id);
  if (!property) throw new AppError('Propriedade não encontrada', 404);
  if (profile && profile.role !== 'admin' && property.ownerId !== profile.id) {
    throw new AppError('Acesso não autorizado', 403);
  }
  return property;
};

const create = async (data, profile) => {
  if (!data.name || !String(data.name).trim()) throw new AppError('Nome é obrigatório', 400);
  return await repository.create({
    ...data,
    ownerId: profile?.id || null,
  });
};

const update = async (id, data, profile) => {
  const existing = await repository.getById(id);
  if (!existing) throw new AppError('Propriedade não encontrada', 404);
  if (profile && profile.role !== 'admin' && existing.ownerId !== profile.id) {
    throw new AppError('Acesso não autorizado', 403);
  }
  const updated = await repository.update(id, data);
  if (!updated) throw new AppError('Propriedade não encontrada', 404);
  return updated;
};

const deleteProperty = async (id, profile) => {
  const existing = await repository.getById(id);
  if (!existing) throw new AppError('Propriedade não encontrada', 404);
  if (profile && profile.role !== 'admin' && existing.ownerId !== profile.id) {
    throw new AppError('Acesso não autorizado', 403);
  }
  await repository.delete(id);
};

module.exports = { getAll, getById, create, update, delete: deleteProperty };
