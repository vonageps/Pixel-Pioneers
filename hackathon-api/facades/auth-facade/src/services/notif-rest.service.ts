import {inject, Provider} from '@loopback/core';
import {AnyObject} from '@loopback/repository';
import {getService} from '@loopback/service-proxy';
import {NotifServiceDataSource} from '../datasources/notif-config.datasource';
import {SuccessResponse} from '@sourceloop/core';

export interface NotifRestService {
  sendSms(body: AnyObject): Promise<void | SuccessResponse>;
  sendOtp(body: {phoneNumber: string}): Promise<AnyObject>;
  verifyOtp(body: {enteredCode: string; requestId: string}): Promise<AnyObject>;
}
export class NotifRestServiceProvider
  implements Provider<NotifServiceDataSource>
{
  constructor(
    //NotifService must match the name property in the datasource json file
    @inject('datasources.notifService')
    protected dataSource: NotifServiceDataSource = new NotifServiceDataSource(), // NOSONAR
  ) {}

  value(): Promise<NotifServiceDataSource> {
    return getService(this.dataSource);
  }
}
