import fp from 'fastify-plugin'
import admin from 'firebase-admin'
import type { FastifyInstance } from 'fastify'
import serviceAccount from '../../firebase/account_key.json' with { type: 'json' }

async function firebasePlugin(fastify: FastifyInstance) {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    })
  }

  fastify.decorate('firebase', admin)
}

export default fp(firebasePlugin)
