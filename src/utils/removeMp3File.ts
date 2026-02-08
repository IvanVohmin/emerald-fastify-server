import fs from "fs/promises";
import path from "path";
import { SONGS_DIR } from "../configs/config.js";

export const removeMp3File = async (filename: string): Promise<void> => {
    const filePath = path.join(SONGS_DIR, filename);

    try {
        await fs.access(filePath);
        await fs.unlink(filePath);
    } catch (error: any) {
        if (error.code === "ENOENT") return;
        throw new Error(`Failed to remove MP3 file: ${error.message}`);
    }
};