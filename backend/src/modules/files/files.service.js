const { v4: uuidv4 } = require('uuid');
const path = require('path');
const repository = require('./files.repository');
const AppError = require('../../shared/errors/AppError');

const ALLOWED_MIME_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const upload = async (file, { activityId, cultureId } = {}, profile) => {
  if (!file) throw new AppError('Nenhum arquivo enviado', 400);
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    throw new AppError('Tipo de arquivo não permitido. Use: imagens, PDF ou Word', 400);
  }

  const ext = path.extname(file.originalname);
  const storagePath = `${profile?.id || 'public'}/${uuidv4()}${ext}`;

  const publicUrl = await repository.uploadToStorage(file.buffer, storagePath, file.mimetype);

  const metadata = await repository.saveMetadata({
    ownerId: profile?.id || null,
    activityId: activityId || null,
    cultureId: cultureId || null,
    name: `${uuidv4()}${ext}`,
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    storagePath,
    url: publicUrl,
  });

  return metadata;
};

const getAll = async (profile, filters = {}) => {
  const scope = profile ? { userId: profile.id } : null;
  return await repository.getAll(scope, filters);
};

const deleteFile = async (id, profile) => {
  const file = await repository.getById(id);
  if (!file) throw new AppError('Arquivo não encontrado', 404);
  if (profile && profile.role !== 'admin' && file.ownerId !== profile.id) {
    throw new AppError('Acesso não autorizado', 403);
  }

  await repository.deleteFromStorage(file.storagePath);
  await repository.deleteMetadata(id);
};

module.exports = { upload, getAll, delete: deleteFile };
