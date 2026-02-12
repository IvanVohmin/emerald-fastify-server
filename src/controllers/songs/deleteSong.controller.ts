import type { FastifyReply } from "fastify";
import type { TRemoveSongInfoRequest } from "../../types/index.js";
import { songService } from "../../services/songs.services.js";
import { removeMp3File } from "../../utils/removeMp3File.js";
import { REDIS_KEYS } from "../../configs/config.js";

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

    const userId = removedSongRecord.ownerId;

    await req.server.redis.del(
      `${REDIS_KEYS.songs.prefix}:${songId}`
    );

    await req.server.redis.del(
      `${REDIS_KEYS.user.prefix}:${userId}`
    );

    await removeMp3File(`${songId}.mp3`);

    return reply.code(200).send({
      success: true,
      data: removedSongRecord,
    });
  } catch (err) {
    req.log.error(err, "Error deleting song");

    return reply.code(500).send({
      success: false,
      error: "An error occured while deleting song",
    });
  }
};
