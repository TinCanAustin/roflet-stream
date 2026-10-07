import { Router } from "express";
import type { Request, Response } from "express";
import type { authType } from "../dtos/auth.dot.ts";
import { config } from "dotenv";
import path from 'path';

config({path: path.resolve(import.meta.dirname, "../.env")});

const authRouter = Router();

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

export default authRouter;