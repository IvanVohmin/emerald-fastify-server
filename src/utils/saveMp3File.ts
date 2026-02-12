import axios from "axios";
import fs from "fs";
import path from "path";
import { mkdir } from "fs/promises";
import { SONGS_DIR } from "../configs/config.js";

await mkdir(SONGS_DIR, { recursive: true });

export const saveMp3File = async (
  mp3Url: string,
  filename: string,
): Promise<string> => {
  try {
    const response = await axios({
      method: "GET",
      url: mp3Url,
      responseType: "stream",
      validateStatus: (status) => status >= 200 && status < 400,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "*/*",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        Referer: "https://www.tiktok.com/",
        Origin: "https://www.tiktok.com",
        Connection: "keep-alive",
        "Sec-Fetch-Dest": "audio",
        "Sec-Fetch-Mode": "no-cors",
        "Sec-Fetch-Site": "cross-site",
        Range: "bytes=0-",
      },
      timeout: 30_000,
      maxRedirects: 10,
    });

    const filePath = path.join(SONGS_DIR, filename);
    const writer = fs.createWriteStream(filePath);

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on("finish", () => {
        const stats = fs.statSync(filePath);
        resolve(filePath);
      });

      writer.on("error", (err) => {
        console.error("Error saving file:", err);
        reject(err);
      });

      response.data.on("error", (err: any) => {
        console.error("Stream error:", err);
        reject(err);
      });
    });
  } catch (error: any) {
    console.error("saveMp3File error:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      headers: error.response?.headers,
    });
    throw new Error(`Failed to save MP3 file: ${error.message || error}`);
  }
};
