// Uncomment these imports to begin using these cool features!

import {inject} from '@loopback/context';
import {post, requestBody} from '@loopback/rest';
import {authorize} from 'loopback4-authorization';
import {NotifRestService} from '../services/notif-rest.service';
import {CONTENT_TYPE, SuccessResponse} from '@sourceloop/core';
import { UserOperationService } from '../services';
const basepath = `/otp-verify`;
export class NotifController {
  constructor(
    @inject('services.NotifRestService')
    private readonly notifRest: NotifRestService,
    @inject('services.UserOperationService')
    protected authService: UserOperationService,
  ) {}
  @authorize({permissions: ['*']})
  @post('/send-sms')
  async create(
    @requestBody({
      content: {
        [CONTENT_TYPE.JSON]: {},
      },
    })
    data: {
      phoneNumber: string;
    },
  ): Promise<SuccessResponse | void> {
    await this.notifRest.sendSms(data);
    return new SuccessResponse({
      success: true,
    });
  }
  @authorize({permissions: ['*']})
  @post(`${basepath}/send-otp`, {
    responses: {},
  })
  async sendOtp(
    @requestBody({
      content: {
        [CONTENT_TYPE.JSON]: {},
      },
    })
    data: {
      phoneNumber: string;
    },
  ) {
    //send 4 digit otp to the phone number

    const request = await this.notifRest.sendOtp(data);

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
      code: string;
    },
  ) {
    //verify otp
    const request = await this.notifRest.verifyOtp(data);
    const tokenDetail= await this.authService.getTokenAndLinkDetail(data.code);
    return {...request,
    ...tokenDetail};
  }
}
