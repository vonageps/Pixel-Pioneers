import {injectable, inject, BindingScope, Getter} from '@loopback/core';
import {AuthProxy} from './auth-proxy.service';
import {VideoProxy} from './video-proxy.service';
import {IAttendeeDetail, User, VideoChatSession} from '../models';
import * as CryptoJS from 'crypto-js';
import {AuthenticationBindings, ClientAuthCode} from 'loopback4-authentication';
import * as jwt from 'jsonwebtoken';
import { IAuthUserWithPermissions } from 'loopback4-authorization';
import axios from 'axios';
const secretKey = process.env.CRYPTO_SECRET_KEY ?? '';

@injectable({scope: BindingScope.TRANSIENT})
export class UserOperationService {
  constructor(
    @inject('services.AuthProxy')
    protected authService: AuthProxy,
    @inject('services.VideoProxy')
    protected videoSvc: VideoProxy,
    @inject.getter(AuthenticationBindings.CURRENT_USER, {optional: true})
    private readonly getCurrentUser: Getter<IAuthUserWithPermissions>,
  ) {}

  async registerUser(requestBody: User) {
    // register user
    requestBody.username = requestBody.phone!;
    requestBody.authClientIds = '{1}';
    const saveUserDetail: User =
      await this.authService.registerUser(requestBody);
    const token = await this.generateAuthToken(saveUserDetail.username);

    // create video link
    const meetingDetail = new VideoChatSession();
    meetingDetail.isScheduled = true;

    meetingDetail.scheduleTime = this.AddMinutesToDate(new Date(), 5);
    const meetingLinkId = await this.videoSvc.createJoinCallLink(
      meetingDetail,
      token,
    );
    // save link detail in db

    const encryptedToken = this.encryptToken({
      code: `${requestBody.phone}`,
    });

    const encodedToken = encodeURIComponent(encryptedToken);
    const joinCallData = {
      meetingLinkId,
    };
    await this.authService.updateUser(
      {joinCallData},
      {
        username: requestBody.phone!,
      },
    );
    return {redirectLink: `${process.env.REDIRECT_LINK}?code=${encodedToken}`,};
  }

  AddMinutesToDate(date: Date, minutes: number) {
    return new Date(date.getTime() + minutes * 60000);
  }

  async generateAuthToken(username: string): Promise<string> {
    const body = {
      //eslint-disable-next-line @typescript-eslint/naming-convention
      client_id: process.env.PATIENT_CLIENT_ID!, //NOSONAR
      // eslint-disable-next-line @typescript-eslint/naming-convention
      client_secret: process.env.PATIENT_CLIENT_SECRET!, //NOSONAR
      username: username,
      password: process.env.TEMP_PASSWORD!,
    };
    const token = await this.authService.authLogin(body);
    const bearerToken = `Bearer ${token.accessToken}`;
    return bearerToken;
  }

  encryptToken(data: {code: string}): string {
    if (!process.env.CRYPTO_SECRET_KEY) {
      // Intentional
      return JSON.stringify(data);
    }
    return (
      data && CryptoJS.AES.encrypt(JSON.stringify(data), secretKey).toString()
    );
  }

  /**
   * @description
   * To decipher string passed in payload
   * @param key , pass key
   * @returns deciphered json data
   */
  decryptToken(key: string) {
    if (!secretKey && key) {
      // Intentional
      return JSON.parse(key) as unknown;
    }
    const decryptData = key && CryptoJS.AES.decrypt(key, secretKey);
    return decryptData && JSON.parse(decryptData.toString(CryptoJS.enc.Utf8));
  }

  async getTokenAndLinkDetail(code: string) {
    const tokenDetail = this.decryptToken(decodeURIComponent(code));
    const userDetail = await this.authService.getUsers({
      where: {
        username: tokenDetail.username,
      },
      fields: {
        joinCallData: true,
        username: true,
      },
    });
    const token = await this.generateAuthToken(userDetail[0].username);
    const joinCallobj: any = userDetail[0].joinCallData;
    return {
      accessToken: token,
      meetingLinkId: joinCallobj.meetingLinkId,
      phone: tokenDetail.code,
    };
  }

  async getJoinCallDetail(mettingId: string, token: string) {
    const currentUser = await this.getCurrentUser();
    const userDetail = await this.authService.getUsers({
      where: {
        username: currentUser.username,
      },
    });
    const userTokenPaylaod: IAttendeeDetail = {
      id: currentUser.id ?? '',
      tenantId: currentUser.username ?? '',
    };
    const tokenData = await this.generateVideoToken(
      userTokenPaylaod,
      'patient_webapp',
    );
    const videoTokenDetail = await this.videoSvc.getTokenDetail(
      mettingId,
      {data: tokenData},
      token,
    );

    return {
      apiKey: process.env.API_KEY!,
      sessionId: videoTokenDetail.sessionId,
      token: videoTokenDetail.token,
      userDetail: userDetail[0],
    };
  }

