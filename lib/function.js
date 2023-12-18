import axios from "axios";
import d from 'crypto'

let wrtnemail = process.env.WRTN_EMAIL;
let wrtnid = process.env.WRTN_ID;

async function ProdiaImageGen(positive_prompt, negative_prompt, model, steps, cfg, seed){
  return new Promise(async(resolve, reject) => {
    const { data } = await axios.get(
      `https://api.prodia.com/generate?new=true&prompt=${
        positive_prompt
      }&model=${model}&negative_prompt=${
        negative_prompt || ""
      }&steps=${steps || "20"}&cfg=${cfg || "7"}&seed=${seed || Buffer.from(d.randomBytes(4)).readUInt32BE(
        0
      )}&sampler=DPM%2B%2B+2M+Karras&aspect_ratio=square`
    );
    const timeout = setInterval(async() => {
      const status = await axios.get(`https://api.prodia.com/job/${data.job}`).then(c => c.data)
      if(status.status != "succeeded") return;
      clearInterval(timeout)
      resolve(`https://images.prodia.xyz/${data.job}.png`)
    }, 6000);
  })
}
let token;
async function WRTNNewChatAndSendMessage(msg, c) {
  return new Promise(async (resolve, reject) => {
    try {
    const gptver = c.toString();
    if (gptver !== "4" && gptver !== "3.5" && gptver !== "3.5_16k")
      return reject(`Invalid GPT ver, expect 4, 3.5, 3.5_16k, got ${gptver}`);
      if(!token){
        token = await axios
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
          token = null
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
  ProdiaImageGen, //Usage await ProdiaImageGen("Positive", "Negative", "")
  WRTNNewChatAndSendMessage, // Usage await WRTNNewChatAndSendMessage("TextHere", "GPT_VERSION_HERE"), Valid GPT version
};