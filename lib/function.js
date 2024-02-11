const ffmpegPath = (await import("@ffmpeg-installer/ffmpeg")).path;
import ffmpeg from "fluent-ffmpeg";
import intoStream from "into-stream";
ffmpeg.setFfmpegPath(ffmpegPath);
import stream from "stream";
import axios from "axios";
import FormData from "form-data";

let wrtnemail = process.env.WRTN_EMAIL;
let wrtnid = process.env.WRTN_ID;

async function ProdiaImageGen(
  positive_prompt,
  negative_prompt,
  model,
  steps,
  cfg,
  seed
) {
  return new Promise(async (resolve, reject) => {
    const { data } = await axios.get(
      `https://api.prodia.com/generate?new=true&prompt=${positive_prompt}&model=${model}&negative_prompt=${negative_prompt}&steps=${steps}&cfg=${cfg}&seed=${seed}&sampler=DPM%2B%2B+2M+Karras&aspect_ratio=square`
    );
    const timeout = setInterval(async () => {
      const status = await axios
        .get(`https://api.prodia.com/job/${data.job}`)
        .then((c) => c.data);
      if (status.status != "succeeded") return;
      clearInterval(timeout);
      resolve(`https://images.prodia.xyz/${data.job}.png`);
    }, 6000);
  });
}
let token;
async function WRTNNewChatAndSendMessage(msg, c, chatid) {
  return new Promise(async (resolve, reject) => {
    const headers = {
      authority: "william.wow.wrtn.ai",
      accept: "text/event-stream",
      "accept-language": "en-US,en;q=0.9",
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
    };
    try {
      const gptver = c.toString();
      if (gptver !== "4" && gptver !== "3.5" && gptver !== "3.5_16k")
        return reject(`Invalid GPT ver, expect 4, 3.5, 3.5_16k, got ${gptver}`);
      if (!token) {
        token = await axios
          .post(`https://api.wow.wrtn.ai/auth/refresh`, {}, {
            headers: {
              ...headers,
              Refresh: process.env.REFRESH_TOKEN,
            },
          })
          .catch(reject)
          .then((r) => r.data.data.accessToken);
        setTimeout(() => {
          token = null;
        }, 900000);
      }
      if (!chatid) {
        chatid = await axios
          .post(
            `https://api.wow.wrtn.ai/chat?timestamp=${Date.now()}`,
            {},
            {
              headers: {
                ...headers,
                authorization: "Bearer " + token,
                "x-wrtn-id": wrtnid,
              },
            }
          )
          .catch(reject)
          .then((r) => r.data.data._id);
      }
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
              ...headers,
              authorization: "Bearer " + token,
              "x-wrtn-id": wrtnid,
            },
          }
        )
        .catch(reject)
        .then((r) => r.data);
      await axios.get(
        `https://william.wow.wrtn.ai/chat/v3/${chatid}/${
          respid.data
        }?model=${gptver}&platform=web&user=${wrtnemail}&timestamp=${Date.now()}`,
        {
          headers: {
            ...headers,
            authorization: "Bearer " + token,
          },
        }
      );
      const timeout = setInterval(async () => {
        await axios
          .put(
            `https://william.wow.wrtn.ai/chat/v3/${chatid}/${
              respid.data
            }?timestamp=${Date.now()}`,
            {},
            {
              headers: {
                ...headers,
                authorization: "Bearer " + token,
                "x-wrtn-id": wrtnid,
              },
            }
          )
          .catch(reject)
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
              url: `https://william.wow.wrtn.ai/chat/v3/${chatid}/${
                respid.data
              }/result?timestamp=${Date.now()}`,
              headers: {
                ...headers,
                authorization: "Bearer " + token,
                "x-wrtn-id": wrtnid,
              },
            })
            .catch(reject)
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

async function Pomfup(buffer, filename) {
  return new Promise(async (resolve, reject) => {
    try {
      const form = new FormData();
      form.append("files[]", buffer, filename);

      const { data } = await axios.post(
        "https://pomf2.lain.la/upload.php",
        form,
        {
          headers: {
            ...form.getHeaders(),
            "sec-ch-ua":
              '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
            "sec-ch-ua-platform": '"Windows"',
            Referer: "",
            "sec-ch-ua-mobile": "?0",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          },
        }
      );
      resolve(data.files[0].url);
    } catch (e) {
      reject(e);
    }
  });
}
async function convertWavToMp3(a) {
  return new Promise((resolve, reject) => {
    let bufferStream = new stream.PassThrough();
    ffmpeg().input(intoStream(a)).toFormat("mp3").writeToStream(bufferStream);
    const buffers = [];
    bufferStream.on("data", function (buf) {
      buffers.push(buf);
    });
    bufferStream.on("end", function () {
      const outputBuffer = Buffer.concat(buffers);
      resolve(outputBuffer);
    });
    bufferStream.on("error", function (er) {
      reject(er);
    });
  });
}

export default {
  ProdiaImageGen, //Usage await ProdiaImageGen("Positive", "Negative", "")
  WRTNNewChatAndSendMessage, // Usage await WRTNNewChatAndSendMessage("TextHere", "GPT_VERSION_HERE"), Valid GPT version
  Pomfup, // Usage await Pomfup(buffer, filename) ez
  convertWavToMp3,
};
