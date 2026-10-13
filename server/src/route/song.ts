import { fileURLToPath } from "node:url";
import path from "path";
import { config } from "dotenv";
import { Router } from "express";
import type { Request, Response } from "express";
import type { bio, songIdParam } from "../dtos/audio.dot.ts";
import { getSong } from "../drizzel/query.ts";
import { GetObjectCommand, HeadObjectCommand, S3Client } from "@aws-sdk/client-s3";
import fs from "fs";
import { pipeline } from "stream/promises";
import type { Readable } from "node:stream";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CHUNK_SIZE = 500 * 1e3; // 500 * 10^-3 = 0.5 MB

config({path: path.resolve(__dirname, "../.env")});

const songsRouter = Router();
const s3 = new S3Client({region: process.env.AWS_REGION as string});

songsRouter.get("/:id", 
    async (req: Request<songIdParam>, res: Response)=>{
        try{
            const song_id = req.params.id;

            const song_bio : bio[] = await getSong(song_id);
            if(song_bio.length == 0){
                return res.status(404).send({
                    error: true,
                    message: "Song not found"
                });
            }

            const song_name = `${song_bio[0]?.id}-${song_bio[0]?.name}.mp3`;

            const e3_getInfo = new HeadObjectCommand({
                Bucket: process.env.AWS_S3_BUCKET as string,
                Key: song_name
            });          
            const fetchInfo = await s3.send(e3_getInfo);

            const audioSize = fetchInfo.ContentLength;
            if(audioSize == undefined) return res.status(500).send({error: true, message: "Unknown size"});

            const range = req.headers.range || "0";
            const start = Number(range.replace(/\D/g, "").slice(0)) || 0;
            const end = Math.min(start + CHUNK_SIZE - 1, audioSize - 1);

            if(start >= audioSize || start > end){
                res.setHeader("Content-Range", `bytes */${audioSize}`);
                return res.status(416).end();
            }

            const e3_getSong = new GetObjectCommand({
                Bucket: process.env.AWS_S3_BUCKET as string,
                Key: song_name,
                Range: `bytes=${start}-${end}`
            });
            const fetchFile = await s3.send(e3_getSong);

            const headers = {
                "Content-Range": `bytes ${start}-${end}/${audioSize}`,
                "Accept-Ranges": "bytes",
                "Content-Length": end - start + 1,
                "Content-Type": "audio/mpeg",
                "Transfer-Encoding": "chunked"
            };
            res.writeHead(206, headers);
            
            try{
                await pipeline(fetchFile.Body as Readable, res);
            }catch(e){
                console.log("Stream Ended");
            }
        }catch(e){
            console.log(e);
            return res.status(500).send({
                error: true,
                message: "Something went wrong"
            });
        }
    }
);

export default songsRouter;
