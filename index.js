import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv"; dotenv.config();
import Bard from "bard-ai";
import { BingChat } from "bing-chat-rnz";
import { generateImagesLinks } from "bimg";
import CharacterAI from "node_characterai";
const characterAI = new CharacterAI();
import { Spotify } from 'spotifydl-core'

const spotify = new Spotify({
  clientId: process.env.SPOTIFY_ID,
  clientSecret: process.env.SPOTIFY_SECRET
})
await characterAI.authenticateWithToken(process.env.CHARACTER_AI)
const app = express();

app.listen(3000, () => {
  console.log(`Example app listening on port 3000`);
});

const bard = new Bard({
  "__Secure-1PSID": process.env.PSID_TOKEN,
  "__Secure-1PSIDTS": process.env.PSIDTS_TOKEN,
});
const sydneyAPI = new BingChat({
  cookie: process.env.BING_IMAGE_COOKIE,
});

app.use(bodyParser.json());
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
  res.send("hello");
});

app.post("/api/bard", async (req, res) => {
    let convo = bard.createChat(req.body.creds ? req.body.creds : "");
    const resp = await convo.ask(req.body.query);
    res.json({ creds: { ...convo.export() }, response: resp });
});

app.post("/api/bimg", async (req, res) => {
  try {
    res.send(await generateImagesLinks(req.body.query));
  } catch (e) {
    res.status(500).send(e);
  }
});
app.post("/api/sydney", async (req, res) => {
  try {
    const resp = await sydneyAPI.sendMessage(req.body.query);
    res.json({ response: resp.text });
  } catch (e) {
    res.status(500).send(e);
  }
});

app.post("/api/cai/:characterid", async(req, res) => {
  const {characterid} = req.params;
  console.log(characterid)
  const chat = await characterAI.createOrContinueChat(characterid);
  const res2 = await chat.sendAndAwaitResponse(req.body.query, true);
   res.json({data: {...res2}, response: (res2.text || res)})
});
