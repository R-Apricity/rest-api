const ffmpegPath = (await import("@ffmpeg-installer/ffmpeg")).path;
import ffmpeg from "fluent-ffmpeg";
import intoStream from "into-stream";
ffmpeg.setFfmpegPath(ffmpegPath);
import stream from "stream";
import axios from "axios";
import FormData from "form-data";
// import { setDefaultResultOrder } from "dns";
// setDefaultResultOrder("ipv4first");
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
let model_list;
async function WRTNNewChatAndSendMessage(msg, c, chatid, generateImage) {
  return new Promise(async (resolve, reject) => {

    // let axios = await axios.request()
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
    const modelver = c.toString().toLowerCase();
    if (!model_list) {
      model_list = await axios
        .get(
          "https://api.wrtn.ai/be/temp-units?platform=web",
          {},
          {
            headers: {
              ...headers,
              Refresh: process.env.REFRESH_TOKEN,
            },
          }
        )
        .then((d) => {
          if (d.data.result !== "SUCCESS")
            return reject("Cannot get model list");
          return d.data.data;
        })
        .catch(function (error) {
          return JSON.parse(
            '{"result":"SUCCESS","data":[{"_id":"65d592f0b18cdb6b8aa92373","name":"wrtn_search","enableOptions":{"reroll":false,"dynamicChip":true,"staticChip":false,"referenceLink":false,"searchLink":true,"draw":false,"stream":true,"loading":false,"code":false,"promptHub":false},"allowAnonymous":true,"appStatus":"released","webStatus":"released","thumbnail":"https://wrtn-common-image.s3.ap-northeast-2.amazonaws.com/Icon/search.png","description":"실시간 검색이 가능해요","displayName":"AI 검색","tags":[],"cardDescription":"AI 검색은 실시간 정보를 제공하는 뤼튼의 AI 에이전트입니다.\n최신 정보를 찾고 내용을 종합하여 사용자가 원하는 형태의 답변을 제공합니다. 수많은 정보를 찾아 요약하여 검색 시간을 효율적으로 단축합니다. 검색한 결과를 다듬을 수 있고, 그 결과를 바탕으로 새로운 정보를 생성할 수도 있습니다.","provider":"Wrtn"},{"_id":"65d591e80c06023ae70af73a","name":"gpt4","enableOptions":{"reroll":true,"dynamicChip":true,"staticChip":true,"referenceLink":true,"searchLink":false,"draw":true,"stream":true,"loading":true,"code":true,"promptHub":true},"allowAnonymous":true,"appStatus":"released","webStatus":"released","thumbnail":"https://wrtn-common-image.s3.ap-northeast-2.amazonaws.com/Icon/open_ai.webp","description":"똑똑해요","displayName":"GPT-4","tags":[],"cardDescription":"GPT-4는 OpenAI에서 개발한 최신 인공지능 언어모델입니다.\nGPT-3.5와 비교하여 더 정교한 언어 이해 능력을 가지고 있습니다. 수학적인 질문 뿐만 아니라 감정 분석, 소설 쓰기와 같은 창의적인 작업에서 강한 모습을 보입니다.","provider":"OpenAI"},{"_id":"66309fe4fa99736573f691be","name":"sd3_turbo","enableOptions":{"reroll":true,"dynamicChip":false,"staticChip":false,"referenceLink":false,"searchLink":false,"draw":true,"stream":true,"loading":false,"code":false,"promptHub":false},"allowAnonymous":false,"appStatus":"hidden","webStatus":"released","thumbnail":"https://wrtn-common-image.s3.ap-northeast-2.amazonaws.com/Icon/SDXL.png","description":"이미지를 생성해요","displayName":"AI 이미지","tags":["NEW"],"cardDescription":"AI 이미지는 Stability AI에서 제작한 SD3-Turbo 모델과 뤼튼이 개발한 대화형 이미지 생성 시스템을 함께 사용해 이미지를 생성합니다. 국가별 특색이나 특정 화가의 화풍 등 다양한 데이터를 학습해서 원하는 이미지를 구체적으로 설명할수록 보다 정확하고 만족스러운 결과를 얻을 수 있습니다.","provider":"Stable Diffusion"},{"_id":"65d591810c06023ae70af738","name":"gpt3.5","enableOptions":{"reroll":true,"dynamicChip":true,"staticChip":true,"referenceLink":true,"searchLink":false,"draw":true,"stream":true,"loading":true,"code":true,"promptHub":true},"allowAnonymous":true,"appStatus":"released","webStatus":"released","thumbnail":"https://wrtn-common-image.s3.ap-northeast-2.amazonaws.com/Icon/open_ai.webp","description":"빨라요","displayName":"GPT-3.5","tags":[],"cardDescription":"GPT-3.5는 OpenAI에서 개발한 고성능 인공지능 언어모델입니다.\nOpenAI의 이전 모델인 GPT-3보다 더 다양하고 방대한 양의 데이터를 학습했습니다. 뤼튼은 GPT- 3.5-16k을 삭제하고, GPT-3.5의 개선 버전인 GPT-3.5 1106으로 통합하여 제공합니다.","provider":"OpenAI"},{"_id":"663397a3208f03982f4f7dae","name":"pro_mode","enableOptions":{"reroll":true,"dynamicChip":true,"staticChip":true,"referenceLink":true,"searchLink":true,"draw":false,"stream":true,"loading":true,"code":true,"promptHub":false,"image":true},"allowAnonymous":false,"appStatus":"hidden","webStatus":"released","thumbnail":"https://wrtn-common-image.s3.ap-northeast-2.amazonaws.com/Icon/pro_mode.png","description":"실시간 검색과 이미지 인식이 가능해요","displayName":"Pro 모드","tags":[],"cardDescription":"Pro 모드는 뤼튼에서 개발한 통합 AI 시스템입니다. 실시간 검색을 통한 답변 생성을 지원하며 이미지를 이해하고 답변을 생성할 수 있습니다.","provider":"WRTN"}]}'
            .replace(
              /[\u0000-\u0019]+/g,
              ""
            )
          ).data;
          // reject(error);
        });
    }
    let modelID = (await model_list.map(d => d.name == modelver.toString().toLowerCase() ? d._id : false )).filter(Boolean);
    if(!modelID.length) {    
      return reject(
        `Invalid model, expected ${model_list
          .map((data) => data.name)
          .join(", ")} , got ${modelver}`
      );
    }
    modelID = modelID[0]
    // .filter(Boolean);
    if (!token) {
      token = await axios
        .post(
          `https://api.wow.wrtn.ai/auth/refresh`,
          {},
          {
            headers: {
              ...headers,
              Refresh: process.env.REFRESH_TOKEN,
            },
          }
        )
        .catch(function (error) {
          reject(error);
        })
        .then((r) => r.data.data.accessToken);
      setTimeout(() => {
        token = null;
      }, 900000);
    }

    if (!chatid) {
      chatid = await axios
        .post(
          `https://api.wow.wrtn.ai/chat?timestamp=${Date.now()}`,
          {
            type: "model",
            unitId: modelID,
          },
          {
            headers: {
              ...headers,
              authorization: "Bearer " + token,
              "x-wrtn-id": wrtnid,
            },
          }
        )
        .catch(function (error) {
          reject(error);
        })
        .then(({ data }) => {return data.data._id});
    }


    // if (generateImage) {
    //   const resp = await axios
    //     .post(
    //       `https://william.wow.wrtn.ai/chat/${chatid}/image?platform=web&user=${wrtnemail}&model=${modelver}`,
    //       {
    //         message: msg.toString(),
    //         reroll: false,
    //       },
    //       {
    //         headers: {
    //           ...headers,
    //           authorization: "Bearer " + token,
    //           "x-wrtn-id": wrtnid,
    //         },
    //       }
    //     )
    //     .then((r) => r.data)
    //     .catch(console.log);
    //   resolve(resp);
    // } else {
      const respid = await axios
        .post(
          `https://william.wow.wrtn.ai/chat/v3/${chatid}/start?platform=web&user=${wrtnemail}&model=${modelver}`,
          {
            message: (msg.toString()),
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
        .catch(function (error) {
          console.log("resid");
          console.log(error.response.data)
          reject(error);
        })
        .then((r) => r.data);
      await axios.get(
        `https://william.wow.wrtn.ai/chat/v3/${chatid}/${
          respid.data
        }?model=${modelver}&platform=web&user=${wrtnemail}&timestamp=${Date.now()}`,
        {
          headers: {
            ...headers,
            authorization: "Bearer " + token,
          },
        }
      );
      
        const timeout2 = setInterval(async () => {
          await axios
            .request({
              method: "get",
              maxBodyLength: Infinity,
              url: `https://william.wow.wrtn.ai/chat/v3/${chatid}/${
                respid.data
              }/result?platform=web&user=${wrtnemail}&model=${modelver}`,
              headers: {
                ...headers,
                authorization: "Bearer " + token,
                "x-wrtn-id": wrtnid,
              },
            })
            .catch(function (error) {
              reject(error);
            })
            .then(async (r) => {
              if(r.data.data.status == "start") return 
              clearInterval(timeout2);
              resolve(r.data);
            });
        }, 2000);
      // }
    } catch (e) {
      return reject(e);
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
