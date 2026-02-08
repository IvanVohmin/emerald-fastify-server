import { md5 } from "./md5.js"

// Здесь идет уникальная генерация ID песни на основе описания, имени автора и TikCdnId
export const generateSongId = (
    title: string,
    thumbnail: string,
    ownerId: number,
): string => {
    return md5(`${title}-${thumbnail}-${ownerId}`)
}