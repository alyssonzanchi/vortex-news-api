import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import z from 'zod';
import { prisma } from '../lib/prisma';
import { BadRequest } from './_errors/bad-request';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export async function login(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/login',
    {
      schema: {
        body: z.object({
          email: z.string({ required_error: 'O email é obrigatório!' }).email(),
          password: z.string({
            required_error: 'Informe sua senha para continuar!'
          })
        })
      }
    },
    async (req, rep) => {
      const { email, password } = req.body;

      const user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        throw new BadRequest('Usuário não encontrado!');
      }

      const checkPassword = await bcrypt.compare(password, user.password);

      if (!checkPassword) {
        throw new BadRequest('Senha inválida!');
      }

      try {
        const token = jwt.sign(
          {
            id: user.id,
            admin: user.admin
          },
          process.env.SECRET!,
          {
            expiresIn: '24h'
          }
        );

        rep
          .status(200)
          .send({ message: 'Autenticação realizada com sucesso!', token });
      } catch (error) {
        throw new Error();
      }
    }
  );
}
