// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/core';

import {authorize} from 'loopback4-authorization';
const {Vonage} = require('@vonage/server-sdk');
import {HttpErrors, post, requestBody} from '@loopback/rest';
import {AnyObject} from '@loopback/repository';
import {inject} from '@loopback/core';
import {VonageRestService} from '../services/vonage-rest.service';
import {CONTENT_TYPE, SuccessResponse} from '@sourceloop/core';
const basepath = `/otp-verify`;
export class NotifController {
  constructor(
    @inject('services.VonageRestService')
    private readonly vonageRestService: VonageRestService,
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
    const vonage = new Vonage({
      apiKey: process.env.VONAGE_API_KEY ?? '',
      apiSecret: process.env.VONAGE_API_SECRET ?? '',
    });

    const from = 'Vonage APIs';
    const to = data.phoneNumber;
    const text = 'A text message sent using the Vonage SMS API';
    await vonage.sms
      .send({to, from, text})
      .then(() => {
        console.log('Message sent successfully');
        return new SuccessResponse({
          success: true,
        });
      })
      .catch(() => {
        console.log('There was an error sending the messages.');
        throw new HttpErrors.BadRequest(
          'There was an error sending the messages.',
        );
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
