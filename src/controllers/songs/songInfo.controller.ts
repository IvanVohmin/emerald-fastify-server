import type { FastifyReply } from "fastify";
import type { TGetSongInfoRequest } from "../../types/index.js";
import { songService } from "../../services/songs.services.js";
import { REDIS_KEYS } from "../../configs/config.js";
import { isEmptyObject } from "../../utils/isEmptyObject.js";

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

    const songRedisRecord = await req.server.redis.hgetall(`${REDIS_KEYS.songs.prefix}:${songId}`);
    if (!isEmptyObject(songRedisRecord)) {
      return reply.code(200).send({
        success: true,
        data: songRedisRecord,
      });
    }

    const songRecord = await songService.getSongById(songId);

    if (songRecord.length === 0) {
      return reply.code(404).send({
        success: false,
        error: "Song not found",
      });
    }

    await req.server.redis.hset(`${REDIS_KEYS.songs.prefix}:${songId}`, songRecord[0]!);
    await req.server.redis.expire(`${REDIS_KEYS.songs.prefix}:${songId}`, REDIS_KEYS.songs.ttl);

    return reply.code(200).send({
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
