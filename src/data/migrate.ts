import fs from 'fs';
import path from 'path';
import { QueryFile } from 'pg-promise';
import { parse } from 'pg-connection-string';
import { ILogger } from '../logger';
import { IConfig } from '../config';
import { IConnectionParameters, getDbWith, getMigrationDb, waitDbConnect } from './db';
import * as migrations from './repos/migrations';

export async function runMigrations(
  config: IConfig,
  logger: ILogger,
  patchFolder: string,
): Promise<void> {
  try {
    if (!config.pgConnection && !config.pgMigrationConnection) {
      const missingSettings = [];
      if (!config.pgConnection) {
        missingSettings.push('PG_CONNECTION');
      }
      if (!config.pgMigrationConnection) {
        missingSettings.push('PG_MIGRATION_CONNECTION');
      }
      throw new Error(`Missing environment variables ${missingSettings.join(' and ')}.`);
    }

    const pgMigrationConfig = parse(config.pgMigrationConnection);
    const pgConfig = parse(config.pgConnection);

    if (!pgConfig.database) {
      throw new Error('PG_CONNECTION must contain database name.');
    }

    if (!pgConfig.user || !pgConfig.password) {
      throw new Error('PG_CONNECTION missing user and password.');
    }

    const migrationAdminDB = getMigrationDb(config);
    await waitDbConnect(migrationAdminDB);

    logger.info(`Checking db ${pgConfig.database} exists.`);

    if (!(await migrations.databaseExists(migrationAdminDB, pgConfig.database))) {
      logger.info(`Creating db ${pgConfig.database}.`);
      await migrations.createDatabase(migrationAdminDB, pgConfig.database);
    }

    migrationAdminDB.$pool.end();

    const newDbConnection: IConnectionParameters = {
      database: pgConfig.database,
    };
    if (pgMigrationConfig.host) {
      newDbConnection.host = pgMigrationConfig.host;
    }
    if (pgMigrationConfig.port) {
      newDbConnection.port = parseInt(pgMigrationConfig.port, 10);
    }
    if (pgMigrationConfig.user) {
      newDbConnection.user = pgMigrationConfig.user;
    }
    if (pgMigrationConfig.password) {
      newDbConnection.password = pgMigrationConfig.password;
    }

    const migrationDB = getDbWith(config, newDbConnection);
    await waitDbConnect(migrationDB);

    if (pgConfig.user && pgConfig.password) {
      logger.info(`Checking user ${pgConfig.user} exists.`);
      if (!(await migrations.userExists(migrationDB, pgConfig.user))) {
        logger.info(`Creating user ${pgConfig.user}.`);
        await migrations.createUser(migrationDB, pgConfig.user, pgConfig.password);
      }
    }

    logger.info('Checking migration table exists.');
    if (!(await migrations.migrationTableExists(migrationDB))) {
      logger.info('Creating migration table.');
      await migrations.createMigrationTable(migrationDB);
    }

    const currentAppliedPatches = await migrations.getCurrentMigrations(migrationDB);

    const patchesToRun = fs
      .readdirSync(patchFolder, { withFileTypes: true })
      .filter(
        (dirent) =>
          dirent.isFile() &&
          dirent.name.charAt(0) !== '.' &&
          dirent.name.endsWith('.sql') &&
          !currentAppliedPatches.includes(dirent.name),
      )
      .map((dirent) => dirent.name)
      .sort();

    for (let i = 0, len = patchesToRun.length; i < len; i++) {
      const filename = patchesToRun[i];
      try {
        logger.info(`Running ${filename}.`);
        const sql = new QueryFile(path.join(patchFolder, filename), { noWarnings: true });
        await migrationDB.any(sql);
        await migrations.insertMigration(migrationDB, filename);
      } catch (error) {
        let message = 'Unknown Error';
        if (error instanceof Error) message = error.stack || error.message;
        logger.error(`Error Running ${filename}: ${message}`);
      }
    }

    logger.info(
      `Granting user ${pgConfig.user} all permissions needed in db ${pgConfig.database}.`,
    );
    await migrations.grantUserDatabaseAccess(migrationDB, pgConfig.database, pgConfig.user);
    await migrations.grantUserSchemaAccess(migrationDB, 'public', pgConfig.user);
    await migrations.grantUserSchemaTablesAccess(migrationDB, 'public', pgConfig.user);
    await migrations.grantUserSchemaSequencesAccess(migrationDB, 'public', pgConfig.user);
    await migrations.grantUserSchemaFunctionsAccess(migrationDB, 'public', pgConfig.user);

    /* shutdown migration connection pool */
    migrationDB.$pool.end();
  } catch (error) {
    let message = 'Unknown Error';
    if (error instanceof Error) message = error.stack || error.message;
    logger.error(`Error running migrations: ${message}`);
    throw error;
  }
}

module.exports = {
  runMigrations,
};
