import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';
import config from './auth-rest.datasource.config.json';


export class AuthRestDataSource extends juggler.DataSource{
  static dataSourceName = 'AuthRest';

  constructor(
    @inject('datasources.config.AuthRest', {optional: true})
    dsConfig: object = config,
  ) {
    Object.assign(dsConfig, {
      options: {baseUrl: process.env.AUTH_SERVICE_URL},
    });
    super(dsConfig);
  }
}
