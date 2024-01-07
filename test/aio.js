import axios from "axios";
import { load } from "cheerio";
import fs from "fs";
let UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

let urlanu = [
  "https://sgz.adem.my.id/system/aee8aa08f175a1cd21b66709f5481bf4e65a8498fa81ebd263de4f72f19b40e9.php",
  "https://sg.adem.my.id/system/aee8aa08f175a1cd21b66709f5481bf4e65a8498fa81ebd263de4f72f19b40e9.php",
  "https://sgm.adem.my.id/system/aee8aa08f175a1cd21b66709f5481bf4e65a8498fa81ebd263de4f72f19b40e9.php",
  "https://biz.adem.my.id/system/aee8aa08f175a1cd21b66709f5481bf4e65a8498fa81ebd263de4f72f19b40e9.php",
  // "https://net.adem.my.id/system/aee8aa08f175a1cd21b66709f5481bf4e65a8498fa81ebd263de4f72f19b40e9.php",
];

async function aio(url) {
  return new Promise(async (resolve, reject) => {
    if (!url) return reject("No url?");
    if (!isValidHttpUrl(url)) reject("Invalid URL");
    await axios
      .get("https://pastedownload.com/29/", {
        headers: {
          'authority': 'pastedownload.com',
          'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
          'accept-language': 'en-US,en;q=0.9',
          'cache-control': 'no-cache',
          'pragma': 'no-cache',
          'referer': 'https://pastedownload.com/29/',
          'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"Windows"',
          'sec-fetch-dest': 'document',
          'sec-fetch-mode': 'navigate',
          'sec-fetch-site': 'same-origin',
          'sec-fetch-user': '?1',
          'upgrade-insecure-requests': '1',
          'user-agent': UA
        },
      })
      .catch(reject)
      .then(async ({ data }) => {
        const $ = load(data);
        const b = {
          url: url,
          token: $("#token").val(),
          t1: $("input[name*=tok1]").val(),
          t2: $("input[name*=tok2]").val(),
          t3: $("input[name*=tok3]").val(),
          t4: $("input[name*=tok4]").val(),
        };
console.log((new URLSearchParams(b)).toString())
        const c = urlanu[Math.floor(Math.random() * urlanu.length)];
        await axios
          .post(c, new URLSearchParams(b), {
            headers: {
              authority: c.split("/system")[0].replaceAll("https://", ""),
              accept: "*/*",
              "accept-language": "en-US,en;q=0.9",
              "cache-control": "no-cache",
              "content-type":
                "application/x-www-form-urlencoded; charset=UTF-8",
              origin: "https://pastedownload.com",
              pragma: "no-cache",
              referer: "https://pastedownload.com/",
              "sec-ch-ua":
                '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
              "sec-ch-ua-mobile": "?0",
              "sec-ch-ua-platform": '"Windows"',
              "sec-fetch-dest": "empty",
              "sec-fetch-mode": "cors",
              "sec-fetch-site": "cross-site",
              "user-agent": UA,
            },
          }).catch(e => {
            return 
          })
          .then(async ({ data }) => {
            fs.writeFileSync("te.txt", data);
          });
      });
  });
}
await aio("https://www.youtube.com/watch?v=ooZBSo7uBF4");
function isValidHttpUrl(string) {
  let url;

  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "https:";
}
