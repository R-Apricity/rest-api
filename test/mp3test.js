import axios from "axios";
const ffmpegPath = (await import("@ffmpeg-installer/ffmpeg")).path;
import ffmpeg from "fluent-ffmpeg";
import intoStream from "into-stream";
ffmpeg.setFfmpegPath(ffmpegPath);
import stream from "stream";

import func from "../lib/function.js";
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
    bufferStream.on("error", function(er) {
      reject(er)
    })
  });
}

const a = await convertWavToMp3(
  await axios
    .get(
      "https://plachta-vits-umamusume-voice-synthesizer.hf.space/file=/tmp/tmpo0uz5qw0/tmpaz8tmhlc.wav",
      { responseType: "arraybuffer" }
    )
    .then((r) => r.data)
);
console.log(await func.Pomfup(a, "anu.mp3"));
