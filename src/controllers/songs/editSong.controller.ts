import type { FastifyReply } from "fastify";
import type { TEditSongRequest } from "../../types/index.js";
import { songService } from "../../services/songs.services.js";

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
