import pgPromise from 'pg-promise';
import retry from 'async-retry';
import { IConfig } from '../config';

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

export function getDbWith<Ext>(config: IConfig, connection: string | IConnectionParameters) {
  return getPgp(config)<Ext>(connection);
}

export function getMigrationDb<Ext>(config: IConfig) {
  return getPgp(config)<Ext>(config.pgMigrationConnection);
}

export function getDb<Ext>(config: IConfig) {
  return getPgp(config)<Ext>(config.pgConnection);
}

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
