import { Router } from "express";
import type { Request, Response } from "express";
import type { authType } from "../dtos/auth.dot.ts";
import { config } from "dotenv";
import AWS from 'aws-sdk';
import multer from "multer";
import fs from 'fs';
import { v4 } from "uuid";
import path from 'path';
import { error } from "console";


config({path: path.resolve(import.meta.dirname, "../.env")});

const authRouter = Router();
const s3 = new AWS.S3({region: process.env.AWS_REGION as string});
const audio = multer({dest: "audio/"});

const createReadStream = fs.createReadStream;

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
    (req: Request, res: Response)=>{
        // @ts-ignore
        if(!req.session.auth){
            res.status(200).json({'error': true, 'message': "Not logged in"});
            return;
        };

        const file = req.file;
        if(file){
            const id = v4();
            const fileKey = `${id}-${file.originalname}`;

            const s3Param = {
                Bucket: process.env.S3_BUCKET as string,
                Key: fileKey,
                Body: createReadStream(file.path),
                ContentType: file.mimetype
            }

            s3.upload(s3Param, (err: Error, data: AWS.S3.ManagedUpload.SendData)=>{
                if(err){
                    const awsError = err as AWS.AWSError;
                    console.log(`Upload failed (${awsError.code})`);
                    return res.status(500).send({
                        error: true,
                        message: `Upload failed (${awsError.code})`
                    });
                }

                const presignedUrlParams = {
                    Bucket: process.env.S3_BUCKET,
                    Key: fileKey,
                    Expires: 10 * 60
                }

                s3.getSignedUrl('getObject', presignedUrlParams, (err: Error, presignedUrl)=>{
                    if(err){
                        const awsError = err as AWS.AWSError;
                        console.log(`Upload failed (${awsError.code})`);
                        return res.status(500).send({
                            error: true,
                            message: `Upload failed (${awsError.code})`
                        });
                    }

                    res.status(200).send({
                        error: false,
                        body: {
                            message: "File uploaded",
                            url: data.Location,
                            presignedUrl: presignedUrl
                        }
                    });
                });
            });
        }

    }
);

export default authRouter;