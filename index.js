import bodyParser from "body-parser";
import dotenv from "dotenv";
const ffmpegPath = (await import("@ffmpeg-installer/ffmpeg")).path;
import ffmpeg from "fluent-ffmpeg";
import express from "express";
import listEndpoints from 'express-list-routes'
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUI from 'swagger-ui-express'
//Routes
import { default as apiroutes } from './lib/routes.js'

///Init
dotenv.config();
ffmpeg.setFfmpegPath(ffmpegPath); 
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Rest-Api',
      version: 'docs-beta-v1.0.0',
    },
  },
  apis: ['./lib/routes.js'], // Path to your route files
};

const app = express();

app.listen(process.env.SERVER_PORT || process.env.PORT || 3000, () => {
  console.log(`Example app listening on port ${process.env.SERVER_PORT ||process.env.PORT || 3000}`);
}).setTimeout(300000)

app.use(bodyParser.json());
app.use("/api", apiroutes);
app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerJsdoc(options)));
apiroutes.use(async (err, req, res, next) => {
  return res.status(500).json({ error: err.stack.toString() });
});
apiroutes.use((err, req, res, next) => {
  return res.status(500).json({ error: err.stack.toString() });
});
apiroutes.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).send({ error: 'Invalid JSON format' })
  }
  next();
});

app.all("/", (req, res) => {
  res.send(
    `hello there, This is the available Routes, docs <a href="/docs">is located here</a> <br/>${listEndpoints(apiroutes, { prefix: '/api/', logger: async function(){} }).map(r=>r.path).join("<br/>")}`
  );
});
