const toCamel = (row) => ({
  id: row.id,
  ownerId: row.owner_id ?? null,
  activityId: row.activity_id ?? null,
  cultureId: row.culture_id ?? null,
  name: row.name,
  originalName: row.original_name ?? null,
  mimeType: row.mime_type ?? null,
  size: row.size ?? null,
  storagePath: row.storage_path,
  url: row.url ?? null,
  createdAt: row.created_at,
});

const toSnake = (data) => {
  const snake = {};
  if (data.ownerId !== undefined) snake.owner_id = data.ownerId;
  if (data.activityId !== undefined) snake.activity_id = data.activityId;
  if (data.cultureId !== undefined) snake.culture_id = data.cultureId;
  if (data.name !== undefined) snake.name = data.name;
  if (data.originalName !== undefined) snake.original_name = data.originalName;
  if (data.mimeType !== undefined) snake.mime_type = data.mimeType;
  if (data.size !== undefined) snake.size = data.size;
  if (data.storagePath !== undefined) snake.storage_path = data.storagePath;
  if (data.url !== undefined) snake.url = data.url;
  return snake;
};

module.exports = { toCamel, toSnake };
