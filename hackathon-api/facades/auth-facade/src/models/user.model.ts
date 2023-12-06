// Copyright (c) 2023 Sourcefuse Technologies
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
import {
  DataObject,
  Model,
  model,
  property,
} from '@loopback/repository';
import {Gender, UserModifiableEntity} from '@sourceloop/core';
import {IAuthUser} from 'loopback4-authentication';


@model({
  
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
    required: false,
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
  })
  joinCallData:object


}

export interface UserRelations {
}

export type UserWithRelations = User & UserRelations;
