# Rest-api

.env file value
```
#GOOGLE_AI
GOOGLE_AI_STUDIO_KEY=
#BARD
PSID_TOKEN=
PSIDTS_TOKEN=
#Bing
BING_IMAGE_COOKIE=
BING_U_COOKIE=
#C.AI
CHARACTER_AI=
#SPOTIFY
SPOTIFY_ID=
SPOTIFY_SECRET=
#CHATGPT
REFRESH_TOKEN=
WRTN_ID=
WRTN_EMAIL=
#SERVER
auth_enabled=false
authkey=0000
PORT=
```

I don't have the time to maintain this repo
<h1>Setting Up</h1>
 <details>
 <details>
 <summary>Gemini</summary>
 1. Head to https://makersuite.google.com/app/apikey
 2. Login using your google account
 3. Done!
 </details>
  <summary>ChatGPT</summary>
 1. Head to https://wrtn.ai
 2. Login using your google account
 3. paste this code to ur console
 ```

const c = JSON.parse(document.querySelector("#__NEXT_DATA__").textContent).props.pageProps;
if (c.isAuth){ 
    console.log()
 console.log(`REFRESH_TOKEN=${(await cookieStore.get("refresh_token")).value}\nWRTN_ID=${Object.fromEntries(new URLSearchParams(document.cookie.replace(/; /g, "&")))["__w_id"]}\nWRTN_EMAIL=${c["fallback"]["/user"]["email"]}`)
}else{
    alert("Login first ");
}
```
4. Done!
 </details>