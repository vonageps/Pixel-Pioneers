import {
  inject,
  lifeCycleObserver,
  LifeCycleObserver,
  JSONObject,
} from '@loopback/core';
import {juggler} from '@loopback/repository';
import * as config from './verification-rest.datasource.config.json';
// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class VerificationRestDataSource
  extends juggler.DataSource
  implements LifeCycleObserver
{
  static dataSourceName = 'verificationRest';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.verificationRest', {optional: true})
    dsConfig: object = config,
  ) {
    const dsConfigJson = dsConfig as JSONObject;
    if (dsConfigJson.default) {
      Object.assign(dsConfigJson.default, {
        options: {baseUrl: process.env.VERIFICATION_BASEURL},
      });
    }
    super(dsConfig);
  }
}
