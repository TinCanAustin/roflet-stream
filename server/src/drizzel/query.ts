import { eq } from "drizzle-orm";
import { db } from "./index.ts";
import { type Songs, songsTable } from "./schema.ts";

export async function insertSong(_songbio:Songs) {
    await db.insert(songsTable).values(_songbio);
}

export async function deleteSong(_id:string) {
    return await db.delete(songsTable).where(eq(songsTable.id, _id)).returning();
}

export async function getSongs(){
    return await db.select().from(songsTable);
}

export async function getSong(_id:string){
    return await db.select().from(songsTable).where(eq(songsTable.id, _id));
}