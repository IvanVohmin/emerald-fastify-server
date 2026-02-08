import type { FastifyReply } from "fastify";
import type { TCreateSongInfoRequest } from "../../types/index.js";
import { isValidUrl } from "../../utils/isValidUrl.js";
import { ttdl } from "btch-downloader";
import type { TikTokResponse } from "btch-downloader/Types";
import { generateSongId } from "../../utils/generateSongId.js";
import { songService } from "../../services/songs.services.js";
import { saveMp3File } from "../../utils/saveMp3File.js";

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

    if (tikTokData.audio?.length === 0 || !tikTokData.audio?.[0]) {
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

    // проверка есть ли уже такая песня в таким id в бд
    if (checkSongRecord.length > 0) {
      return reply.status(200).send({
        success: true,
        data: checkSongRecord[0],
      });
    }

    const fileName = `${songId}.mp3`;

    try {
      await saveMp3File(tikTokData.audio?.[0], fileName);
    } catch (error) {
      req.log.error(error);
      return reply.status(500).send({
        success: false,
        error: `Failed to save audio file`,
      });
    }

    // записываем информацию в базу данных о песне
    const song = await songService.createSong({
      ownerId,
      songId,
      tiktokUrl: url,
      posterUrl: tikTokData.thumbnail,
      name: tikTokData.title,
    });

    reply.status(200).send({
      success: true,
      data: song,
    });
  } catch (err) {
    req.log.error(err);
    return reply.code(500).send({
      success: false,
      error: "Error occured while creating song",
    });
  }
};
