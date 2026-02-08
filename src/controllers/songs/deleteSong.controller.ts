import type { FastifyReply } from "fastify";
import type { TRemoveSongInfoRequest } from "../../types/index.js";
import { songService } from "../../services/songs.services.js";
import { removeMp3File } from "../../utils/removeMp3File.js";

export const deleteSong = async (
  req: TRemoveSongInfoRequest,
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

    const removedSongRecord = await songService.removeSong(songId);

    if (!removedSongRecord) {
      return reply.code(404).send({
        success: false,
        error: "Song not found",
      });
    }

    await removeMp3File(`${songId}.mp3`);

    reply.code(200).send({
      success: true,
      data: removedSongRecord,
    });
  } catch (err) {
    req.log.error(err);
    return reply.code(500).send({
      success: false,
      error: "An error occured while deleting song",
    });
  }
};
