import { uuid, text, integer, timestamp, pgTable  } from "drizzle-orm/pg-core";

export const songsTable = pgTable('songs', {
    id: uuid('id').defaultRandom().primaryKey().notNull(),
    name: text('Name').notNull(),
    artist: text("Artist"),
    duration: integer('Duration').notNull(),
    thumbnail_link: text("Thumbnail Link"),
    song_link: text("Song Link").notNull()
});

export type songs = typeof songsTable.$inferInsert;