import fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import {
  serializerCompiler,
  validatorCompiler
} from 'fastify-type-provider-zod';
import fastifyJwt from '@fastify/jwt';

const app = fastify();

app.register(fastifyCors, {
  origin: '*'
});

app.register(fastifyJwt, { secret: process.env.SECRET! });

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.listen({ port: 3333 }).then(() => {
  console.log('HTTP server runing!');
});
