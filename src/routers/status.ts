import { Response, Router } from 'express';
import overload from 'overload-protection';
import { IContext } from '../context';
import { checkStatus } from '../data/db';

export function getStatusRouter(context: IContext): Router {
  const router = Router();

  const protect = overload('http', {
    maxEventLoopDelay: context.config.healthCheck.maxEventLoopDelay,
    maxHeapUsedBytes: context.config.healthCheck.maxHeapUsedBytes,
    logging: (data) =>
      typeof data === 'string'
        ? context.logger.warn(`Node status failed because: ${data}`)
        : context.logger.info('Node stats', data),
    logStatsOnReq: context.config.healthCheck.logStatsOnReq === false ? false : undefined,
  });

  /**
   * GET /status
   *
   * Checks Node.js and Postgres status before returning 200 OK.
   * If either are in a bad staate it returns 503 Service Unavailable.
   */
  router.get('/', protect, (req, res) => {
    const currentWaitCount = checkStatus(context.db, context.config);
    if (currentWaitCount === 0) {
      return res.send('OK');
    }
    context.logger.info(`PG wait count high at ${currentWaitCount}`);
    return res.status(503).send();
  });

  /**
   * GET /status/liveness
   *
   * Returns 200 OK if the service is up and running.
   */
  router.get('/liveness', (_req, res: Response) => {
    res.json({ status: 'OK' });
  });

  return router;
}
