import { IConfig } from './config';
import { ILogger } from './logger';
import { getDb, IDatabase, waitDbConnect } from './data/db';

export interface Context {
  config: IConfig;
  logger: ILogger;
  db: IDatabase;
}

export async function getContext(config: IConfig, logger: ILogger): Promise<Context> {
  return waitDbConnect(getDb(config), 6).then((db) => {
    return {
      config,
      logger,
      db,
    };
  });
}
