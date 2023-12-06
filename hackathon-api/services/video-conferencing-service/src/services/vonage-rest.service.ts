import {BindingScope, Provider, inject, injectable} from '@loopback/core';
import {AnyObject} from '@loopback/repository';
import {VonageRestDataSource} from '../datasources/vonage-rest.datasource';
import {getService} from '@loopback/service-proxy';

export interface VonageRestService {
  sendOtp(body: {
    api_key: string;
    api_secret: string;
    number: string;
    brand: string;
    code_length: number;
    sender_id: string;
  }): Promise<AnyObject>;

  verifyOtp(body: {
    api_key: string;
    api_secret: string;
    code: string;
    request_id: string;
  }): Promise<AnyObject>;
}
@injectable({scope: BindingScope.TRANSIENT})
export class VonageRestServiceProvider implements Provider<VonageRestService> {
  constructor(
    // VOnageRest must match the name property in the datasource json file
    @inject('datasources.vonageRest')
    protected _dataSource: VonageRestDataSource = new VonageRestDataSource(),
  ) {}

  async value(): Promise<VonageRestService> {
    return getService(this._dataSource);
  }
}
