import dotenv from "dotenv";
dotenv.config();

const characterAI = new (await import("node_characterai")).default();
await characterAI.authenticateWithToken(process.env.CHARACTER_AI);
const characterId = "8_1NyR8w1dOXmI1uWaieQcd147hecbdIK7CeEAIrdJw";
console.log(process.env.CHARACTER_AI)
// Create a chat object to interact with the conversation
const chat = await characterAI.createOrContinueChat(characterId);

// Send a message
const response = await chat.sendAndAwaitResponse("Hello discord moad!", true);
console.log(response)