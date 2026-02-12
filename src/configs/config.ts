import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const SONGS_DIR = path.resolve(__dirname, "../../songs");

export const JWT_SECRET = process.env.JWT_SECRET;

export const REDIS_KEYS = {
  songs: {
    prefix: "song",
    ttl: 60 * 60,
  },
  user: {
    prefix: "user",
    ttl: 60 * 60,
  }
};
