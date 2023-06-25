import { QueryFile } from 'pg-promise';
import { join } from 'path';
import { IQueryFile } from '../db';

export const migrations = {
  createMigrationTable: sql('migrations/createMigrationTable.sql'),
};

function sql(file: string): IQueryFile {
  const fullPath: string = join(__dirname, file);
  return new QueryFile(fullPath, {
    minify: true,
  });
}
