import { join } from 'path';
import config from './config';
import { getLogger } from './logger';
import { runMigrations } from './data/migrate';

const logger = getLogger(config);

runMigrations(config, logger, join(__dirname, '../db-migrations'));
