import { type FastifyReply } from "fastify";
import type { TCreateSongInfoRequest } from "../../types/index.js";
import { isValidUrl } from "../../utils/isValidUrl.js";
import { ttdl } from "btch-downloader";
import type { TikTokResponse } from "btch-downloader/Types";
import { generateSongId } from "../../utils/generateSongId.js";
import { songService } from "../../services/songs.services.js";
import { saveMp3File } from "../../utils/saveMp3File.js";
import { REDIS_KEYS } from "../../configs/config.js";
import { getRandomPinterestCover } from "../../configs/pinterestCovers.js";

export const createSong = async (
  req: TCreateSongInfoRequest,
  reply: FastifyReply,
) => {
  try {
    const { url } = req.body;

    if (!url) {
      return reply.code(400).send({
        success: false,
        error: "Provide 'url' in body",
      });
    }

    if (!isValidUrl(url)) {
      return reply.code(400).send({
        success: false,
        error: "Invalid URL provided",
      });
    }

    const tikTokData: TikTokResponse = await ttdl(url);

    if (!tikTokData.audio?.[0]) {
      return reply.code(404).send({
        success: false,
        error: "Audio not found",
      });
    }

    const ownerId = req.user.userId;

    const songId = generateSongId(
      tikTokData.title || "",
      tikTokData.thumbnail || "",
      ownerId,
    );

    const checkSongRecord = await songService.getSongById(songId);

    if (checkSongRecord.length > 0) {
      return reply.status(200).send({
        success: true,
        data: checkSongRecord[0],
      });
    }

    const fileName = `${songId}.mp3`;

    await saveMp3File(tikTokData.audio[0], fileName);

    const song = await songService.createSong({
      ownerId,
      songId,
      tiktokUrl: url,
      posterUrl: getRandomPinterestCover(),
      name: tikTokData.title,
    });

    const createdSong = song[0]!;

    await req.server.redis.hset(
      `${REDIS_KEYS.songs.prefix}:${songId}`,
      createdSong,
    );

    await req.server.redis.expire(
      `${REDIS_KEYS.songs.prefix}:${songId}`,
      REDIS_KEYS.songs.ttl,
    );

    const userKey = `${REDIS_KEYS.user.prefix}:${ownerId}`;

    const userSongsRaw = await req.server.redis.call("JSON.GET", userKey);

    if (userSongsRaw) {
      await req.server.redis.call(
        "JSON.ARRAPPEND",
        userKey,
        "$",
        JSON.stringify(createdSong),
      );
    }

    return reply.status(200).send({
      success: true,
      data: createdSong,
    });
  } catch (err) {
    req.log.error(err);
    return reply.code(500).send({
      success: false,
      error: "Error occured while creating song",
    });
  }
};
