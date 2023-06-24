import nodeConfig from 'config';
import { LogLevel } from './logger';

function getEnumValueOrDefault<EnumType>(enumObject: object, value: string, defaultValue: EnumType): EnumType {
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
}

const config: IConfig = {
  appName: nodeConfig.get<string>('appName'),
  appVersion: nodeConfig.get<string>('appVersion'),
  port: nodeConfig.get<string>('port'),
  loggerLevel: getEnumValueOrDefault<LogLevel>(LogLevel, nodeConfig.get<string>('loggerLevel'), LogLevel.INFO),
};

export default config;
