import express from 'express';
import { Request, Response } from 'express';
import morgan from 'morgan';
import { IContext } from '../context';

const { getStatusRouter } = require('./status');

export function getApp(context: IContext) {
  const app = express();

  app.disable('x-powered-by');
  app.set('etag', false);

  app.use(
    morgan(':method :url :status :res[content-length] - :response-time ms', {
      stream: {
        write: (data) => {
          context.logger.info(data);
        },
      },
      skip: (req) => {
        if (req.baseUrl === '/status' || req.baseUrl === '/status/liveness') {
          return true;
        }
        return false;
      },
    }),
  );

  app.use('/status', getStatusRouter(context));

  app.use((err: Error, req: Request, res: Response) => {
    context.logger.error(`Unhandled error calling route ${req.method} ${req.originalUrl}`, {
      stack: err.stack,
      message: err.message,
    });

    res.status(500).json({ errors: [{ message: err.message, slug: 'unknown-error' }] });
  });

  return app;
}
