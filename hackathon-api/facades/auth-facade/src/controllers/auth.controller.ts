import {inject} from '@loopback/core';
import {
  getModelSchemaRef,
  param,
  patch,
  post,
  requestBody,
  response,
} from '@loopback/rest';
import {
  CONTENT_TYPE,
  ErrorCodes,
  OPERATION_SECURITY_SPEC,
  STATUS_CODE,
} from '@sourceloop/core';
import {authorize} from 'loopback4-authorization';
import {UserOperationService} from '../services';
import {User} from '../models';
import {AnyType, CountSchema, Where} from '@loopback/repository';
import {STRATEGY, authenticate} from 'loopback4-authentication';

const basePath = '/auth';

export class AuthController {
  constructor(
    @inject('services.UserOperationService')
    protected authService: UserOperationService,
  ) {}

  @authorize({permissions: ['*']})
  @post(`${basePath}/register-user`, {
    description: `register user and send redirect link`,
    responses: {
      [STATUS_CODE.OK]: {
        description: 'register user and send redirect link',
      },
      ...ErrorCodes,
    },
  })
  async createUser(
    @requestBody({
      content: {
        [CONTENT_TYPE.JSON]: {
          schema: getModelSchemaRef(User, {partial: true}),
        },
      },
    })
    body: any,
  ): Promise<{redirectLink: string}> {
    return this.authService.registerUser(body);
  }

  @authorize({permissions: ['*']})
  @post(`${basePath}/auth-token`, {
    description: `join call detail`,
    responses: {
      [STATUS_CODE.OK]: {
        description: 'return join call detail',
      },
      ...ErrorCodes,
    },
  })
  async getVideoLink(
    @requestBody({
      content: {
        [CONTENT_TYPE.JSON]: {
          schema: getModelSchemaRef(AnyType, {partial: true}),
        },
      },
    })
    body: {
      code: string;
    },
  ): Promise<{accessToken: string; meetingLinkId: string; phone: string}> {
    return this.authService.getTokenAndLinkDetail(body.code);
  }

  @authenticate(STRATEGY.BEARER, {
    passReqToCallback: true,
  })
  @authorize({permissions: ['*']})
  @post(`${basePath}/join-call`, {
    security: OPERATION_SECURITY_SPEC,
    description: `join call detail`,
    responses: {
      [STATUS_CODE.OK]: {
        description: 'return join call detail',
      },
      ...ErrorCodes,
    },
  })
  async joinCallDetail(
    @param.header.string('Authorization') token: string,
    @requestBody({
      content: {
        [CONTENT_TYPE.JSON]: {
          schema: getModelSchemaRef(AnyType, {partial: true}),
        },
      },
    })
    body: {meetingLinkId: string},
  ): Promise<{
    apiKey: string;
    sessionId: string;
    token: string;
    userDetail: object;
  }> {
    return this.authService.getJoinCallDetail(body.meetingLinkId, token);
  }

  @authorize({permissions: ['*']})
  @post(`${basePath}/provider-join-call`, {
    security: OPERATION_SECURITY_SPEC,
    description: `join call detail`,
    responses: {
      [STATUS_CODE.OK]: {
        description: 'return join call detail',
      },
      ...ErrorCodes,
    },
  })
  async providerJoinCallDetail(
    @requestBody({
      content: {
        [CONTENT_TYPE.JSON]: {
          schema: getModelSchemaRef(AnyType, {partial: true}),
        },
      },
    })
    body: {
      code: string;
    },
  ): Promise<{
    apiKey: string;
    sessionId: string;
    token: string;
    userDetail: object;
  }> {
    return this.authService.getProviderJoinCallDetail(body.code);
  }

  @authenticate(STRATEGY.BEARER, {
    passReqToCallback: true,
  })
  @authorize({permissions: ['*']})
  @post(`${basePath}/archive`, {
    security: OPERATION_SECURITY_SPEC,
    description: `join call detail`,
    responses: {
      [STATUS_CODE.OK]: {
        description: 'return join call detail',
      },
      ...ErrorCodes,
    },
  })
  async archiveCall(
    @param.header.string('Authorization') token: string,
    @requestBody({
      content: {
        [CONTENT_TYPE.JSON]: {
          schema: getModelSchemaRef(AnyType, {partial: true}),
        },
      },
    })
    body: {sessionId: string},
  ): Promise<{archiveId:string}> {
    return this.authService.archiveCall(body.sessionId, token);
  }
  @authorize({permissions: ['*']})
  @patch('auth/user')
  @response(200, {
    description: 'User PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {partial: true}),
        },
      },
    })
    user: User,
    @param.header.string('Authorization') token: string,
    @param.where(User) where?: Where<User>,
  ): Promise<User> {
    return this.authService.updateData(user, token);
  }

  @authorize({permissions: ['*']})
  @post(`${basePath}/endCall`, {
    security: OPERATION_SECURITY_SPEC,
    description: `join call detail`,
    responses: {
      [STATUS_CODE.OK]: {
        description: 'return join call detail',
      },
      ...ErrorCodes,
    },
  })
  async endCall(
    @param.header.string('Authorization') token: string,
    @requestBody({
      content: {
        [CONTENT_TYPE.JSON]: {
          schema: getModelSchemaRef(AnyType, {partial: true}),
        },
      },
    })
    body: {meetingId: string, archiveId:string},
  ): Promise<any> {
    return this.authService.endCall(body.meetingId, body.archiveId,token);
  }
}
