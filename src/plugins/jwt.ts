import fp from 'fastify-plugin'
import fastifyJwt from '@fastify/jwt'
import fastifyCookie from '@fastify/cookie'
import type { FastifyInstance } from 'fastify'
import { JWT_SECRET } from '../configs/config.js'

async function jwtPlugin(fastify: FastifyInstance) {
  fastify.register(fastifyCookie)

  fastify.register(fastifyJwt, {
    secret: JWT_SECRET!,
    cookie: {
      cookieName: 'token',
      signed: false
    }
  })

  fastify.decorate('authenticate', async function (req, reply) {
    try {
      await req.jwtVerify()
    } catch {
      reply.code(401).send({ message: 'Unauthorized' })
    }
  })
}

export default fp(jwtPlugin)
