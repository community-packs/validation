'use strict';

const Hapi = require('@hapi/hapi');
const Joi = require('joi');
const Inert = require('@hapi/inert');
const Vision = require('@hapi/vision');
const HapiSwagger = require('hapi-swagger');
const Pack = require('./package');

const init = async () => {

  const server = Hapi.server({
    port: process.env.PORT || 3000,
    host: '0.0.0.0'
  });

  const swaggerOptions = {
    info: {
      title: 'Test API Documentation',
      version: Pack.version,
    },
  };

  await server.register([
    Inert,
    Vision,
    {
      plugin: HapiSwagger,
      options: swaggerOptions
    }
  ]);

  server.route({
    method: 'POST',
    path: '/reset',
    handler: (request, h) => {
      return `${request.payload.username} to reset password`;
    },
    options: {
      description: 'Get todo',
      notes: 'Returns a todo item by the id passed in the path',
      tags: ['api'],
      validate: {
        failAction: (request, h, err) => {
          throw err;
        },
        payload: Joi.object({
          username: Joi.string()
            .alphanum()
            .min(3)
            .max(30)
            .required().
            messages({
              "string.empty": "Username is not allowed to be empty",
              "string.required": "Username is required lar",
              "string.min": "Username must be at least 3 characters long",
            }),
          new_password: Joi.string().required()
            .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
          confirm_password: Joi.ref('new_password'),
          reset_token: Joi.string().required()
        }).label('ResetPasswordForm')
      }
    }
  });

  await server.start();
  console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {

  console.log(err);
  process.exit(1);
});

init();




