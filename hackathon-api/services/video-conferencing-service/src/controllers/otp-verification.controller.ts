import {inject} from '@loopback/core';
import {AnyObject} from '@loopback/repository';
import {post, requestBody} from '@loopback/rest';
import {authorize} from 'loopback4-authorization';

import {VonageRestService} from '../services/vonage-rest.service';

const basepath = `/otp-verify`;

export class OtpVerifyController {
  constructor(
    @inject('services.VonageRestService')
    private readonly vonageRestService: VonageRestService,
  ) {}
  @authorize({permissions: ['*']})
  @post(`${basepath}/send-otp`, {
    responses: {},
  })
  async sendOtp(
    @requestBody()
    data: {
      phoneNumber: string;
    },
  ): Promise<AnyObject> {
    //send 4 digit otp to the phone number
    const requestBody = {
      api_key: '',
      api_secret: '',
      number: data.phoneNumber,
      brand: 'vonage',
      code_length: 4,
      sender_id: '123',
    };
    const request = await this.vonageRestService.sendOtp(requestBody);
    console.log('>>>>', request);
    return request;
  }
  //verify otp
  @authorize({permissions: ['*']})
  @post(`${basepath}/verify`, {
    responses: {},
  })
  async verifyOtp(
    @requestBody()
    data: {
      enteredCode: string;
      requestId: string;
    },
  ): Promise<AnyObject> {
    //verify otp
    const requestBody = {
      api_key: '',
      api_secret: '',
      request_id: data.requestId,
      code: data.enteredCode,
    };
    const request = await this.vonageRestService.verifyOtp(requestBody);
    console.log('>>>>', request);
    return request;
  }
}
