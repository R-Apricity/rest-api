import express from "express";
import axios from "axios";
import d from "crypto";

import { BingChat } from "bing-chat-rnz";
import WebSocket from "ws";
import Bard from "bard-ai";
import { generateImagesLinks } from "bimg-new";
import * as googleTTS from '@sefinek/google-tts-api'; // ES6 or TypeScript

const characterAI = new (await import("node_characterai")).default();
const {Google, Musixmatch} = (await import("@flytri/lyrics-finder"))

import { weirdToNormalChars } from "weird-to-normal-chars";
import { createCaptchaSync } from "captcha-canvas";
import { TiktokDL } from "@tobyg74/tiktok-api-dl";
import { Spotify } from "spotifydl-core";
import scrapeWebsitee from "scrape-websitee";
import yts from "yt-search";
import func from "./function.js";

await characterAI.authenticateWithToken(process.env.CHARACTER_AI, process.env.CHARACTER_AI_ID);

//Read Config Files (JSON)
import animeaivc from "../json/voice-ai-character.json" assert { type: "json" };
import prodiajson from "../json/prodia.json" assert { type: "json" };

//Setting up
const spotify = new Spotify({
  clientId: process.env.SPOTIFY_ID,
  clientSecret: process.env.SPOTIFY_SECRET,
});

const bard = new Bard({
  "__Secure-1PSID": process.env.PSID_TOKEN,
  "__Secure-1PSIDTS": process.env.PSIDTS_TOKEN,
});

const sydneyAPI = new BingChat({
  cookie: process.env.BING_U_COOKIE,
});

//Variables
let spotify_token;
await getToken();
const router = express.Router();
const airouter = express.Router();
const dlrouter = express.Router();
const utilityrouter = express.Router();

router.use(async (req, res, next) => {
  if (req.method !== "POST")
    return res
      .status(400)
      .json({ error: "Forbidden, Use POST not " + req.method });
  if (!req.body.query)
    return res.status(400).json({ error: "Missing query parameters on Body" });
  if ((process.env.auth_enabled || "false") == "true") {
    if (!req.query.auth)
      return res.status(403).json({ error: "Forbidden, No Auth Key" });
    if (req.query.auth !== process.env.authkey)
      return res.status(403).json({ error: "Forbidden, Invalid Key" });
    return next();
  } else {
    return next();
  }
});

router.use("/ai", airouter);
router.use("/downloader", dlrouter);
router.use("/utility", utilityrouter);
await routererrhandler();
airouter.post("/bard", async (req, res) => {
  /**
   * @swagger
   * /api/ai/bard:
   *   post:
   *     summary: Ask google-bard AI.
   *     tags:
   *       - AI
   *     parameters:
   *       - in: query
   *         name: auth
   *         schema:
   *           type: string
   *         required: false
   *         description: Auth query parameter
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               query:
   *                 type: string
   *                 example: Who are you?
   *               creds:
   *                 type: object
   *                 example: {}
   *     responses:
   *       200:
   *         description: Server Successful processed the request
   *       400:
   *         description: Client missing variable or specify an invalid variable value
   *       500:
   *         description: Server failed process your request
   *       403:
   *         description: Client did not specify an auth token
   */
  let convo = bard.createChat(req.body.creds ? req.body.creds : "");
  const resp = await convo.ask(req.body.query);
  res.json({ creds: { ...convo.export() }, response: resp });
});

airouter.post("/sydney", async (req, res) => {
  /**
   * @swagger
   * /api/ai/sydney:
   *   post:
   *     summary: Ask Bing AI.
   *     tags:
   *       - AI
   *     parameters:
   *       - in: query
   *         name: auth
   *         schema:
   *           type: string
   *         required: false
   *         description: Auth query parameter
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               query:
   *                 type: object
   *                 properties:
   *                   text:
   *                     type: String
   *                     example: Who are you?
   *                   variant:
   *                     type: string
   *                     example: Creative
   *     responses:
   *       200:
   *         description: Server Successful processed the request
   *       400:
   *         description: Client missing variable or specify an invalid variable value
   *       500:
   *         description: Server failed process your request
   *       403:
   *         description: Client did not specify an auth token
   */
  let { text, variant } = req.body.query;
  if (
    !variant ||
    !["Balanced", "Precise", "Creative"].includes(variant.toString().trim())
  )
    variant = "Balanced";
  const ret = await sydneyAPI.sendMessage(text, { variant });
  res.json({ response: ret.text, data: { ...ret, text, variant } });
});

