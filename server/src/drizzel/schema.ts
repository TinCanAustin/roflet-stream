import { uuid, text, integer, pgTable  } from "drizzle-orm/pg-core";

export const songsTable = pgTable('songs', {
    id: uuid('id').defaultRandom().primaryKey().notNull(),
    name: text('Name').notNull(),
    artist: text("Artist"),
    fileFormat: text("File_Format"),
    thumbnail_link: text("Thumbnail_Link")
});

export type Songs = typeof songsTable.$inferInsert;