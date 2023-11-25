import { weirdToNormalChars } from "weird-to-normal-chars";
const result1 = weirdToNormalChars('𝔗𝔥𝔦𝔰 𝔦𝔰 𝔞 𝔴𝔢𝔦𝔯𝔡 𝔰𝔱𝔯𝔦𝔫𝔤');
const result2 = weirdToNormalChars('𝒯𝒽𝒾𝓈 𝒾𝓈 𝒶 𝓌𝑒𝒾𝓇𝒹 𝓈𝓉𝓇𝒾𝓃𝑔');
const result3 = weirdToNormalChars('𝕋𝕙𝕚𝕤 𝕚𝕤 𝕒 𝕨𝕖𝕚𝕣𝕕 𝕤𝕥𝕣𝕚𝕟𝕘');
console.log(result1); // This is a weird string
console.log(result2); // This is a weird string
console.log(result3); // This is a weird string