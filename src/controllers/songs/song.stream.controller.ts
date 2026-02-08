import type { FastifyRequest, FastifyReply } from "fastify";
import fs from "fs";
import path from "path";
import { SONGS_DIR } from "../../configs/config.js";
import type { TStreamSongRequest } from "../../types/index.js";

export const streamSong = (req: TStreamSongRequest, reply: FastifyReply) => {
  const { songId } = req.params;

  if (!songId) {
    return reply.status(400).send({
      error: "Provide 'songId' in params",
    });
  }

  const filename = `${songId}.mp3`;

  if (filename.includes("..") || path.isAbsolute(filename)) {
    return reply.status(400).send({ error: "Invalid filename" });
  }

  const filePath = path.join(SONGS_DIR, filename);

  if (!fs.existsSync(filePath)) {
    return reply.status(404).send({ error: "File not found" });
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (!range) {
    return reply.code(416).send({ error: "Range header required" });
  }

  const parts = range.replace(/bytes=/, "").split("-");
  const start = Number(parts[0]);
  const end = parts[1]
    ? Number(parts[1])
    : Math.min(start + 1_000_000, fileSize - 1);

  const chunkSize = end - start + 1;

  const stream = fs.createReadStream(filePath, { start, end });

  reply.code(206).headers({
    "Content-Range": `bytes ${start}-${end}/${fileSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": chunkSize,
    "Content-Type": "audio/mpeg",
  });

  return reply.send(stream);
};
