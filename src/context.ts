import { IConfig } from './config';
import { ILogger } from './logger';

export interface Context {
  config: IConfig;
  logger: ILogger;
}

export async function getContext(config: IConfig, logger: ILogger): Promise<Context> {
  return Promise.resolve({
    config,
    logger,
  });
}
