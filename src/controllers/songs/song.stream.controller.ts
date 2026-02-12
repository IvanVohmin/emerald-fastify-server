import type { FastifyRequest, FastifyReply } from "fastify";
import fs from "fs";
import path from "path";
import { SONGS_DIR } from "../../configs/config.js";
import type { TStreamSongRequest } from "../../types/index.js";

export const streamSong = (req: TStreamSongRequest, reply: FastifyReply) => {
  const { songId } = req.params;

  if (!songId) {
    return reply.status(400).send({ error: "Provide 'songId' in params" });
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
    reply.headers({
      "Content-Length": fileSize.toString(),
      "Content-Type": "audio/mpeg",
      "Accept-Ranges": "bytes",
    });

    const stream = fs.createReadStream(filePath);
    return reply.send(stream);
  }

  const parts = range.replace(/bytes=/, "").split("-");
  const start = parseInt(parts[0]!, 10);
  const end = parts[1]
    ? parseInt(parts[1], 10)
    : Math.min(start + 1_000_000, fileSize - 1);

  if (start >= fileSize || end >= fileSize) {
    return reply
      .status(416)
      .headers({
        "Content-Range": `bytes */${fileSize}`,
      })
      .send({ error: "Range not satisfiable" });
  }

  const chunkSize = end - start + 1;

  reply.code(206).headers({
    "Content-Range": `bytes ${start}-${end}/${fileSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": chunkSize.toString(),
    "Content-Type": "audio/mpeg",
  });

  const stream = fs.createReadStream(filePath, { start, end });
  return reply.send(stream);
};
