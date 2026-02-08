import type {FastifyInstance} from "fastify";
import {editSong} from "../controllers/songs/editSong.controller.js";
import {
  editSongBodySchema,
  editSongErrorSchema,
  editSongParamsSchema,
  editSongResponseSchema
} from "../schemas/songs/editSong.schemas.js";
import { getUserSongsErrorSchema, getUserSongsParamsSchema, getUserSongsResponseSchema } from "../schemas/songs/getUserSongs.schemas.js";
import { getUserSongs } from "../controllers/songs/getUserSongs.controller.js";
import { streamSong } from "../controllers/songs/song.stream.controller.js";
import { getSongInfo } from "../controllers/songs/songInfo.controller.js";
import { deleteSong } from "../controllers/songs/deleteSong.controller.js";
import { createSong } from "../controllers/songs/createSong.controller.js";

export async function songsRoutes(fastify: FastifyInstance) {
  fastify.put(
    '/edit/:songId',
    {
      schema: {
        params: editSongParamsSchema,
        body: editSongBodySchema,
        response: {
          200: editSongResponseSchema,
          400: editSongErrorSchema,
          403: editSongErrorSchema,
          404: editSongErrorSchema
        }
      }
    },
    editSong
  )
  fastify.get(
    '/user-songs',
    getUserSongs
  ),
  fastify.get('/stream/:songId', streamSong),
  fastify.get('/:songId', getSongInfo),
  fastify.delete('/:songId', deleteSong),
  fastify.post('/create', createSong)
}