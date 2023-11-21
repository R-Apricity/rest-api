import aivoice from "./json/voice-ai-character.json" assert { type: "json" };
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
      await page.waitForSelector("audio[src]");
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
export default {
  aianimevoice,
};
/*
let body.text = "hello, world!",
  body.character = "",
  language = "English",
  speed = 0.74, // Maximum speed is 5
  symbolinput = false;
console.log(await ai(body.text, body.character, language, speed, symbolinput));*/
