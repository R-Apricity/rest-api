import express from "express";
import "express-async-errors";

import axios from "axios";
import Bard from "bard-ai";
import { BingChat } from "bing-chat-rnz";
import { generateImagesLinks } from "bimg";
import { Spotify } from "spotifydl-core";
import { createCaptchaSync } from "captcha-canvas";
const characterAI = new (await import("node_characterai")).default();
await characterAI.authenticateWithToken(process.env.CHARACTER_AI);
import { chromium } from "playwright-chromium";
import func from "./function.js";
const browser = await chromium.launch({
  headless: process.platform == "linux" ? true : false,
  // executablePath: process.platform == "linux" ? "/home/container/chromium/chrome": ""
});
const context = await browser.newContext();

//Config Files (JSON)
import aivoice from "../json/voice-ai-character.json" assert { type: "json" };
//Startup Func
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

const router = express.Router();

router.use("/", (req, res, next) => {
  if (req.method !== "POST")
    return res.status(400).send("Forbidden, Use POST not GET");
  if (!req.query.auth) return res.status(403).send("Forbidden, No Auth Key");
  if (req.query.auth !== process.env.authkey)
    return res.status(403).send("Forbidden, Invalid Key");
  if (!req.body.query)
    return res.status(400).send("Missing query parameters On Body");
  next();
});

router.post("/bard", async (req, res) => {
  let convo = bard.createChat(req.body.creds ? req.body.creds : "");
  const resp = await convo.ask(req.body.query);
  res.json({ creds: { ...convo.export() }, response: resp });
});

router.post("/bimg", async (req, res) => {
  res.json({ response: await generateImagesLinks(req.body.query) });
});
router.post("/sydney", async (req, res) => {
  const resp = await sydneyAPI.sendMessage(req.body.query);
  res.json({ response: resp.text, data: { ...resp } });
});

router.post("/cai/:characterid", async (req, res) => {
  const { characterid } = req.params;
  console.log(characterid);
  const chat = await characterAI.createOrContinueChat(characterid);
  const res2 = await chat.sendAndAwaitResponse(req.body.query, true);
  res.json({ data: { ...res2 }, response: res2.text || res });
});
router.post("/zerogpt", async (req, res) => {
  await axios
    .post(
      "https://api.zerogpt.com/api/detect/detectText",
      {
        input_text: req.body.query,
      },
      {
        headers: {
          "content-type": "application/json",
          origin: "https://www.zerogpt.com",
          "sec-fetch-site": "same-site",
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
        },
      }
    )
    .then((r) => res.json({ response: { ...r.data } }));
});
router.post("/blackbox", async (req, res) => {
  await axios
    .post(
      "https://www.useblackbox.io/chat-request-v4",
      {
        textInput: req.body.query,
        allMessages: [
          {
            user: req.body.query,
          },
        ],
        stream: "",
        clickedContinue: false,
      },
      {
        headers: {
          authority: "www.useblackbox.io",
          "content-type": "application/json",
          "x-requested-with": "XMLHttpRequest",
        },
      }
    )
    .then((response) => {
      if (response.data.status !== "success") throw new Error(response.data);
      res.json({ response: response.data.response[0][0] });
    })
    .catch((e) => {
      throw e;
    });
});
router.post("/aivoicelist", async (req, res) => {
  //Use this script to get the latest character list on https://plachta-vits-umamusume-voice-synthesizer.hf.space/
  //the script is located inside /script/charlist.js
  res.json({ ...aivoice });
});
router.post("/animevoicegen", async (req, res) => {
  const body = req.body.query;
  if (!body.speed || !body.language || !body.character || !body.text)
    return res.status(400).send(`Invalid params`);
  if (!Object.keys(aivoice).includes(body.character.toLowerCase()))
    return res.status(400).send(`Invalid character name`);
  res.json({ response: await func.aianimevoice(context, body) });
});
router.post("/chatgpt", async (req, res) => {
  const gptver = req.body.gptver;
  if (!gptver) throw new Error("No GPTVER?");
  const query = req.body.gptver;
  const resp = await func.WRTNNewChatAndSendMessage(query, gptver);
  res.json({ response: resp.data.content, data: { ...resp } });
});

//Downloader
router.post("/spotify", async (req, res) => {
  let url = req.body.query;
  if (
    !url.match(
      /^(?:https?:\/\/(?:open|play)\.spotify\.com\/)(?:embed)?\/?(track)(?::|\/)((?:[0-9a-zA-Z]){22})/i
    )
  )
    url = await axios
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
//Generate things
router.post("/captcha", async (req, res) => {
  const { image, text } = createCaptchaSync(300, 100);
  res.json({ response: text, image: image });
});

export default router;
