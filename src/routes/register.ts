import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import z from 'zod';
import { prisma } from '../lib/prisma';
import { BadRequest } from './_errors/bad-request';
import bcrypt from 'bcrypt';

export async function register(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/register',
    {
      schema: {
        body: z
          .object({
            nome: z.string({ required_error: 'O nome é obrigatório!' }),
            email: z
              .string({ required_error: 'O email é obrigatório!' })
              .email(),
            password: z
              .string()
              .min(6, { message: 'A senha precisa ter 6 caracteres ou mais!' }),
            confirm_password: z.string({
              required_error: 'A confirmação da senha é obrigatória!'
            })
          })
          .refine(
            ({ password, confirm_password }) => password === confirm_password,
            { message: 'As senhas não são iguais!', path: ['confirm_password'] }
          )
      }
    },
    async (req, rep) => {
      const { nome, email, password } = req.body as {
        nome: string;
        email: string;
        password: string;
      };

      const userExists = await prisma.user.findUnique({
        where: {
          email
        }
      });

      if (userExists) {
        throw new BadRequest('Usuário já existe!');
      }

      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(password, salt);

      const user = await prisma.user.create({
        data: {
          nome,
          email,
          password: passwordHash
        }
      });

      return rep.status(201).send({ user });
    }
  );
}