airouter.post("/bimg", async (req, res) => {
  /**
   * @swagger
   * /api/ai/bimg:
   *   post:
   *     summary: Generate Image with Microsoft Image Creator AI (Powered by DALL-E 3)
   *     tags:
   *       - AI
   *     parameters:
   *       - in: query
   *         name: auth
   *         schema:
   *           type: string
   *         required: false
   *         description: Auth query parameter
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               query:
   *                 type: string
   *                 example: A car on the beach
   *     responses:
   *       200:
   *         description: Server Successful processed the request
   *       400:
   *         description: Client missing variable or specify an invalid variable value
   *       500:
   *         description: Server failed process your request
   *       403:
   *         description: Client did not specify an auth token
   */
  const resp = await generateImagesLinks(req.body.query);
  res.json({ response: resp.filter((x) => !x.includes("r.bing.com")) });
});

airouter.post("/chatgpt", async (req, res) => {
  /**
   * @swagger
   * /api/ai/chatgpt:
   *   post:
   *     summary: Chat with ChatGPT using GPT 3.5, GPT 3.5_16k or GPT 4.
   *     tags:
   *       - AI
   *     parameters:
   *       - in: query
   *         name: auth
   *         schema:
   *           type: string
   *         required: false
   *         description: Auth query parameter
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               query:
   *                 type: object
   *                 properties:
   *                   text:
   *                     type: string
   *                     example: Who are you?
   *                   gptver:
   *                     type: string
   *                     example: 3.5_16k
   *                   chatid:
   *                     type: string
   *                     example: 6587c739b3966dc7d6f1578e

   *     responses:
   *       200:
   *         description: Server Successful processed the request
   *       400:
   *         description: Client missing variable or specify an invalid variable value
   *       500:
   *         description: Server failed process your request
   *       403:
   *         description: Client did not specify an auth token
   */
  const { gptver = "3.5_16k", text = "Who are you?", chatid } = req.body.query;
  const resp = await func.WRTNNewChatAndSendMessage(text, gptver, chatid);
  res.json({ response: resp.data.content, data: { ...resp, gptver, text } });
});

