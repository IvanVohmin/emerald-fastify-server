import {
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const songsTable = pgTable("songs", {
  id: serial("id").primaryKey(),
  ownerId: integer("owner_id").notNull(),
  songId: varchar("song_id").notNull(),
  posterUrl: varchar("poster_url").default(
    "https://i.pinimg.com/736x/79/4a/12/794a127ea189ca9c39e98aa79f9f7048.jpg",
  ),
  name: varchar("name").notNull().default("Some TikTok song"),
  author: varchar("author").notNull().default("Unknown Author"),
  tiktokUrl: varchar("tiktok_url").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const playlistTable = pgTable("playlists", {
  id: serial("id").primaryKey(),
  ownerId: integer("owner_id").notNull(),
  name: varchar("name").notNull(),
  description: text("description").default("No playlist description? Sucks."),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  posterUrl: varchar("poster_url").default(
    "https://i.pinimg.com/736x/79/4a/12/794a127ea189ca9c39e98aa79f9f7048.jpg",
  ),
  songs: jsonb("songs").notNull().default("[]"),
});

export const userTable = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email").notNull(),
  avatarUrl: varchar("avatar_url").default(
    "https://i.pinimg.com/736x/ec/0e/f1/ec0ef171d9c4606b76c4a6217461409a.jpg",
  ),
  firebaseUid: varchar("firebase_uid").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
