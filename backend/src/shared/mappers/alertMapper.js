const toCamel = (row) => ({
  id: row.id,
  ownerId: row.owner_id ?? null,
  type: row.type,
  message: row.message,
  severity: row.severity,
  referenceId: row.reference_id ?? null,
  referenceType: row.reference_type ?? null,
  read: row.read,
  createdAt: row.created_at,
});

const toSnake = (data) => {
  const snake = {};
  if (data.ownerId !== undefined) snake.owner_id = data.ownerId;
  if (data.type !== undefined) snake.type = data.type;
  if (data.message !== undefined) snake.message = data.message;
  if (data.severity !== undefined) snake.severity = data.severity;
  if (data.referenceId !== undefined) snake.reference_id = data.referenceId;
  if (data.referenceType !== undefined) snake.reference_type = data.referenceType;
  if (data.read !== undefined) snake.read = data.read;
  return snake;
};

module.exports = { toCamel, toSnake };
