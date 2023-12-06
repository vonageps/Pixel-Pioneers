import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';
import config from './video-db-rest.datasource.config.json';

export class VideoDbRestDataSource extends juggler.DataSource {
  static dataSourceName = 'VideoDbRest';
  constructor(
    @inject('datasources.config.VideoDbRest', {optional: true})
    dsConfig: object = config,
  ) {
    Object.assign(dsConfig, {
      options: {baseUrl: process.env.VIDEO_SERVICE_URL},
    });
    super(dsConfig);
  }
}
