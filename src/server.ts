import Fastify from "fastify";
import dotenv from "dotenv";
import { apiRoutes, authApiRoutes } from "./routes/index.js";
import jwtPlugin from "./plugins/jwt.js";
import firebase from "./plugins/firebase.js";
import fastifyRedis from "@fastify/redis";
dotenv.config();

const PORT = process.env.PORT || 8787;

const app = Fastify({
  logger: true,
});

app.register(jwtPlugin);
app.register(firebase);
app.register(fastifyRedis, {
  username: process.env.REDIS_USERNAME || "default",
  password: process.env.REDIS_PASSWORD || "",
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
});

app.addHook("onReady", async () => {
  // пинг редиса
  try {
    const result = await app.redis.ping();

    if (result === "PONG") {
      app.log.info("Redis connection successful");
    }
  } catch (err: any) {
    app.log.error("Error connecting to redis:", err);
  }
});

app.register(
  async (protectedRoutes) => {
    protectedRoutes.addHook("preHandler", protectedRoutes.authenticate);

    protectedRoutes.register(apiRoutes);
  },
  { prefix: "/api" },
);

app.register(
  async (protectedRoutes) => {
    protectedRoutes.register(authApiRoutes);
  },
  { prefix: "/auth" },
);

app.listen({ port: Number(PORT) }, (err) => {
  if (err) {
    app.log.error(err.message);
    process.exit(1);
  }
  console.log(`Server is listening on port ${PORT}`);
});