  /**
   * To generate token
   * @param user , pass userDetail
   * @param clientId , pass clientId
   * @returns temporary token
   */
    async generateVideoToken(user: IAttendeeDetail, clientId: string) {
      const currentUser = await this.getCurrentUser();
      const codePayload: ClientAuthCode<User> = {
        clientId: clientId,
        userId: parseInt(currentUser.id ?? ''),
        ...user,
      };
      const temptoken = jwt.sign(codePayload, process.env.JWT_SECRET as string, {
        audience: clientId,
        subject: currentUser.username.toLowerCase(),
        issuer: process.env.JWT_ISSUER,
        algorithm: 'HS256',
      });
      return temptoken;
    }

    async getProviderJoinCallDetail(code: string){
      const tokenDetail= this.decryptToken(decodeURIComponent(code));
      const [userDetail,providerDetail] = await Promise.all([this.authService.getUsers({where:{
        username: tokenDetail.code
      }}),this.authService.getUsers({
        where:{
          username: process.env.PROVIDER_USERNAME
        }
      })]);
      const userTokenPaylaod: IAttendeeDetail = {
        id: providerDetail[0].id ?? '',
        tenantId: providerDetail[0].username ?? '',
      };
      const tokenData = await this.generateProviderVideoToken(
        userTokenPaylaod,
        'patient_webapp',
        providerDetail[0]
      );
      const meetingDetail:any = userDetail[0].joinCallData;
      const token = await this.generateAuthToken(tokenDetail.code);
      const videoTokenDetail = await this.videoSvc.getTokenDetail(
        meetingDetail.meetingLinkId,
        {data: tokenData},
        token,
      );
  
      return {
        apiKey: process.env.API_KEY!,
        sessionId: videoTokenDetail.sessionId,
        token: videoTokenDetail.token,
        userDetail: providerDetail[0]
      };

    }
    async generateProviderVideoToken(user: IAttendeeDetail, clientId: string, providerDetail:User) {
      const codePayload: ClientAuthCode<User> = {
        clientId: clientId,
        userId: parseInt(providerDetail.id ?? ''),
        ...user,
      };
      const temptoken = jwt.sign(codePayload, process.env.JWT_SECRET as string, {
        audience: clientId,
        subject: providerDetail.username.toLowerCase(),
        issuer: process.env.JWT_ISSUER,
        algorithm: 'HS256',
      });
      return temptoken;
    }

  
    async archiveCall(sessionId:string, token:string){
      const currentUser = await this.getCurrentUser();
      const payload = {
        iss: '47689721',
        iat: Math.floor(Date.now() / 1000), // Unix timestamp in seconds
        exp: Math.floor(Date.now() / 1000) + 18000, // Expire after 180 seconds
        ist: 'project',
        jti: Math.random(), // Generate a random UUID
      };
      const secretKey = process.env.VONAGE_API_SECRET!;

      const tokenDetail = jwt.sign(payload, secretKey, { algorithm: 'HS256' });
      console.log(tokenDetail);
      const headers = {
        'X-OPENTOK-AUTH': tokenDetail, // Include any other headers as needed
      };
      const postData = {
        sessionId,
        "hasAudio" : true,
        "hasVideo" : true,
  "resolution" : "640x480",
  "streamMode" : "auto"
      };
      let archiveData:any;
      await axios.post(`${process.env.ARCHIVE_VONAGE_URL}/${process.env.API_KEY}/archive`,
      postData, 
      { headers }
      )
      .then((response: any) => {
        console.log('Responsemain:', response.data);
        archiveData= response.data;
      })
      .catch((error: any) => {
          console.error('Error:', error.message);
      });
     const userData = await this.authService.getUsers({
      where:{
        username: currentUser.username
      }
     });
     if(archiveData){
      const data = userData[0].joinCallData;
      await this.authService.updateUser({
        joinCallData:{
          ...data,
        archiveId: archiveData.id
        }
      },{
        username: currentUser.id
      });
     }
      return {
        archiveId: archiveData?.id ?? ''
      };
  

    }
    async updateData(user: User, token: string) {
      return this.authService.updateUser(user, {username: user.username}, token);
    }

    async endCall(meetingId:string, archiveId:string, token:string){
      const endCurrentCall = await this.videoSvc.endVideoConferencing(meetingId, token);
      // get archive data
      const archiveData = await this.videoSvc.getArchive(archiveId, token);
      console.log(archiveData);
      return archiveData;

    }
}
