import {SchedulerFacadeApplication} from '../..';
import {
  createRestAppClient,
  givenHttpServerConfig,
  Client,
} from '@loopback/testlab';
import {RateLimitSecurityBindings} from 'loopback4-ratelimiter';

export async function setupApplication(): Promise<AppWithClient> {
  const restConfig = givenHttpServerConfig({
    // Customize the server configuration here.
    // Empty values (undefined, '') will be ignored by the helper.
    //
    // host: process.env.HOST,
    // port: +process.env.PORT,
  });
  setUpEnv();

  const app = new SchedulerFacadeApplication({
    rest: restConfig,
  });

  app.bind(`datasources.config.${process.env.REDIS_NAME}`).to({
    name: process.env.REDIS_NAME,
    connector: 'kv-memory',
  });

  app.bind(RateLimitSecurityBindings.RATELIMIT_SECURITY_ACTION).to(async () => {
    /* nothing here */
  });

  await app.boot();
  await app.start();

  const client = createRestAppClient(app);

  return {app, client};
}

function setUpEnv() {
  process.env.NODE_ENV = 'test';
  process.env.ENABLE_TRACING = '0';
  process.env.ENABLE_OBF = '0';
  process.env.REDIS_NAME = 'redis';
}

export interface AppWithClient {
  app: SchedulerFacadeApplication;
  client: Client;
}
