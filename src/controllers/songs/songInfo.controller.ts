import type { FastifyReply } from "fastify";
import type { TGetSongInfoRequest } from "../../types/index.js";
import { songService } from "../../services/songs.services.js";

export const getSongInfo = async (
  req: TGetSongInfoRequest,
  reply: FastifyReply,
) => {
  try {
    const { songId } = req.params;

    if (!songId) {
      return reply.code(400).send({
        success: false,
        error: "Provide 'songId' in params",
      });
    }

    const songRecord = await songService.getSongById(songId);

    if (songRecord.length === 0) {
      return reply.code(404).send({
        success: false,
        error: "Song not found",
      });
    }

    reply.code(200).send({
      success: true,
      data: songRecord[0],
    });
  } catch (err) {
    req.log.error(err);
    return reply.code(500).send({
      success: false,
      error: "An error occured while getting song info.",
    });
  }
};
