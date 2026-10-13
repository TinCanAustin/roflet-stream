import { fileURLToPath } from "node:url";
import path from "path";
import { config } from "dotenv";
import { Router } from "express";
import type { Request, Response } from "express";
import type { songIdParam } from "../dtos/audio.dot.ts";
import { getSong } from "../drizzel/query.ts";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


config({path: path.resolve(__dirname, "../.env")});

const songsRouter = Router();

songsRouter.get("/:id", 
    async (req: Request<songIdParam>, res: Response)=>{
        try{
            const song_id = req.params.id;

            const song_bio = await getSong(song_id);

            return res.status(200).send({
                error: false,
                data: song_bio
            });
            
        }catch(e){
            return res.status(500).send({
                error: true,
                message: "Something went wrong"
            });
        }
    }
);

export default songsRouter;
