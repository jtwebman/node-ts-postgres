module.exports = {
  port: process.env.PORT || '4000',
  loggerLevel: process.env.LOGGER_LEVEL || 'info',
  pgMigrationConnection:
    process.env.PG_MIGRATION_CONNECTION || 'postgres://postgres:postgres@db:5432/postgres',
  pgConnection: process.env.PG_CONNECTION || 'postgres://api:Password123!@db:5432/dev',
  pgPoolSize: parseInt(process.env.PG_POOL_SIZE, 10) || 50,
};
