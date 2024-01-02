const axios = require("axios");
const { load } = require("cheerio");
const _tiktokurl = "https://www.tiktok.com";

const TiktokStalk = (username) =>
  new Promise((resolve, reject) => {
    axios
      .get("https://pastebin.com/raw/ELJjcbZT")
      .then(({ data: cookie }) => {
        username = username.replace("@", "");
        axios
          .get(`${_tiktokurl}/@${username}`, {
            headers: {
              "user-agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36",
              cookie: cookie,
            },
          })
          .then(({ data }) => {
            const $ = load(data);
            
            const result = JSON.parse(
              $("script#__UNIVERSAL_DATA_FOR_REHYDRATION__").text()
            );
            
            const user = result["__DEFAULT_SCOPE__"]["webapp.user-detail"];

            if (user.statusCode == 10221 || user.statusMsg == "") {
              return resolve({
                status: "error",
                message: "User not found!",
              });
            }
            const userinfo = user.userInfo;
            const userdata = userinfo.user
            const userstats = userinfo.stats

            const users = {
              username: userdata.uniqueId,
              nickname: userdata.nickname,
              private: userdata.privateAccount,
              avatar: [
                userdata.avatarLarger,
                userdata.avatarMedium,
                userdata.avatarThumb,
              ],
              signature: userdata.signature,
              verified: userdata.verified,
              region: userdata.region,
            };
            const stats = {
              followerCount: userstats.followerCount,
              followingCount: userstats.followingCount,
              heartCount: userstats.heartCount,
              videoCount: userstats.videoCount,
              likeCount: userstats.diggCount,
            };
            resolve({
              users,
              stats,
            });
          })
          .catch((e) => {
            resolve({ status: "error", message: e.message });
          });
      })
      .catch((e) => resolve({ status: "error", message: e.message }));
  });
(async () => {
  console.log(await TiktokStalk("mrbeast"));
})();
module.exports = TiktokStalk;
