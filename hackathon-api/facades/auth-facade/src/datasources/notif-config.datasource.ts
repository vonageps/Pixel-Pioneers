import {inject, JSONObject} from '@loopback/core';
import {juggler} from '@loopback/repository';
import * as config from './notif-config.datasource.json';
export class NotifServiceDataSource extends juggler.DataSource {
  static dataSourceName = 'notifService';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.notifService', {optional: true})
    dsConfig: object = config,
  ) {
    const dsConfigJson = dsConfig as JSONObject;
    if (dsConfigJson.default) {
      Object.assign(dsConfigJson.default, {
        options: {baseUrl: process.env.AUTH_SERVICE_URL},
      });
    }
    super(dsConfig);
  }
}
