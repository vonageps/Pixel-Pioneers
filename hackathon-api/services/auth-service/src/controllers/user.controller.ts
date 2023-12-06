import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
} from '@loopback/rest';
import {User} from '../models';
import {UserRepository} from '../repositories';

import { authorize } from 'loopback4-authorization';
import { RoleRepository, TenantRepository, UserTenantRepository } from '@sourceloop/authentication-service';

export class UserController {
  constructor(
    @repository(UserRepository)
    public userRepository : UserRepository,
    @repository(RoleRepository)
    public userRoleRepo : RoleRepository,
    @repository(UserTenantRepository)
    public userTenantRepo : UserTenantRepository,
    @repository(TenantRepository)
    public tenantRepo : TenantRepository,

  ) {}

  @authorize({permissions: ['*']})
  @post('/users')
  @response(200, {
    description: 'User model instance',
    content: {'application/json': {schema: getModelSchemaRef(User)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {
            title: 'NewUser',
            exclude: ['id'],
          }),
        },
      },
    })
    user: Omit<User, 'id'>,
  ): Promise<User> {
    const userExist = await this.userRepository.find({
      where:{
        username: user.phone
      }
    })
    if(userExist.length>0){
      return userExist[0];
    } else {
      if(!user.firstName){
        user.firstName= 'patient';
      }
      const defaultTenantId = await this.tenantRepo.find({
        where:{
          key: 'telehealth_portal'
        }
      });
      user.defaultTenantId = defaultTenantId[0].id ?? '';
      const savedUser = await this.userRepository.create(user);
      const userRoleId = await this.userRoleRepo.find({
        where:{
          name: 'Patient'
        }
      });
      await this.userTenantRepo.create(
        {
          roleId: userRoleId[0].id,
          status: 1,
          tenantId: savedUser.defaultTenantId,
          userId:savedUser?.id ?? '',
        },
        undefined,
      );
      return savedUser;
    }
  }

  @authorize({permissions: ['*']})
  @get('/users/count')
  @response(200, {
    description: 'User model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(User) where?: Where<User>,
  ): Promise<Count> {
    return this.userRepository.count(where);
  }

  @authorize({permissions: ['*']})
  @get('/users')
  @response(200, {
    description: 'Array of User model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(User, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(User) filter?: Filter<User>,
  ): Promise<User[]> {
    return this.userRepository.find(filter);
  }

  @authorize({permissions: ['*']})
  @patch('/users')
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
    @param.where(User) where?: Where<User>,
  ): Promise<Count> {
    return this.userRepository.updateAll(user, where);
  }

  @authorize({permissions: ['*']})
  @get('/users/{id}')
  @response(200, {
    description: 'User model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(User, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(User, {exclude: 'where'}) filter?: FilterExcludingWhere<User>
  ): Promise<User> {
    return this.userRepository.findById(id, filter);
  }

  @authorize({permissions: ['*']})
  @patch('/users/{id}')
  @response(204, {
    description: 'User PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {partial: true}),
        },
      },
    })
    user: User,
  ): Promise<void> {
    await this.userRepository.updateById(id, user);
  }

  @authorize({permissions: ['*']})
  @put('/users/{id}')
  @response(204, {
    description: 'User PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() user: User,
  ): Promise<void> {
    await this.userRepository.replaceById(id, user);
  }

  @authorize({permissions: ['*']})
  @del('/users/{id}')
  @response(204, {
    description: 'User DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.userRepository.deleteById(id);
  }
}
