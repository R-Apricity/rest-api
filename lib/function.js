import aivoice from "../json/voice-ai-character.json" assert { type: "json" };
import axios from "axios";
let wrtnemail = process.env.WRTN_EMAIL;
let wrtnid = process.env.WRTN_ID;

async function aianimevoice(context, body) {
  /*
2023 © Amirul Dev
recode sertakan sumber biar semangat update :)
custom request? silahkan donasi
wa: 085157489446
*/
  return new Promise(async (resolve, reject) => {
    try {
      if (body.speed > 5 || body.speed < 0.1)
        throw `Speed is out of range, expected 0.1-5 got ${body.speed}`;

      const page = await context.newPage();
      await page.setViewportSize({ width: 501, height: 700 });
      await page.goto(
        "https://plachta-vits-umamusume-voice-synthesizer.hf.space/"
      );
      await page.waitForSelector("#tts-input > label > textarea");
      const tArea = "#tts-input > label > textarea";
      await page.$eval(tArea, (area) => (area.value = ""));
      await page.fill(tArea, body.text);
      await page
        .locator("#component-16 > label > select")
        .selectOption(aivoice[body.character]);
      await page
        .locator("#component-17 > label > select")
        .selectOption(body.language || "English");
      const sArea = "#component-18 > div.w-full.flex.flex-col > div > input";
      await page.$eval(sArea, (area) => (area.value = ""));
      await page.fill(sArea, body.speed.toString() || 1);
      //change symbol Input
      await page.$eval(
        "#component-12 > label > input",
        (el, value) => (el.checked = value),
        body.symbolinput || false
      );
      await page.click("#component-24");
      await page.waitForSelector("audio[src]", {timeout: 120000});
      const audio = await page.$("#tts-audio audio");
      if (audio) {
        const audioSrc = await audio.getAttribute("src");
        await page.close();
        resolve(
          `https://plachta-vits-umamusume-voice-synthesizer.hf.space/${audioSrc}`
        );
      }
    } catch (e) {
      reject(new Error(e));
    }
  });
}
let token;
async function WRTNNewChatAndSendMessage(msg, c) {
  return new Promise(async (resolve, reject) => {
    const gptver = c.toString();
    if (gptver !== "4" && gptver !== "3.5" && gptver !== "3.5_16k")
      return reject(`Invalid GPT ver, expect 4, 3.5, 3.5_16k, got ${gptver}`);
    try {
      if(!wrtntoken){
        wrtntoken = await axios
        .post(
          `https://api.wow.wrtn.ai/auth/refresh`,
          {},
          {
            headers: {
              authority: "api.wow.wrtn.ai",
              accept: "application/json, text/plain, */*",
              "accept-language": "en-US,en;q=0.9",
              "cache-control": "no-cache",
              "content-length": "0",
              "content-type": "application/x-www-form-urlencoded",
              origin: "https://wrtn.ai",
              pragma: "no-cache",
              referer: "https://wrtn.ai/",
              refresh: process.env.REFRESH_TOKEN,
              "sec-ch-ua":
                '"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
              "sec-ch-ua-mobile": "?0",
              "sec-ch-ua-platform": '"Windows"',
              "sec-fetch-dest": "empty",
              "sec-fetch-mode": "cors",
              "sec-fetch-site": "same-site",
              "user-agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
            },
          }
        )
        .then((r) => r.data.data.accessToken);
        setTimeout(() => {
          wrtntoken = null
        }, 900000)
      }
      
      const chatid = await axios
        .post(
          `https://api.wow.wrtn.ai/chat?timestamp=${Date.now()}`,
          {},
          {
            headers: {
              authority: "api.wow.wrtn.ai",
              accept: "application/json, text/plain, */*",
              "accept-language": "en-US,en;q=0.9",
              authorization: "Bearer " + token,
              "cache-control": "no-cache",
              "content-length": "0",
              origin: "https://wrtn.ai",
              pragma: "no-cache",
              referer: "https://wrtn.ai/",
              "sec-ch-ua":
                '"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
              "sec-ch-ua-mobile": "?0",
              "sec-ch-ua-platform": '"Windows"',
              "sec-fetch-dest": "empty",
              "sec-fetch-mode": "cors",
              "sec-fetch-site": "same-site",
              "user-agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
              "x-wrtn-id": wrtnid,
            },
          }
        )
        .then((r) => r.data.data._id);
      const respid = await axios
        .post(
          `https://william.wow.wrtn.ai/chat/v3/${chatid}/start?platform=web&user=${wrtnemail}&model=gpt${gptver}&timestamp=${Date.now()}`,
          {
            message: msg.toString(),
            reroll: false,
            images: [],
          },
          {
            headers: {
              authority: "william.wow.wrtn.ai",
              "accept-language": "en-US,en;q=0.9",
              authorization: "Bearer " + token,
              "cache-control": "no-cache",
              origin: "https://wrtn.ai",
              pragma: "no-cache",
              referer: "https://wrtn.ai/",
              "sec-ch-ua":
                '"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
              "sec-ch-ua-mobile": "?0",
              "sec-ch-ua-platform": '"Windows"',
              "sec-fetch-dest": "empty",
              "sec-fetch-mode": "cors",
              "sec-fetch-site": "same-site",
              "user-agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
              "x-wrtn-id": wrtnid,
            },
          }
        )
        .then((r) => r.data.data);
      await axios.get(
        `https://william.wow.wrtn.ai/chat/v3/${chatid}/${respid}?model=${gptver}&platform=web&user=${wrtnemail}&timestamp=${Date.now()}`,
        {
          headers: {
            authority: "william.wow.wrtn.ai",
            accept: "text/event-stream",
            "accept-language": "en-US,en;q=0.9",
            authorization: "Bearer " + token,
            "cache-control": "no-cache",
            "content-type": "application/json",
            origin: "https://wrtn.ai",
            pragma: "no-cache",
            referer: "https://wrtn.ai/",
            "sec-ch-ua":
              '"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site",
            "user-agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
          },
        }
      );
      const timeout = setInterval(async () => {
        await axios
          .put(
            `https://william.wow.wrtn.ai/chat/v3/${chatid}/${respid}?timestamp=${Date.now()}`,
            {},
            {
              headers: {
                authority: "william.wow.wrtn.ai",
                accept: "application/json, text/plain, */*",
                "accept-language": "en-US,en;q=0.9",
                authorization: "Bearer " + token,
                "cache-control": "no-cache",
                "content-length": "0",
                origin: "https://wrtn.ai",
                pragma: "no-cache",
                referer: "https://wrtn.ai/",
                "sec-ch-ua":
                  '"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": '"Windows"',
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-site",
                "user-agent":
                  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
                "x-wrtn-id": wrtnid,
              },
            }
          )
          .catch((r) => {
            return;
          })
          .then(async (r) => {
            if (r.data.result == undefined) return;
            clearInterval(timeout);
            await ressp();
          });
      }, 500);
      async function ressp() {
        console.log("received");
        const timeout2 = setInterval(async () => {
          await axios
            .request({
              method: "get",
              maxBodyLength: Infinity,
              url: `https://william.wow.wrtn.ai/chat/v3/${chatid}/${respid}/result?timestamp=${Date.now()}`,
              headers: {
                authority: "william.wow.wrtn.ai",
                accept: "application/json, text/plain, */*",
                "accept-language": "en-US,en;q=0.9",
                authorization: "Bearer " + token,
                "cache-control": "no-cache",
                origin: "https://wrtn.ai",
                pragma: "no-cache",
                referer: "https://wrtn.ai/",
                "sec-ch-ua":
                  '"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": '"Windows"',
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-site",
                "user-agent":
                  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
                "x-wrtn-id": wrtnid,
              },
            })
            .catch((r) => {
              return;
            })
            .then(async (r) => {
              clearInterval(timeout2);
              resolve(r.data);
            });
        }, 1000);
      }
    } catch (e) {
      return reject;
    }
  });
}


export default {
  aianimevoice, //Usage await aianimevoice("TextHere", {speed: 1, language: "English", character: "菲谢尔 Fishl (Genshin Impact)"})
  WRTNNewChatAndSendMessage, // Usage await WRTNNewChatAndSendMessage("TextHere", "GPT_VERSION_HERE"), Valid GPT version
};