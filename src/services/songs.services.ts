import db from "../db/index.js";
import {eq} from "drizzle-orm";
import {songsTable} from "../db/schema.js";
import type {InferInsertModel, InferSelectModel} from "drizzle-orm";
import type {IEditSongBody} from "../types/index.js";

class SongService {
    async createSong(
        songData: InferInsertModel<typeof songsTable>,
    ): Promise<InferInsertModel<typeof songsTable>[]> {
        const songDatabaseEntry = await db
            .insert(songsTable)
            .values(songData)
            .returning();

        return songDatabaseEntry;
    }

    async getSongById(
        songId: string,
    ): Promise<InferSelectModel<typeof songsTable>[]> {
        const songRecord = await db
            .select()
            .from(songsTable)
            .where(eq(songsTable.songId, songId));

        return songRecord;
    }

    async getUserSongs(userId: number) {
        const userSongs = await db
            .select()
            .from(songsTable)
            .where(eq(songsTable.ownerId, userId));

        return userSongs;
    }

    async editSong(
        oldSongData: InferSelectModel<typeof songsTable>,
        newSongData: IEditSongBody,
    ) {
        const updatedSongData = {
            ...oldSongData,
            ...newSongData,
        };

        if (JSON.stringify(oldSongData) === JSON.stringify(updatedSongData)) {
            return oldSongData;
        }

        const [updatedSongRecord] = await db
            .update(songsTable)
            .set(updatedSongData)
            .where(eq(songsTable.songId, oldSongData.songId))
            .returning();

        return updatedSongRecord;
    }

    async removeSong(songId: string) {
        const [songRecord] = await db
            .delete(songsTable)
            .where(eq(songsTable.songId, songId))
            .returning();

        return songRecord;
    }
}

export const songService = new SongService();