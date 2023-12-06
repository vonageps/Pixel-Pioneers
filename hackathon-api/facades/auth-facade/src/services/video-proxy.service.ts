import {inject, Provider} from '@loopback/core';
import {getService} from '@loopback/service-proxy';
import {VideoDbRestDataSource} from '../datasources';
import { ISessionDetail, ISessionOptions } from '../models';

export interface VideoProxy {
  // this is where you define the Node.js methods that will be
  // mapped to REST/SOAP/gRPC operations as stated in the datasource
  // json file.
  createJoinCallLink(requestBody: any, token:string):Promise<any>;
  getTokenDetail(
    meetingLinkId: string,
    requestBody: ISessionOptions,
    token?: string,
  ): Promise<ISessionDetail>;
  endVideoConferencing(meetingLinkId:string, token:string):Promise<any>
  getArchive(archiveId:string, token:string):Promise<any>
}

export class VideoProxyProvider implements Provider<VideoProxy> {
  constructor(
    // VideoDbRest must match the name property in the datasource json file
    @inject('datasources.VideoDbRest')
    protected dataSource: VideoDbRestDataSource = new VideoDbRestDataSource(),
  ) {}

  value(): Promise<VideoProxy> {
    return getService(this.dataSource);
  }
}
