import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Creating file stream
const statSync = fs.statSync;
const createReadStream = fs.createReadStream;

const app = express();
const PORT = 3000;

app.use(cors());

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ASSETS_PATH = join(__dirname, "temp_assets");

app.get("/audio", (req: Request, res: Response)=>{
    const fliePath = join(ASSETS_PATH, "test.wav");
    const CHUNK_SIZE = 500 * 1e3; // 500 * 10^-3 = 0.5 MB

    const range = req.headers.range || "0"; // When request is made it returns something like "bytes=0-1023" or something similar.
    const audioSize = statSync(fliePath).size;

    const start = Number(range.replace(/\D/g, "")); // /D means all non digit carecters and replace them with nothing. SO "bytes=0-1023" would give "01023"
    const end = Math.min(start + CHUNK_SIZE, audioSize - 1);
    const contentLenght = end - start + 1;

    const headers = {
        "Content-Range": `bytes ${start}-${end}/${audioSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLenght,
        "Content-Type": "audio/mpeg",
        "Transfer-Encoding": "chunked"
    };

    res.writeHead(206, headers);

    const stream = createReadStream(fliePath, {start, end});
    stream.pipe(res);
});

app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`);
});
