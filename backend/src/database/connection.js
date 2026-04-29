// Placeholder for future DB connection (e.g., PostgreSQL/Prisma)
// For now, using JSON files
const { readJsonFile, writeJsonFile } = require('../shared/utils/fileStorage');

const CULTURES_FILE = './src/database/json/cultures.json';
const ACTIVITIES_FILE = './src/database/json/activities.json';

module.exports = {
  readCultures: () => readJsonFile(CULTURES_FILE),
  writeCultures: (data) => writeJsonFile(CULTURES_FILE, data),
  readActivities: () => readJsonFile(ACTIVITIES_FILE),
  writeActivities: (data) => writeJsonFile(ACTIVITIES_FILE, data),
};
