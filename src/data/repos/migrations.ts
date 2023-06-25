import { IDatabaseExecute } from '../db';
import { migrations as sql } from '../sql';

export async function createDatabase(db: IDatabaseExecute, name: string): Promise<null> {
  return db.none<[string]>('CREATE DATABASE $1:name', [name]);
}

export async function createMigrationTable(db: IDatabaseExecute): Promise<null> {
  return db.none<void>(sql.createMigrationTable);
}

export async function createUser(
  db: IDatabaseExecute,
  username: string,
  password: string,
): Promise<null> {
  return db.none<[string, string]>('CREATE USER $1:name WITH ENCRYPTED PASSWORD $2', [
    username,
    password,
  ]);
}

export async function databaseExists(db: IDatabaseExecute, name: string): Promise<boolean> {
  const results = await db.one<[string], { exists: boolean }>(
    'SELECT EXISTS (SELECT FROM pg_database WHERE datname = $1)',
    [name],
  );
  return results.exists;
}

export async function getCurrentMigrations(db: IDatabaseExecute): Promise<string[]> {
  const results = await db.manyOrNone<void, { filename: string }>(
    'SELECT filename FROM migrations',
  );
  return results.map((r) => r.filename);
}

export async function grantUserDatabaseAccess(
  db: IDatabaseExecute,
  database: string,
  username: string,
): Promise<null> {
  return db.none<[string, string]>('GRANT CONNECT, TEMP ON DATABASE $1:name TO $2:name', [
    database,
    username,
  ]);
}

export async function grantUserSchemaAccess(
  db: IDatabaseExecute,
  schema: string,
  username: string,
): Promise<null> {
  return db.none<[string, string]>('GRANT USAGE ON SCHEMA $1:name TO $2:name', [schema, username]);
}

export async function grantUserSchemaFunctionsAccess(
  db: IDatabaseExecute,
  schema: string,
  username: string,
): Promise<null> {
  return db.none<[string, string]>('GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA $1:name TO $2:name', [
    schema,
    username,
  ]);
}

export async function grantUserSchemaSequencesAccess(
  db: IDatabaseExecute,
  schema: string,
  username: string,
): Promise<null> {
  return db.none<[string, string]>(
    'GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA $1:name TO $2:name',
    [schema, username],
  );
}

export async function grantUserSchemaTablesAccess(
  db: IDatabaseExecute,
  schema: string,
  username: string,
): Promise<null> {
  return db.none<[string, string]>(
    'GRANT SELECT, INSERT, UPDATE, DELETE, REFERENCES, TRIGGER ON ALL TABLES IN SCHEMA $1:name TO $2:name',
    [schema, username],
  );
}

export async function insertMigration(db: IDatabaseExecute, filename: string): Promise<null> {
  return db.none<[string]>('INSERT INTO migrations (filename) VALUES ($1)', [filename]);
}

export async function migrationTableExists(db: IDatabaseExecute): Promise<boolean> {
  return tableExists(db, 'public', 'migrations');
}

export async function tableExists(
  db: IDatabaseExecute,
  schema: string,
  name: string,
): Promise<boolean> {
  const results = await db.one<[string, string], { exists: boolean }>(
    'SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = $1 AND table_name = $2)',
    [schema, name],
  );
  return results.exists;
}

export async function userExists(db: IDatabaseExecute, name: string): Promise<boolean> {
  const results = await db.one<[string], { exists: boolean }>(
    'SELECT EXISTS (SELECT FROM pg_roles WHERE rolname = $1)',
    [name],
  );
  return results.exists;
}
