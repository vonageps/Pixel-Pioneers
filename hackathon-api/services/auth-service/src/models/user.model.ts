// Copyright (c) 2023 Sourcefuse Technologies
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
import {
  DataObject,
  Model,
  belongsTo,
  hasMany,
  hasOne,
  model,
  property,
} from '@loopback/repository';
import { Tenant, TenantWithRelations, UserCredentials, UserCredentialsWithRelations, UserTenant, UserTenantWithRelations } from '@sourceloop/authentication-service';
import {Gender, UserModifiableEntity} from '@sourceloop/core';
import {IAuthUser} from 'loopback4-authentication';


@model({
  name: 'users',
  description: 'This is signature for user model.',
})
export class User<T = DataObject<Model>>
  extends UserModifiableEntity<T & User>
  implements IAuthUser
{
  @property({
    type: 'string',
    id: true,
  })
  id?: string;

  @property({
    type: 'string',
    required: false,
    name: 'first_name',
  })
  firstName: string;

  @property({
    type: 'string',
    name: 'last_name',
  })
  lastName: string;

  @property({
    type: 'string',
    name: 'middle_name',
  })
  middleName?: string;

  @property({
    type: 'string',
    required: true,
  })
  username: string;

  @property({
    type: 'string',
  })
  email?: string;

  @property({
    type: 'string',
    jsonSchema: {
      pattern: `^\\+?[1-9]\\d{1,14}$`,
    },
  })
  phone?: string;

  @property({
    type: 'string',
    name: 'auth_client_ids',
  })
  authClientIds?: string;

  @property({
    type: 'date',
    name: 'last_login',
    postgresql: {
      column: 'last_login',
    },
  })
  lastLogin?: Date;

  @property({
    type: 'date',
  })
  dob: Date;

  @property({
    type: 'string',
    description: `This field takes a single character as input in database.
    'M' for male and 'F' for female.`,
    jsonSchema: {
      enum: ['M', 'F', 'O'],
    },
  })
  gender?: Gender;

  @property({
    type: 'object',
    name: 'join_call_data',
  })
  joinCallData:object

  @hasOne(() => UserCredentials, {keyTo: 'userId'})
  credentials: UserCredentials;

  @belongsTo(
    () => Tenant,
    {keyFrom: 'default_tenant_id', name: 'defaultTenant'},
    {
      name: 'default_tenant_id',
      required: false,
    },
  )
  defaultTenantId: string;

  @hasMany(() => UserTenant, {keyTo: 'userId'})
  userTenants: UserTenant[];
}

export interface UserRelations {
  defaultTenant: TenantWithRelations;
  credentials: UserCredentialsWithRelations;
  userTenant: UserTenantWithRelations;
}

export type UserWithRelations = User & UserRelations;