import Fastify from "fastify";
import dotenv from "dotenv";
import {apiRoutes, authApiRoutes} from "./routes/index.js";
import jwtPlugin from "./plugins/jwt.js";
import firebase from "./plugins/firebase.js";
dotenv.config();

const PORT = process.env.PORT || 5346;

const app = Fastify({
  logger: true,
});

app.register(jwtPlugin);
app.register(firebase);

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
