const packageJson = require('../package.json');

module.exports = {
  appName: packageJson.name,
  appVersion: packageJson.version,
  port: process.env.PORT || '4000',
  loggerLevel: process.env.LOGGER_LEVEL || 'info',
  pgMigrationConnection:
    process.env.PG_MIGRATION_CONNECTION || 'postgres://postgres:postgres@localhost:5432/postgres',
  pgConnection: process.env.PG_CONNECTION || 'postgres://api:Password123!@localhost:5432/dev',
  pgPoolSize: parseInt(process.env.PG_POOL_SIZE, 10) || 50,
};
