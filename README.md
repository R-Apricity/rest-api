# Rest-api

.env file value
```
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


<h1>Setting Up</h1>
 <details>
 <summary>Bard</summary>
 1. Open incognito and head to https://bard.google.com<br>
 2. Login using your desired google account<br>
 3. Now head to https://google.com<br>
 4. Open developer tools (<kbd>F12</kbd>, <kbd>Ctrl+Shift+I</kbd>, or <kbd>Cmd+J</kbd>) and click the cookies tab<br>
 5. Find __Secure-1PSID and  __Secure-1PSIDTS into the env variable<br><br>
Example: <br>
PSID_TOKEN= __Secure-1PSID COOKIE <br>
PSIDTS_TOKEN= __Secure-1PSIDTS COOKIE <br>
 </details>