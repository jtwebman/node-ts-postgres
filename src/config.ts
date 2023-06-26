import nodeConfig from 'config';
import { LogLevel } from './logger';

function getEnumValueOrDefault<EnumType>(
  enumObject: object,
  value: string,
  defaultValue: EnumType,
): EnumType {
  if (Object.values(enumObject).includes(value)) {
    return value as EnumType;
  } else {
    return defaultValue;
  }
}

export interface IConfig {
  /** The app name */
  appName: string;
  /** The app version */
  appVersion: string;
  /** The port that the CMMS-API express server should bind to. */
  port: string;
  /** The logger level to actually output */
  loggerLevel: LogLevel;
  /** Postgres migration connection which is the user that can create the db, user, and run scripts */
  pgMigrationConnection: string;
  /** Postgres connection which is the db and user that the api service uses */
  pgConnection: string;
  /** Postgres connection pool size */
  pgPoolSize: number;
  /** Health Check settings */
  healthCheck: {
    /** The max event loop delay in ms to start failing at */
    maxEventLoopDelay: number;
    /** The max heap stack size in bytes to start failing at */
    maxHeapUsedBytes: number;
    /** On each req log stats to track event loop and heap size */
    logStatsOnReq: boolean;
    /** The max PG pool connections waiting to start failing at */
    maxPGWaitCount: number;
  };
}

const config: IConfig = {
  appName: nodeConfig.get<string>('appName'),
  appVersion: nodeConfig.get<string>('appVersion'),
  port: nodeConfig.get<string>('port'),
  loggerLevel: getEnumValueOrDefault<LogLevel>(
    LogLevel,
    nodeConfig.get<string>('loggerLevel'),
    LogLevel.INFO,
  ),
  pgMigrationConnection: nodeConfig.get<string>('pgMigrationConnection'),
  pgConnection: nodeConfig.get<string>('pgConnection'),
  pgPoolSize: nodeConfig.get<number>('pgPoolSize'),
  healthCheck: {
    maxEventLoopDelay: nodeConfig.get<number>('healthCheck.maxEventLoopDelay'),
    maxHeapUsedBytes: nodeConfig.get<number>('healthCheck.maxHeapUsedBytes'),
    logStatsOnReq: nodeConfig.get<boolean>('healthCheck.logStatsOnReq'),
    maxPGWaitCount: nodeConfig.get<number>('healthCheck.maxPGWaitCount'),
  },
};

export default config;
