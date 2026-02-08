import type { FastifyInstance } from "fastify";
import { loginViaFirebaseToken } from "../controllers/auth/auth.controller.js";

export const authRoutes = (fastify: FastifyInstance) => {
    fastify.post('/login', loginViaFirebaseToken)
}