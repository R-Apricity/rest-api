import "express-async-errors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import express from "express";
const ffmpegPath = (await import("@ffmpeg-installer/ffmpeg")).path;
import ffmpeg from "fluent-ffmpeg";
import {default as apiroutes} from './lib/routes.js'
dotenv.config();
ffmpeg.setFfmpegPath(ffmpegPath);

const app = express();
app.use(bodyParser.json());
app.use("/api", apiroutes);
const rute = apiroutes.stack.map(r => {if(r.route !== undefined){ return r.route?.path}}).filter(Boolean).map(r => `/api` + r)

app.listen(process.env.SERVER_PORT || process.env.PORT || 3000, () => {
  console.log(`Example app listening on port ${process.env.SERVER_PORT ||process.env.PORT || 3000}`);
});
app.get("/", (req, res) => {
  
  res.send(
    `hello there, please see the gh repo for the endpoints because the dev is too lazy to add it here<br/>Nvm, the owner is now adding the routes<br/>${rute.join(`<br/>`)}`
  );
});
app.use((err, req, res, next) => {
  res.status(500).json({
    error: err.message,
    success: false,
  });
});

