import {
  inject,
  lifeCycleObserver,
  LifeCycleObserver,
  JSONObject,
} from '@loopback/core';
import {juggler} from '@loopback/repository';
import * as config from './vonage-rest.datasoure.config.json';
// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class VonageRestDataSource
  extends juggler.DataSource
  implements LifeCycleObserver
{
  static dataSourceName = 'vonageRest';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.vonageRest', {optional: true})
    dsConfig: object = config,
  ) {
    const dsConfigJson = dsConfig as JSONObject;
    if (dsConfigJson.default) {
      Object.assign(dsConfigJson.default, {
        options: {baseUrl: process.env.VONAGE_BASEURL},
      });
    }
    super(dsConfig);
  }
}
