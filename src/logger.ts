import winston from 'winston';
import { IConfig } from './config';

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  HTTP = 'http',
  VERBOSE = 'verbose',
  DEBUG = 'debug',
  SILLY = 'silly',
}

export interface ILoggerMethod {
  (message: string): void;
  (message: string, meta: object | unknown): void;
}

export interface ILogger {
  error: ILoggerMethod;
  warn: ILoggerMethod;
  info: ILoggerMethod;
  http: ILoggerMethod;
  verbose: ILoggerMethod;
  debug: ILoggerMethod;
  silly: ILoggerMethod;
  log: (level: LogLevel, message: string, meta?: object | unknown) => void;
}

function getWinstonLogger(config: IConfig): winston.Logger {
  let winstonFormat = winston.format.json();
  const metaData = {
    app: config.appName,
    version: config.appVersion,
    time: new Date().toISOString(),
  };

  if (process.env.NODE_ENV !== 'production') {
    winstonFormat = winston.format.combine(
      winston.format.json(),
      winston.format.prettyPrint(),
      winston.format.colorize(),
    );
  }

  return winston.createLogger({
    defaultMeta: metaData,
    transports: [
      new winston.transports.Console({
        level: config.loggerLevel,
        format: winstonFormat,
        handleExceptions: true,
        silent: process.env.NODE_ENV === 'test' && !process.env.SHOW_LOGS,
      }),
    ],
  });
}

export function getLogger(config: IConfig): ILogger {
  const winstonLogger = getWinstonLogger(config);
  return {
    error: (message: string, meta?: object | unknown) => winstonLogger.error(message, meta),
    warn: (message: string, meta?: object | unknown) => winstonLogger.warn(message, meta),
    info: (message: string, meta?: object | unknown) => winstonLogger.info(message, meta),
    http: (message: string, meta?: object | unknown) => winstonLogger.http(message, meta),
    verbose: (message: string, meta?: object | unknown) => winstonLogger.verbose(message, meta),
    debug: (message: string, meta?: object | unknown) => winstonLogger.debug(message, meta),
    silly: (message: string, meta?: object | unknown) => winstonLogger.silly(message, meta),
    log: (level: LogLevel, message: string, meta?: object | unknown) => winstonLogger.log(level, message, meta),
  };
}
