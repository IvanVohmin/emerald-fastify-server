import type { FastifyReply, FastifyRequest } from "fastify";
import { songService } from "../../services/songs.services.js";
import { REDIS_KEYS } from "../../configs/config.js";

export const getUserSongs = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const userId = req.user.userId;

    const songsRedisRecordRaw = await req.server.redis.call(
      "JSON.GET",
      `${REDIS_KEYS.user.prefix}:${userId}`,
    );

    if (songsRedisRecordRaw) {
      return reply.send({
        success: true,
        data: JSON.parse(songsRedisRecordRaw as string),
      });
    }

    const songs = await songService.getUserSongs(Number(userId));

    await req.server.redis.call(
      "JSON.SET",
      `${REDIS_KEYS.user.prefix}:${userId}`,
      "$",
      JSON.stringify(songs),
    );

    await req.server.redis.expire(
      `${REDIS_KEYS.user.prefix}:${userId}`,
      REDIS_KEYS.user.ttl,
    );

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
