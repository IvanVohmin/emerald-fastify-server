import type { FastifyReply, FastifyRequest } from "fastify";
import userService from "../../services/user.services.js";

export const loginViaFirebaseToken = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
      console.log('bearer error')
    return reply.code(401).send({ error: "No token" });
  }

  const firebaseToken = authHeader.replace("Bearer ", "");

  try {
    const decoded = await req.server.firebase
      .auth()
      .verifyIdToken(firebaseToken);

    const { uid, email } = decoded;

    if (!email || !uid) {
      return reply.code(400).send({ error: "Email or UID not found in token" });
    }

    const user = await userService.findOrCreateUser(email, uid);

    if (!user[0]) {
      return reply.code(500).send({ error: "Failed to create or find user" });
    }

    const accessToken = req.server.jwt.sign({
      userId: user[0].id,
      email: user[0].email,
    });

    return reply.send({ accessToken });
  } catch (err) {
    req.log.error(err);
    console.log('dfdfddfdfdffdf')
    return reply.code(401).send({ error: "Invalid Firebase token" });
  }
};
