import {inject, Provider} from '@loopback/core';
import {getService} from '@loopback/service-proxy';
import {AuthRestDataSource} from '../datasources';
import {User} from '../models';
import {Filter, Where} from '@loopback/repository';

export interface AuthProxy {
  // this is where you define the Node.js methods that will be
  // mapped to REST/SOAP/gRPC operations as stated in the datasource
  // json file.
  registerUser(requestBody: User): Promise<User>;
  authLogin(requestBody: {
    client_id: string;
    client_secret: string;
    username: string;
    password: string;
  }): Promise<{accessToken: string}>;

  getUsers(filter?: Filter<User>): Promise<User[]>;
  updateUser(
    user: Partial<User>,
    where: Where<User>,
    token?: string,
  ): Promise<User>;
}

export class AuthProxyProvider implements Provider<AuthProxy> {
  constructor(
    // AuthRest must match the name property in the datasource json file
    @inject('datasources.AuthRest')
    protected dataSource: AuthRestDataSource = new AuthRestDataSource(),
  ) {}

  value(): Promise<AuthProxy> {
    return getService(this.dataSource);
  }
}
