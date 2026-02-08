import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { mkdir } from 'fs/promises';
import { SONGS_DIR } from '../configs/config.js';

await mkdir(SONGS_DIR, { recursive: true });

export const saveMp3File = async (mp3Url: string, filename: string): Promise<string> => {
    try {
        const response = await axios({
            method: 'GET',
            url: mp3Url,
            responseType: 'stream',
            validateStatus: (status) => status === 200,
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; AudioBot/1.0)'
            },
            timeout: 15_000
        });

        const filePath = path.join(SONGS_DIR, filename);
        const writer = fs.createWriteStream(filePath);

        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', () => resolve(filePath));
            writer.on('error', (err) => {
                console.error('Error saving file:', err);
                reject(err);
            });
        });
    } catch (error: any) {
        console.error('saveMp3File error:', error.message || error);
        throw new Error(`Failed to save MP3 file: ${error.message || error}`);
    }
};