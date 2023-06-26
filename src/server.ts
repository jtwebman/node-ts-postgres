import express from 'express';
import stoppable from 'stoppable';
import config from './config';
import { getLogger } from './logger';
import { getContext, IContext } from './context.js';
import { getApp } from './routers/app';

const logger = getLogger(config);

const port = config.port;

interface KillSignals {
  SIGHUP: number;
  SIGINT: number;
  SIGUSR2: number;
  SIGTERM: number;
}

const killSignals: KillSignals = {
  SIGHUP: 1,
  SIGINT: 2,
  SIGUSR2: 12,
  SIGTERM: 15,
};

function shutdown(app: stoppable.StoppableServer, context: IContext, signal: keyof KillSignals) {
  context.logger.info(`Trying shutdown, got signal ${signal}`);
  app.stop(() => {
    context.logger.info('Node app stopped.');
    process.exit(killSignals[signal]);
  });
}

function startServer(context: IContext) {
  const app = getApp(context);
  const nodeApp = stoppable(
    app.listen(port, () =>
      context.logger.info(
        `${context.config.appName} ${context.config.appVersion} is listening on port ${port}.`,
      ),
    ),
  );

  nodeApp.timeout = 0;
  nodeApp.keepAliveTimeout = 61000; // 61 secs
  nodeApp.headersTimeout = 65000; // 65 secs

  process.once('SIGUSR2', () => shutdown(nodeApp, context, 'SIGUSR2'));
  process.once('SIGHUP', () => shutdown(nodeApp, context, 'SIGHUP'));
  process.once('SIGINT', () => shutdown(nodeApp, context, 'SIGINT'));
  process.once('SIGTERM', () => shutdown(nodeApp, context, 'SIGTERM'));

  process.on('unhandledRejection', (error: Error, promise) => {
    console.log(`unhandledRejection at: ${promise} `, {
      stack: error.stack,
      error: JSON.stringify(error),
    });
  });

  process.on('uncaughtException', (error) => {
    console.log(`uncaughtException: ${error.message}`, {
      stack: error.stack,
      error: JSON.stringify(error),
    });
  });
}

getContext(config, logger)
  .then(startServer)
  .catch((error: { stack: string }) => {
    logger.info(`Failed to start ${config.appName}: ${error.stack}`);
    process.exit(1);
  });
