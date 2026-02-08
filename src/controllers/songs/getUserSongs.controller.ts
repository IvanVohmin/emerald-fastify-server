import type {FastifyReply, FastifyRequest} from "fastify";
import type { TGetUsersSongsRequest } from "../../types/index.js";
import { songService } from "../../services/songs.services.js";

export const getUserSongs = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const userId = req.user.userId;

    const songs = await songService.getUserSongs(Number(userId));

    return reply.send({
      success: true,
      data: songs,
    });
  } catch (err) {
    return reply.status(500).send({
      success: false,
      error: "An error occurred while fetching user songs",
    });
  }
};
