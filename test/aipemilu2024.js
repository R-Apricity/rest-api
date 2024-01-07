//"Stable" code

import ws from "ws";
import axios from "axios";
import { load } from "cheerio";
const iniId = {
  "Anies-Imin":
    "https://app.botbrigade.id/chat/018ccd6a-d6e2-77a5-b498-0175d25bf875",
  "Prabowo-Gibran":
    "https://app.botbrigade.id/chat/018ccd6a-da72-7bff-8b67-fa95ef93d609",
  "Ganjar-Mahfud":
    "https://app.botbrigade.id/chat/018ccd6a-d972-761d-82a6-a0af0120b97f",
};
async function ReqChat(nama, teks) {
  return new Promise(async (resolve, reject) => {
    if (iniId[nama] == undefined) return reject("Ga ada dalam pilihan");
    let { data } = await axios.get(iniId[nama]);
    const $ = load(data);
    let idsesiauth;
    $("script").each(async (i, e) => {
      if ($(e).text().includes("sessionId")) {
        idsesiauth = JSON.parse(
          decodeURIComponent($(e).text())
            .split('self.__next_f.push([1,"8:[\\"$\\",\\"$L9\\",null,')[1]
            .split(`]\\n"])`)[0]
            .replaceAll("\\", "")
        ).sessionId;

        let { data } = await axios.post(
          `https://app.botbrigade.id/api/v1/session/child/${idsesiauth}`
        );
        idsesiauth = data.data.session_id;
        try {
          resolve(await reqChatWithID(idsesiauth, teks));
        } catch (r) {
          reject(r);
        }
      }
    });
  });
}
async function reqChatWithID(idsesi, teks) {
  return new Promise(async (resolve, reject) => {
    const socket = new ws("wss://api.botbrigade.id/ws/session/" + idsesi);

    socket.onopen = () => {
      console.log("Connected to  websocket");
      socket.send(teks);
    };

    socket.onmessage = async (event) => {
      const sf = JSON.parse(event.data); //Parse this shit and use it
      if (sf["message"]) {
        socket.close(); //Close this shitty ws
        resolve({ response: sf["message"], idsesi: idsesi }); //return session so there is a chat history
      }
    };
    socket.onerror = (err) => {
      reject(err);
    };
    socket.onclose = async () => {
      console.log("done");
    };
  });
}

//Contoh 
const data1 = await ReqChat("Anies-Imin", "Halo!");

console.log(data1.response);

console.log(
  (await reqChatWithID(data1.idsesi, "Tadi aku bilang apa?"))["response"]
);
