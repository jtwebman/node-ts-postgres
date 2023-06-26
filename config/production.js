module.exports = {
  port: process.env.PORT || '4000',
  loggerLevel: process.env.LOGGER_LEVEL || 'info',
  pgMigrationConnection:
    process.env.PG_MIGRATION_CONNECTION || 'postgres://postgres:postgres@db:5432/postgres',
  pgConnection: process.env.PG_CONNECTION || 'postgres://api:Password123!@db:5432/dev',
  pgPoolSize: parseInt(process.env.PG_POOL_SIZE, 10) || 50,
  healthCheck: {
    maxEventLoopDelay: parseInt(process.env.HEALTH_CHECK_MAX_EVENT_LOOP_DELAY, 10) || 42, // default 42 ms
    maxHeapUsedBytes: parseInt(process.env.HEALTH_CHECK_MAX_HEAP_USED_BYTES, 10) || 1932735283, // default 1.8 gig
    logStatsOnReq: process.env.HEALTH_CHECK_LOG_STATS_ON_REQ === 'true',
    maxPGWaitCount: parseInt(process.env.HEALTH_CHECK_MAX_PG_WAIT_COUNT, 10) || 25,
  },
};
