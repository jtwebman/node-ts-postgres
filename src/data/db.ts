import pgPromise from 'pg-promise';
import retry from 'async-retry';
import { IConfig } from '../config';
import { IContext } from '../context';

export interface IQueryFile {
  readonly error: Error;
  readonly file: string;
  readonly options: any;
  prepare: () => void;
  toString: () => string;
}

export interface IConnectionParameters {
  host?: string;
  password?: string;
  user?: string;
  port?: number;
  database: string | undefined;
}

export interface IDatabaseConnection {
  done: () => void;
}

export interface IDatabaseExecute {
  manyOrNone: <ValType, ReturnType>(
    query: string | IQueryFile,
    values?: ValType,
  ) => Promise<ReturnType[]>;
  none: <ValType>(query: string | IQueryFile, values?: ValType) => Promise<null>;
  one: <ValType, ReturnType>(query: string | IQueryFile, values?: ValType) => Promise<ReturnType>;
}

export interface IDatabase extends IDatabaseExecute {
  /** get new db client */
  connect: () => Promise<IDatabaseConnection>;
  $pool: {
    waitingCount: number;
  };
}

function getPgp(config: IConfig) {
  const pgpConfig = {
    capSQL: true,
    noWarnings: true,
    query: (e: { query: string }) => {
      if (process.env.SHOW_SQL === '1') {
        console.log(e.query);
      }
    },
  };

  const pgp = pgPromise(pgpConfig);
  pgp.pg.defaults.max = config.pgPoolSize;
  return pgp;
}

/**
 * Get a database based on the connection passed in
 * @param config the current config
 * @param connection the connect string or connect object settings
 * @returns the db you wanted to connect too
 */
export function getDbWith<Ext>(config: IConfig, connection: string | IConnectionParameters) {
  return getPgp(config)<Ext>(connection);
}

/**
 * Gets the current migration connection for running db changes
 * @param config the current config
 * @returns returs the current migration db
 */
export function getMigrationDb<Ext>(config: IConfig) {
  return getPgp(config)<Ext>(config.pgMigrationConnection);
}

/**
 * Get the current api db connection
 * @param config the current config
 * @returns returns the current db
 */
export function getDb<Ext>(config: IConfig) {
  return getPgp(config)<Ext>(config.pgConnection);
}

/**
 * Use to wait till we can connect to the postgres db to continue
 * @param db the current db
 * @param retries the number of times to retry with expendential backoff
 * @returns returns a promsie of the db passed to it once it connects and releases the connection
 */
export function waitDbConnect(db: IDatabase, retries = 6): Promise<IDatabase> {
  return retry<IDatabase>(
    async () => {
      const conn = await db.connect();
      conn.done();
      return db;
    },
    {
      retries,
    },
  );
}

/**
 * Check the current DB connection pool and if over the wait count setting returns the count else it returns 0
 * @param db the current db
 * @param config the current config
 * @returns return 0 if under the maxPGWaitCount and in good status and the current wait count if over and in a bad status
 */
export function checkStatus(db: IDatabase, config: IConfig): number {
  const pgWaitCount = db.$pool.waitingCount;
  if (config.healthCheck.maxPGWaitCount > pgWaitCount) {
    return 0;
  }
  return pgWaitCount;
}
