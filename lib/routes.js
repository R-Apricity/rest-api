import express from "express";
import axios from "axios";

// import { BingChat } from "bing-chat-rnz";
import Bard from "bard-ai";
import { generateImagesLinks } from "bimg";
const characterAI = new (await import("node_characterai")).default();

import { chromium } from "playwright-chromium";
import { youtubedlv2, youtubedl } from "@bochilteam/scraper";
import { weirdToNormalChars } from "weird-to-normal-chars";
import scrapeWebsitee from "scrape-websitee";
import yts from "yt-search";
import { Spotify } from "spotifydl-core";
import { createCaptchaSync } from "captcha-canvas";

import func from "./function.js";

const execpath =
  process.platform == "linux" && (process.env.P_SERVER_LOCATION || false)
    ? "/home/container/chromium/chrome"
    : "";

await characterAI.authenticateWithToken(process.env.CHARACTER_AI);
const browser = await chromium.launch({
  headless: process.platform == "linux" ? true : false,
  executablePath: execpath,
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

// const sydneyAPI = new BingChat({
//   cookie: process.env.BING_IMAGE_COOKIE,
// });

//Variables
let spotify_token;
await getToken();

const router = express.Router();
const airouter = express.Router();
const dlrouter = express.Router();
const utilityrouter = express.Router();

router.use("/", (req, res, next) => {
  if (req.method !== "POST")
    return res.status(400).send("Forbidden, Use POST not " + req.method);
  if (!req.query.auth) return res.status(403).send("Forbidden, No Auth Key");
  if (req.query.auth !== process.env.authkey)
    return res.status(403).send("Forbidden, Invalid Key");
  if (!req.body.query)
    return res.status(400).send("Missing query parameters On Body");
  next();
});

router.use("/ai", airouter);
router.use("/downloader", dlrouter);
router.use("/utility", utilityrouter);

await routererrhandler();
airouter.post("/bard", async (req, res) => {
  let convo = bard.createChat(req.body.creds ? req.body.creds : "");
  const resp = await convo.ask(req.body.query);
  res.json({ creds: { ...convo.export() }, response: resp });
});

airouter.post("/bimg", async (req, res) => {
  res.json({ response: await generateImagesLinks(req.body.query) });
});

// airouter.post("/sydney", async (req, res) => {
//   const resp = await sydneyAPI.sendMessage(req.body.query);
//   res.json({ response: resp.text, data: { ...resp } });
// });

airouter.post("/cai/:characterid", async (req, res) => {
  const { characterid } = req.params;
  const chat = await characterAI.createOrContinueChat(characterid);
  const res2 = await chat.sendAndAwaitResponse(req.body.query, true);
  res.json({ data: { ...res2 }, response: res2.text });
});

airouter.post("/zerogpt", async (req, res) => {
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

airouter.post("/blackbox", async (req, res) => {
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

airouter.post("/aivoicelist", async (req, res) => {
  //Use this script to get the latest character list on https://plachta-vits-umamusume-voice-synthesizer.hf.space/
  //the script is located inside /script/charlist.js
  res.json({ ...aivoice });
});

airouter.post("/animevoicegen", async (req, res) => {
  const body = req.body.query;
  if (!body.speed || !body.language || !body.character || !body.text)
    return res.status(400).send(`Invalid params`);
  if (!Object.keys(aivoice).includes(body.character.toLowerCase().trim()))
    return res.status(400).send(`Invalid character name`);
  res.json({ response: await func.aianimevoice(context, body) });
});

airouter.post("/chatgpt", async (req, res) => {
  const gptver = req.body.gptver;
  if (!gptver) throw new Error("No GPT version provided?");
  const query = req.body.query;
  const resp = await func.WRTNNewChatAndSendMessage(query, gptver);
  res.json({ response: resp.data.content, data: { ...resp } });
});

//Downloader

dlrouter.post("/youtube", async (req, res) => {
  const ae = await youtubedlv2(req.body.query).catch(
    await youtubedl(req.body.query)
  );
  res.json({ response: ae });
});

dlrouter.post("/tiktok", async (req, res) => {
  const ae = await scrapeWebsitee.downloader.tiktokdl(req.body.query);
  if (!ae.status) throw new Error(ae.message);
  res.json({ response: ae });
});

dlrouter.post("/instagram", async (req, res) => {
  const data = await scrapeWebsitee.downloader.igdl2(req.body.query);
  if (!data.status) throw new Error(data.message);
  res.json({ response: data });
});

dlrouter.post("/instagramstory", async (req, res) => {
  const data = await scrapeWebsitee.downloader.igStory(req.body.query);
  if (!data.status) throw new Error(data.message);
  res.json({ response: data });
});

dlrouter.post("/spotify", async (req, res) => {
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

utilityrouter.post("/captcha", async (req, res) => {
  const { image, text } = createCaptchaSync(300, 100);
  res.json({ response: text, image: image });
});

utilityrouter.post("/normalifytext", async (req, res) => {
  res.json({ response: weirdToNormalChars(req.body.query) });
});

utilityrouter.post("/youtubesearch", async (req, res) => {
  const data = await yts(req.body.query);
  console.log(data);
  res.json({ response: data });
});

utilityrouter.post("/spotifysearch", async (req, res) => {
  const response = await axios
    .get("https://api.spotify.com/v1/search", {
      params: {
        q: req.body.query || "",
        type: "track,album",
      },
      headers: {
        Authorization: "Bearer " + spotify_token,
      },
    })
    .then((r) => r.data);

  res.json({ response: response });
});

export default router;

process.on("unhandledRejection", async (err, origin) => {
  await routererrhandler();
});
process.on("uncaughtException", async (err, origin) => {
  await routererrhandler();
});
process.on("uncaughtExceptionMonitor", async (err, origin) => {
  await routererrhandler();
});
async function routererrhandler() {
  router.use((err, req, res, next) => {
    res.status(500).json({ error: err.toString() });
    next();
  });
}
async function getToken() {
  setInterval(async () => {
    await axios
      .post(
        "https://accounts.spotify.com/api/token",
        new URLSearchParams({
          grant_type: "client_credentials",
          client_id: process.env.SPOTIFY_ID,
          client_secret: process.env.SPOTIFY_SECRET,
        })
      )
      .then((r) => {
        spotify_token = r.data.access_token;
      });
  }, 3600000);
}
