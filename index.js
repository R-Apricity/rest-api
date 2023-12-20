import bodyParser from "body-parser";
import dotenv from "dotenv";
import express from "express";
const ffmpegPath = (await import("@ffmpeg-installer/ffmpeg")).path;
import ffmpeg from "fluent-ffmpeg";
import listEndpoints from 'express-list-routes'

import { default as apiroutes } from './lib/routes.js'
dotenv.config();
ffmpeg.setFfmpegPath(ffmpegPath);

const app = express();
const srv = app.listen(process.env.SERVER_PORT || process.env.PORT || 3000, () => {
  console.log(`Example app listening on port ${process.env.SERVER_PORT ||process.env.PORT || 3000}`);
});
srv.setTimeout(300000)
app.use(bodyParser.json());

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).send({ error: 'Invalid JSON format' })
  }
  next();
});


app.use("/api", apiroutes);
app.all("/", (req, res) => {
  res.send(
    `hello there, This is the available Routes, docs is coming soon (Dev Does Not Have Time To Make Docs)<br/>${listEndpoints(apiroutes, { prefix: '/api/', logger: async function(){} }).map(r=>r.path).join("<br/>")}`
  );
});