airouter.post("/gemini", async (req, res) => {
  /**
   * @swagger
   * /api/ai/gemini:
   *   post:
   *     summary: Ask google-gemini AI.
   *     tags:
   *       - AI
   *     parameters:
   *       - in: query
   *         name: auth
   *         schema:
   *           type: string
   *         required: false
   *         description: Auth query parameter
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               query:
   *                 type: string
   *                 example: Who are you?
   *     responses:
   *       200:
   *         description: Server Successful processed the request
   *       400:
   *         description: Client missing variable or specify an invalid variable value
   *       500:
   *         description: Server failed process your request
   *       403:
   *         description: Client did not specify an auth token
   */
  const {data} = await axios.post(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + process.env.GOOGLE_AI_STUDIO_KEY,
    {
      'contents': [
        {
          'parts': [
            {
              'text': req.body.query
            }
          ]
        }
      ],
      'generationConfig': {
        'temperature': 0.9,
        'topK': 1,
        'topP': 1,
        'maxOutputTokens': 2048,
        'stopSequences': []
      },
      'safetySettings': [
        {
          'category': 'HARM_CATEGORY_HARASSMENT',
          'threshold': 'BLOCK_ONLY_HIGH'
        },
        {
          'category': 'HARM_CATEGORY_HATE_SPEECH',
          'threshold': 'BLOCK_ONLY_HIGH'
        },
        {
          'category': 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          'threshold': 'BLOCK_ONLY_HIGH'
        },
        {
          'category': 'HARM_CATEGORY_DANGEROUS_CONTENT',
          'threshold': 'BLOCK_ONLY_HIGH'
        }
      ]
    },
    {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
  if(data.promptFeedback.blockReason){
    throw new Error(`Your request is blocked because ${data.promptFeedback.blockReason} concerns`)
  }
  res.json({ response: data.candidates[0].content.parts[0].text})
});

airouter.post("/characterai/:characterid", async (req, res) => {
  /**
   * @swagger
   * /api/ai/characterai/{characterid}:
   *   post:
   *     summary: Chat with Character AI
   *     tags:
   *       - AI
   *     parameters:
   *       - in: path
   *         name: characterid
   *         schema:
   *           type: string
   *         required: true
   *         description: Character ID
   *       - in: query
   *         name: auth
   *         schema:
   *           type: string
   *         required: false
   *         description: Auth query parameter
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               query:
   *                 type: string
   *                 example: Who are you?
   *     responses:
   *       200:
   *         description: Server Successful processed the request
   *       400:
   *         description: Client missing variable or specify an invalid variable value
   *       500:
   *         description: Server failed process your request
   *       403:
   *         description: Client did not specify an auth token
   */
  const { characterid } = req.params;
  const chat = await characterAI.createOrContinueChat(characterid);
  const res2 = await chat.sendAndAwaitResponse(req.body.query, true);
  res.json({ response: res2.text, data: { ...res2 } });
});

airouter.post("/animevoicelist", async (req, res) => {
  /**
   * @swagger
   * /api/ai/animevoicelist:
   *   post:
   *     summary: Get anime voice object.
   *     tags:
   *       - AI
   *     parameters:
   *       - in: query
   *         name: auth
   *         schema:
   *           type: string
   *         required: false
   *         description: Auth query parameter
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               query:
   *                 type: string
   *                 example: Nothing
   *
   *     responses:
   *       200:
   *         description: Server Successful processed the request
   *       400:
   *         description: Client missing variable or specify an invalid variable value
   *       500:
   *         description: Server failed process your request
   *       403:
   *         description: Client did not specify an auth token
   */
  //Use this script to get the latest character list on https://plachta-vits-umamusume-voice-synthesizer.hf.space/
  //the script is located inside /script/charlist.js
  res.json({ response: { ...animeaivc } });
});

airouter.post("/animevoicelistkeys", async (req, res) => {
  /**
   * @swagger
   * /api/ai/animevoicelistkeys:
   *   post:
   *     summary: Get anime voice keys.
   *     tags:
   *       - AI
   *     parameters:
   *       - in: query
   *         name: auth
   *         schema:
   *           type: string
   *         required: false
   *         description: Auth query parameter
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               query:
   *                 type: string
   *                 example: Nothing
   *
   *     responses:
   *       200:
   *         description: Server Successful processed the request
   *       400:
   *         description: Client missing variable or specify an invalid variable value
   *       500:
   *         description: Server failed process your request
   *       403:
   *         description: Client did not specify an auth token
   */
  res.json({ response: Object.keys(animeaivc) });
});

airouter.post("/animevoicegen", async (req, res) => {
  /**
   * @swagger
   * /api/ai/animevoicegen:
   *   post:
   *     summary: Generate AI Anime Voice.
   *     tags:
   *       - AI
   *     parameters:
   *       - in: query
   *         name: auth
   *         schema:
   *           type: string
   *         required: false
   *         description: Auth query parameter
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               query:
   *                 type: object
   *                 properties:
   *                   language:
   *                     type: String
   *                     example: English
   *                   speed:
   *                     type: number
   *                     example: 1
   *                   character:
   *                     type: string
   *                     example: 派蒙 Paimon (Genshin Impact)
   *                   text:
   *                     type: string
   *                     example: To be honest, I have no idea what to say as examples.
   *     responses:
   *       200:
   *         description: Server Successful processed the request
   *       400:
   *         description: Client missing variable or specify an invalid variable value
   *       500:
   *         description: Server failed process your request
   *       403:
   *         description: Client did not specify an auth token
   */
  let {
    speed,
    character,
    language,
    text,
  } = req.body.query;
  if (!["English", "简体中文", "日本語"].includes(language))
    language = "English";

  character = character.toLowerCase().trim();
  if (Object.keys(animeaivc).includes(character)) {
    character = animeaivc[character];
  } else if (!Object.values(animeaivc).includes(character)) {
    character = "派蒙 Paimon (Genshin Impact)";
  }
  if (Number(speed) == NaN){
    speed = 1
  }
  const socket = new WebSocket(
    "wss://plachta-vits-umamusume-voice-synthesizer.hf.space/queue/join"
  );
  let sessionHash = Math.random().toString(36).substring(2);
  let link;

  socket.onopen = () => console.log("Connected to umamusume websocket");

  socket.onmessage = async(event) => {
    const message = JSON.parse(event.data);
    switch (message["msg"]) {
      case "send_hash":
        socket.send(JSON.stringify({ session_hash: sessionHash, fn_index: 2 }));
        break;
      case "send_data":
         socket.send(
          JSON.stringify({
            fn_index: 2,
            data: [text || "To be honest, I have no idea what to say as examples.", character, language, Number(speed), false],
            session_hash: sessionHash,
          })
        );
        break;
      case "process_completed":
        if(!message.success) {
    return res.status(500).json({ error: "An error occured while processing your request" });
        }
        link =
          "https://plachta-vits-umamusume-voice-synthesizer.hf.space/file=" +
          message["output"].data[1].name;
        break;
    }
  };
  socket.onerror = (err) => {
    throw new Error(err);
  }
  socket.onclose = async() => {
    const lonk = await func.Pomfup(await func.convertWavToMp3(await axios.get(link, {responseType: "arraybuffer"}).then(r => r.data)), "audio.mp3")
    res.json({ response: lonk, data: { text: (text || "To be honest, I have no idea what to say as examples."), character, speed, language } });}
});

airouter.post("/prodiaimagegen", async (req, res) => {
  /**
   * @swagger
   * /api/ai/prodiaimagegen:
   *   post:
   *     summary: Generate AI Image.
   *     tags:
   *       - AI
   *     parameters:
   *       - in: query
   *         name: auth
   *         schema:
   *           type: string
   *         required: false
   *         description: Auth query parameter
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               query:
   *                 type: object
   *                 properties:
   *                   positive_prompt:
   *                     type: string
   *                     example: man standing inside a cafe
   *                   negative_prompt:
   *                     type: string
   *                     example: low quality, badly drawn, nsfw
   *                   model:
   *                     type: string
   *                     example: cetusMix_Version35.safetensors [de2f2560]
   *                   steps:
   *                     type: string
   *                     description: Optional
   *                     example: 20
   *                   cfg:
   *                     type: string
   *                     description: Optional
   *                     example: 7
   *                   seed:
   *                     type: string
   *                     description: Optional
   *                     example: 1
   *     responses:
   *       200:
   *         description: Server Successful processed the request
   *       400:
   *         description: Client missing variable or specify an invalid variable value
   *       500:
   *         description: Server failed process your request
   *       403:
   *         description: Client did not specify an auth token
   */
  let { positive_prompt, negative_prompt, model, steps, cfg, seed } =
    req.body.query;
  positive_prompt = positive_prompt || "man standing inside a cafe";
  negative_prompt = negative_prompt || "low quality, badly drawn, nsfw";
  model = model || "cetusMix_Version35.safetensors [de2f2560]";
  if (!prodiajson.includes(model) || !prodiajson.includes(decodeURI(model))) {
    model = "cetusMix_Version35.safetensors [de2f2560]";
  }
  steps = steps || "20";
  cfg = cfg || "7";
  seed = seed || Buffer.from(d.randomBytes(4)).readUInt32BE(0);
  const url = await func.ProdiaImageGen(
    positive_prompt,
    negative_prompt,
    model,
    steps,
    cfg,
    seed
  );
  res.json({
    response: url,
    data: { positive_prompt, negative_prompt, model, steps, cfg, seed },
  });
});

airouter.post("/zerogpt", async (req, res) => {
  /**
   * @swagger
   * /api/ai/zerogpt:
   *   post:
   *     summary: Check your assignment for any text made with AI.
   *     tags:
   *       - AI
   *     parameters:
   *       - in: query
   *         name: auth
   *         schema:
   *           type: string
   *         required: false
   *         description: Auth query parameter
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               query:
   *                 type: string
   *                 example: A cell is the fundamental structural and functional unit of all living organisms. It is the smallest unit of life, capable of independently carrying out the processes necessary for survival. Cells can be prokaryotic or eukaryotic, with key components such as a cell membrane, cytoplasm, and genetic material. Prokaryotic cells lack a nucleus, while eukaryotic cells have a distinct nucleus enclosed in a membrane. Within cells, organelles perform specific functions, such as the mitochondria for energy production and the endoplasmic reticulum for protein synthesis. Cells replicate through mitosis or meiosis, ensuring the continuity of life and genetic diversity in organisms.
   *     responses:
   *       200:
   *         description: Server Successful processed the request
   *       400:
   *         description: Client missing variable or specify an invalid variable value
   *       500:
   *         description: Server failed process your request
   *       403:
   *         description: Client did not specify an auth token
   */

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
  /**
   * @swagger
   * /api/ai/blackbox:
   *   post:
   *     summary: Use blackbox AI to generate codes!.
   *     tags:
   *       - AI
   *     parameters:
   *       - in: query
   *         name: auth
   *         schema:
   *           type: string
   *         required: false
   *         description: Auth query parameter
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               query:
   *                 type: string
   *                 example: Make a simple webserver using nodejs
   *     responses:
   *       200:
   *         description: Server Successful processed the request
   *       400:
   *         description: Client missing variable or specify an invalid variable value
   *       500:
   *         description: Server failed process your request
   *       403:
   *         description: Client did not specify an auth token
   */

  let { query } = req.body;
  await axios
    .post(
      "https://www.useblackbox.io/chat-request-v4",
      {
        textInput: query,
        allMessages: [
          {
            user: query,
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
    .catch((e) => {
      throw e;
    })
    .then((response) => {
      if (response.data.status !== "success") throw new Error(response.data);
      res.json({ response: response.data.response[0][0] });
    });
});

//Downloader

dlrouter.post("/tiktok", async (req, res) => {
    /**
   * @swagger
   * /api/downloader/tiktok:
   *   post:
   *     summary: Download tiktok post
   *     tags:
   *       - Downloader
   *     parameters:
   *       - in: query
   *         name: auth
   *         schema:
   *           type: string
   *         required: false
   *         description: Auth query parameter
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               query:
   *                 type: string
   *                 example: https://www.tiktok.com/@danynaas/video/7289693643697343750?is_from_webapp=1&sender_device=pc
   *               version:
   *                 type: string
   *                 example: v1
   *     responses:
   *       200:
   *         description: Server Successful processed the request
   *       400:
   *         description: Client missing variable or specify an invalid variable value
   *       500:
   *         description: Server failed process your request
   *       403:
   *         description: Client did not specify an auth token
   */
  let {query, version} = req.body
  if(!query.match(/^https?:\/\/(?:m|www|vm)?\.?tiktok\.com\/(?:.*\b(?:usr|v|embed|user|video)\/|\?shareId=|\&item_id=)(\d+|\w+)/)) return res.status(400).json({error: "Invalid tiktok url"});
  if(!["v1", "v2", "v3"].includes(version.toString()?.toLowerCase()?.trim())) version = "v3"
  const resp = await TiktokDL(query, {version: version})
  res.json({ response: {...resp, version} });
});

dlrouter.post("/instagram", async (req, res) => {
  /**
   * @swagger
   * /api/downloader/instagram:
   *   post:
   *     summary: Download instagram post
   *     tags:
   *       - Downloader
   *     parameters:
   *       - in: query
   *         name: auth
   *         schema:
   *           type: string
   *         required: false
   *         description: Auth query parameter
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               query:
   *                 type: string
   *                 example: https://www.instagram.com/p/C1MixY8JHYP/?utm_source=ig_web_copy_link
   *     responses:
   *       200:
   *         description: Server Successful processed the request
   *       400:
   *         description: Client missing variable or specify an invalid variable value
   *       500:
   *         description: Server failed process your request
   *       403:
   *         description: Client did not specify an auth token
   */
  const {query} = req.body;
  if(!query.match(/((?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:p|reel)\/([^/?#&]+)).*/g)) return res.status(400).json({error: "Invalid instagram url"});
  const data = await scrapeWebsitee.downloader.igdl(query) 
  res.json({ response: data });
});

dlrouter.post("/instagramstory", async (req, res) => {
    /**
   * @swagger
   * /api/downloader/instagramstory:
   *   post:
   *     summary: Download instagram story using username
   *     tags:
   *       - Downloader
   *     parameters:
   *       - in: query
   *         name: auth
   *         schema:
   *           type: string
   *         required: false
   *         description: Auth query parameter
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               query:
   *                 type: string
   *                 example: kyouhobbyshop
   *     responses:
   *       200:
   *         description: Server Successful processed the request
   *       400:
   *         description: Client missing variable or specify an invalid variable value
   *       500:
   *         description: Server failed process your request
   *       403:
   *         description: Client did not specify an auth token
   */
  const data = await scrapeWebsitee.downloader.igStory(req.body.query);
  if (!data.status) throw new Error(data.message);
  res.json({ response: data });
});

dlrouter.post("/spotify", async (req, res) => {
  /**
   * @swagger
   * /api/downloader/spotify:
   *   post:
   *     summary: Download spotify song using spotify song url
   *     tags:
   *       - Downloader
   *     parameters:
   *       - in: query
   *         name: auth
   *         schema:
   *           type: string
   *         required: false
   *         description: Auth query parameter
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               query:
   *                 type: string
   *                 example: https://open.spotify.com/track/0Vv4N6r7A9KdPqbWou4z2h?si=17577bda77664649
   *     responses:
   *       200:
   *         description: Server Successful processed the request
   *       400:
   *         description: Client missing variable or specify an invalid variable value
   *       500:
   *         description: Server failed process your request
   *       403:
   *         description: Client did not specify an auth token
   */
  let {query} = req.body;
  if (
    !query.match(
      /^(?:https?:\/\/(?:open|play)\.spotify\.com\/)(?:embed)?\/?(track)(?::|\/)((?:[0-9a-zA-Z]){22})/i
    )
  )
  return res.status(400).json({error: "Not a valid spotify link"});


  return res.json({
    details: { ...(await spotify.getTrack(query)) },
    response: await func.Pomfup(await spotify.downloadTrack(query), 'track.mp3'),
  });
});

//Generate things

utilityrouter.post("/generatecaptcha", async (req, res) => {
  /**
   * @swagger
   * /api/utility/generatecaptcha:
   *   post:
   *     summary: Generate captcha Image 
   *     tags:
   *       - Utility
   *     parameters:
   *       - in: query
   *         name: auth
   *         schema:
   *           type: string
   *         required: false
   *         description: Auth query parameter
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               query:
   *                 type: string
   *                 example: Nothing
   *     responses:
   *       200:
   *         description: Server Successful processed the request
   *       400:
   *         description: Client missing variable or specify an invalid variable value
   *       500:
   *         description: Server failed process your request
   *       403:
   *         description: Client did not specify an auth token
   */
  const { image, text } = createCaptchaSync(300, 100);
  res.json({ response: {answer: text, captcha: await func.Pomfup(image, 'captcha.jpg')}});
});

utilityrouter.post("/normalifytext", async (req, res) => {
  /**
   * @swagger
   * /api/utility/normalifytext:
   *   post:
   *     summary: Convert Text like 𝐓𝐡𝐢𝐬 into This
   *     tags:
   *       - Utility
   *     parameters:
   *       - in: query
   *         name: auth
   *         schema:
   *           type: string
   *         required: false
   *         description: Auth query parameter
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               query:
   *                 type: string
   *                 example: 𝐇𝐞𝐥𝐥𝐨 𝐰𝐨𝐫𝐥𝐝!
   *     responses:
   *       200:
   *         description: Server Successful processed the request
   *       400:
   *         description: Client missing variable or specify an invalid variable value
   *       500:
   *         description: Server failed process your request
   *       403:
   *         description: Client did not specify an auth token
   */
  res.json({ response: weirdToNormalChars(req.body.query) });
});

utilityrouter.post("/youtubesearch", async (req, res) => {
  /**
   * @swagger
   * /api/utility/youtubesearch:
   *   post:
   *     summary: Search youtube videos
   *     tags:
   *       - Utility
   *     parameters:
   *       - in: query
   *         name: auth
   *         schema:
   *           type: string
   *         required: false
   *         description: Auth query parameter
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               query:
   *                 type: string
   *                 example: Me at the zoo
   *     responses:
   *       200:
   *         description: Server Successful processed the request
   *       400:
   *         description: Client missing variable or specify an invalid variable value
   *       500:
   *         description: Server failed process your request
   *       403:
   *         description: Client did not specify an auth token
   */
  const data = await yts(req.body.query);
  res.json({ response: data?.all });
});

utilityrouter.post("/spotifysearch", async (req, res) => {
  /**
   * @swagger
   * /api/utility/spotifysearch:
   *   post:
   *     summary: Search spotify album and tracks
   *     tags:
   *       - Utility
   *     parameters:
   *       - in: query
   *         name: auth
   *         schema:
   *           type: string
   *         required: false
   *         description: Auth query parameter
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               query:
   *                 type: string
   *                 example: Hatsukoi Nakano
   *               tosearch:
   *                 type: string
   *                 example: track
   *     responses:
   *       200:
   *         description: Server Successful processed the request
   *       400:
   *         description: Client missing variable or specify an invalid variable value
   *       500:
   *         description: Server failed process your request
   *       403:
   *         description: Client did not specify an auth token
   */
  let {query, tosearch = "track,album"} = req.body
  await dores();

  async function dores() {
    const response = await axios.get("https://api.spotify.com/v1/search", {
      params: {
        q: query || "",
        type: tosearch || "track,album",
      },
      headers: {
        Authorization: "Bearer " + spotify_token,
      },
    });
    res.json({ response: {query, tosearch, ...response.data} });
  }
});

utilityrouter.post("/lyrics-google", async (req, res) => {
  /**
   * @swagger
   * /api/utility/lyrics-google:
   *   post:
   *     summary: Find music lyrics using google
   *     tags:
   *       - Utility
   *     parameters:
   *       - in: query
   *         name: auth
   *         schema:
   *           type: string
   *         required: false
   *         description: Auth query parameter
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               query:
   *                 type: string
   *                 example: Thunder by imagine dragon
   *     responses:
   *       200:
   *         description: Server Successful processed the request
   *       400:
   *         description: Client missing variable or specify an invalid variable value
   *       500:
   *         description: Server failed process your request
   *       403:
   *         description: Client did not specify an auth token
   */
  res.json({ response: await Google(req.body.query) });
});

utilityrouter.post("/lyrics-musixmatch", async (req, res) => {
  /**
   * @swagger
   * /api/utility/lyrics-musixmatch:
   *   post:
   *     summary: Find music lyrics using musixmatch
   *     tags:
   *       - Utility
   *     parameters:
   *       - in: query
   *         name: auth
   *         schema:
   *           type: string
   *         required: false
   *         description: Auth query parameter
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               query:
   *                 type: string
   *                 example: Thunder
   *     responses:
   *       200:
   *         description: Server Successful processed the request
   *       400:
   *         description: Client missing variable or specify an invalid variable value
   *       500:
   *         description: Server failed process your request
   *       403:
   *         description: Client did not specify an auth token
   */
  res.json({ response: await Musixmatch(req.body.query) });
});

utilityrouter.post("/gtts", async (req, res) => {
  /**
   * @swagger
   * /api/utility/gtts:
   *   post:
   *     summary: Create tts using google tts
   *     tags:
   *       - Utility
   *     parameters:
   *       - in: query
   *         name: auth
   *         schema:
   *           type: string
   *         required: false
   *         description: Auth query parameter
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               query:
   *                type: object
   *                properties:
   *                  text:
   *                    type: string
   *                    example: hello world!
   *                  language:
   *                    type: string
   *                    example: en
   *                    description: reference => https://cloud.google.com/speech/docs/languages
   *                  slow:
   *                    type: boolean
   *                    example: false
   *     responses:
   *       200:
   *         description: Server Successful processed the request
   *       400:
   *         description: Client missing variable or specify an invalid variable value
   *       500:
   *         description: Server failed process your request
   *       403:
   *         description: Client did not specify an auth token
   */
  let {text = "Hello, world", language = "en", slow = false} = req.body.query;
  const response = await googleTTS
  .getAudioBase64(text, {
    lang: language,
    slow: (slow == true || slow == "true"),
    host: 'https://translate.google.com',
  })
  const url = await func.Pomfup(Buffer.from(response, 'base64'), "tts.mp3")
  res.json({ response: url, data: {text, language, slow} });
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
  router.use(async(err, req, res, next) => {
    res.status(500).json({ error: err.toString() });
    next();
  });
}
async function getToken() {
  spotify_token = await axios
    .post(
      "https://accounts.spotify.com/api/token",
      new URLSearchParams({
        grant_type: "client_credentials",
        client_id: process.env.SPOTIFY_ID,
        client_secret: process.env.SPOTIFY_SECRET,
      })
    )
    .then((r) => r.data.access_token);
  setInterval(async () => {
    spotify_token = await axios
      .post(
        "https://accounts.spotify.com/api/token",
        new URLSearchParams({
          grant_type: "client_credentials",
          client_id: process.env.SPOTIFY_ID,
          client_secret: process.env.SPOTIFY_SECRET,
        })
      )
      .then((r) => r.data.access_token);
  }, 3580000);
}
