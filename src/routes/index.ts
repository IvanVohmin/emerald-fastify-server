import type { FastifyInstance } from 'fastify'
import {songsRoutes} from "./songs.route.js";
import {authRoutes} from "./auth.route.js";

export const apiRoutes = async(fastify: FastifyInstance) => {
    fastify.register(songsRoutes, { prefix: '/songs' })
}

export const authApiRoutes = async(fastify: FastifyInstance) => {
    fastify.register(authRoutes)
}