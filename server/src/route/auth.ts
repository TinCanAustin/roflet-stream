import { Router } from "express";
import type { Request, Response } from "express";
import type { authType } from "../dtos/auth.dot.ts";
import { config } from "dotenv";
import { S3Client, S3ServiceException } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import multer from "multer";
import fs from 'fs';
import { v4 } from "uuid";
import path from 'path';
import type { bio } from "../dtos/audio.dot.ts";
import type { Songs } from "../drizzel/schema.ts";
import { deleteSong, insertSong } from "../drizzel/query.ts";
import { fileURLToPath } from "url";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({path: path.resolve(__dirname, "../.env")});

const authRouter = Router();
const s3 = new S3Client({region: process.env.AWS_REGION as string});
const audio = multer({dest: "audio/"});

const createReadStream = fs.createReadStream;

const Bucket = process.env.AWS_S3_BUCKET;
if (!Bucket) throw new Error("AWS_S3_BUCKET is not set");

authRouter.post("/", 
    (req: Request<{}, {}, authType>, res: Response)=>{
        const username = req.body.username;
        const password = req.body.password;

        if(username != process.env.AUTH_USERNAME || password != process.env.AUTH_PASSWORD){
            res.status(401).json({"error" : true, "message" : "invalid username or password"});
            return;
        }
        //@ts-ignore
        req.session.auth = true;
        res.status(200).json({"error": false, "message": "Login sucessful"});
    }
);

authRouter.get("/validate", 
    (req: Request, res: Response)=>{
        // @ts-ignore
        if(!req.session.auth){
            res.status(200).json({'error': false, 'valid': false});
            return;
        };
        res.status(200).json({'error': false, 'valid': true});
    }
);

authRouter.post("/upload", audio.single('file'),
    async (req: Request<{}, {}, bio>, res: Response)=>{
        // @ts-ignore
        if(!req.session.auth){
            res.status(401).json({'error': true, 'message': "Not logged in"});
            return;
        };

        const file = req.file;

        const name = req.body.name;
        const artist = req.body.artist;
        const duration = req.body.duration;

        if(file && name != undefined && artist != undefined && duration != undefined){
            const id = v4();
            const fileKey = `${id}-${file.originalname}`;

            console.log("Uploaded file type:", file.mimetype);

            try{
                const _bio : Songs = {
                    id: id,
                    name: name,
                    artist: artist,
                    duration: duration
                }
                await insertSong(_bio);

                const s3Upload = new Upload({
                    client: s3,
                    params: {
                        Bucket: process.env.AWS_S3_BUCKET as string,
                        Key: fileKey,
                        Body: createReadStream(file.path),
                        ContentType: file.mimetype
                    }
                });

                const data = await s3Upload.done();

                return res.status(200).send({
                    error: false,
                    body: {
                        message: "File Uploaded",
                        url: data.Location
                    }
                });
            }catch(err){
                if(err instanceof S3ServiceException){
                    await deleteSong(id);
                    return res.status(500).send({
                        error: true,
                        message: `S3 Upload failed (${err.name})`
                    });
                }else{
                    await deleteSong(id);
                    return res.status(500).send({
                        error: true,
                        message: `DB bio upload failed`
                    })
                }
            }
        }else{
            return res.status(400).send({
                error: true,
                message: "Missing required fields or file."
            });
        }
    }
);

export default authRouter;