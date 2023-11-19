import bodyParser from "body-parser";
import dotenv from "dotenv";
import express from "express";
const ffmpegPath = (await import('@ffmpeg-installer/ffmpeg')).path;
import ffmpeg from 'fluent-ffmpeg'
dotenv.config();
ffmpeg.setFfmpegPath(ffmpegPath);

import axios from 'axios'
import Bard from "bard-ai";
import { BingChat } from "bing-chat-rnz";
import { generateImagesLinks } from "bimg";
import { Spotify } from "spotifydl-core";

try{
const characterAI = await new ((await import("node_characterai")).default)();
await characterAI.authenticateWithToken(process.env.CHARACTER_AI);

const spotify = new Spotify({
  clientId: process.env.SPOTIFY_ID,
  clientSecret: process.env.SPOTIFY_SECRET,
});

const bard = new Bard({
  "__Secure-1PSID": process.env.PSID_TOKEN,
  "__Secure-1PSIDTS": process.env.PSIDTS_TOKEN,
});
const sydneyAPI = new BingChat({
  cookie: process.env.BING_IMAGE_COOKIE,
});
const app = express();
app.use(bodyParser.json());
app.listen(3000, () => {
  console.log(`Example app listening on port 3000`);
});
app.use("/api", (req, res, next) => {
  if (req.method !== "POST")
    return res.status(400).send("Forbidden, Use POST not GET");
  if (!req.query.auth) return res.status(403).send("Forbidden, No Auth Key");
  if (req.query.auth !== process.env.authkey)
    return res.status(403).send("Forbidden, Invalid Key");
  if (!req.body.query)
    return res.status(400).send("Missing query parameters On Body");
  next();
});
app.get("/", (req, res) => {
  res.send(
    "hello there, please see the gh repo for the endpoints because the dev is too lazy to add it here"
  );
});
app.post("/api/bard", async (req, res) => {
  let convo = bard.createChat(req.body.creds ? req.body.creds : "");
  const resp = await convo.ask(req.body.query);
  res.json({ creds: { ...convo.export() }, response: resp });
});

app.post("/api/bimg", async (req, res) => {
    res.send(await generateImagesLinks(req.body.query));
});
app.post("/api/sydney", async (req, res) => {
    const resp = await sydneyAPI.sendMessage(req.body.query);
    res.json({ response: resp.text });
});

app.post("/api/cai/:characterid", async (req, res) => {
  const { characterid } = req.params;
  console.log(characterid);
  const chat = await characterAI.createOrContinueChat(characterid);
  const res2 = await chat.sendAndAwaitResponse(req.body.query, true);
  res.json({ data: { ...res2 }, response: res2.text || res });
});

app.post("/api/spotify", async (req, res) => {
  let url = req.body.query;
  if (
    !url.match(
      /^(?:https?:\/\/(?:open|play)\.spotify\.com\/)(?:embed)?\/?(track)(?::|\/)((?:[0-9a-zA-Z]){22})/i
    )
  ) url = await axios
      .get(
        await axios
          .get(url, {
            maxRedirects: 0,
            validateStatus: null,
          })
          .then((r) => r.headers.location)
      )
      .then((r) => r.data.split("\n")[249].split('"')[1]);

  res.json({
    details: { ...(await spotify.getTrack(url)) },
    response: await spotify.downloadTrack(url),
  });
});
}catch(e){
  res.status(500).json({error: r.stack.toString()})
}