import type { FastifyReply } from "fastify";
import type { TEditSongRequest } from "../../types/index.js";
import { songService } from "../../services/songs.services.js";
import { REDIS_KEYS } from "../../configs/config.js";

type TSearchSong = { songId: string };

export const editSong = async (req: TEditSongRequest, reply: FastifyReply) => {
  try {
    const { songId } = req.params;
    const { name, poster_url, author } = req.body;

    const songRecord = await songService.getSongById(songId);
    if (!songRecord[0]) {
      return reply.status(404).send({
        success: false,
        error: "Song not found.",
      });
    }

    const userId = req.user.userId;

    if (songRecord[0].ownerId !== userId) {
      return reply.code(403).send({
        success: false,
        error: "You do not have permission to edit this song.",
      });
    }

    const updatedSongRecord = await songService.editSong(songRecord[0], {
      name,
      poster_url,
      author,
    });

    console.log(
      "Data from DB (to save in Redis):",
      JSON.stringify(updatedSongRecord),
    );

    const currentListRaw = await req.server.redis.call(
      "JSON.GET",
      `${REDIS_KEYS.user.prefix}:${userId}`,
    );

    if (currentListRaw) {
      const currentList = JSON.parse(currentListRaw as string);

      const index = currentList.findIndex(
        (s: TSearchSong) => String(s.songId) === String(songId),
      );

      if (index !== -1) {
        const path = `$[${index}]`;

        await req.server.redis.call(
          "JSON.SET",
          `${REDIS_KEYS.user.prefix}:${userId}`,
          path,
          JSON.stringify(updatedSongRecord),
        );
      }
    }

    await req.server.redis.hset(
      `${REDIS_KEYS.songs.prefix}:${songId}`,
      updatedSongRecord!,
    );
    await req.server.redis.expire(
      `${REDIS_KEYS.songs.prefix}:${songId}`,
      REDIS_KEYS.songs.ttl,
    );

    return reply.code(200).send({
      success: true,
      data: updatedSongRecord,
    });
  } catch (err) {
    req.log.error(err, "Error editing song");
    return reply.code(500).send({
      success: false,
      error: "Error occurred while editing the song.",
    });
  }
};
