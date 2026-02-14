/**
 * activity-log controller
 */

import { factories } from '@strapi/strapi';
import { resolve } from 'path'; 

export default factories.createCoreController('api::activity-log.activity-log',
  ({strapi})=>({
    async create(ctx) {
      const user = ctx.state.user;

      if (!user) return ctx.unauthorized('Login required');
      const body = ctx.request.body.data;
      body.user_permissions_user = user.id;

      const entry = await strapi.entityService.create('api::activity-log.activity-log',{
           data: body,
           populate: [ 'users_permissions_user' ]
        }     
      )
      return entry;
    },
    async find(ctx) {
      const user = ctx.state.user;

      const result = await strapi.entityService.findMany('api::activity-log.activity-log',{
           filters : { users_permissions_user: user.id },
           populate: [ 'users_permissions_user' ]
        }     
      )
      return result;
    },
    async findOne(ctx) {
      const user = ctx.state.user;
      const { id } = ctx.params;

      const result = await strapi.entityService.findMany('api::activity-log.activity-log',{
           filters: { id: id, users_permissions_user: user.id },
           populate: [ 'users_permissions_user' ]
        }     
      )
      if (!result.length) return ctx.notFound('Activity log not found');
      return result[0];
    }    
  })
);
