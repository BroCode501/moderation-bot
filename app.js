import qrcode from 'qrcode-terminal';
import { app, AIMessageParser, agent } from "./agent.js";
import whatsapp from 'whatsapp-web.js';
import { readFile } from 'fs/promises';

async function isUserBanned(userId, filePath = './banlist.json') {
  try {
    const data = await readFile(filePath, 'utf-8');
    const json = JSON.parse(data);
    return json.banned_users?.includes(userId) || false;
  } catch (err) {
    console.error('Error reading or parsing JSON file:', err);
    return false;
  }
}

function configBuilder(msg) {
  /*If `g.us` in msg.from its a Group message so look for msg.author
   * If `c.us` in msg.from its a Personal message, no need for msg.author
   * */
  const isGroupMessage = msg.from.includes('g.us');
  var isBotMentioned = false;
  var isDM = false;
  var thread_id = `${msg.from}`
  if (isGroupMessage) {
    var isBotMentioned = msg.mentionedIds.includes('919547400579@c.us');
  }
  else {
    var isDM = msg.from.includes('c.us');
  }
  return {
      config: {
          configurable: { thread_id: thread_id } 
        },
      conditionals: {
        isBotMentioned: isBotMentioned,
        isGroupMessage: isGroupMessage,
        isDM: isDM
      } 
  };
}

const { Client, LocalAuth } = whatsapp;

console.log(typeof(app))

const client = new Client({
  authStrategy: new LocalAuth({
    clientId: "Primary_Session",
    dataPath: ".wwebjs_auth"
  }),
});

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
} 

client.on("qr", (qr) => {
  console.log("QR RECEIVED", qr);
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("Client is ready!");
});

client.on("message", async (msg) => {
  console.log(`${msg.from}:${msg.author}\n====\n${msg.body}`);



  // Check if its a group message and if the Bot is mentioned
  var isUBanned = await isUserBanned(msg.from);
  var config_builder = configBuilder(msg);
  var msg_content = ``;
  if (!config_builder.conditionals.isDM) {
    msg_content = `${msg.from}:${msg.author}\n====\n${msg.body}`
  } else {
    msg_content = `${msg.from}\n====\n${msg.body}`;
  }
  if (isUBanned) {
    await msg.reply('You are banned from using this bot. Fuck you.');
    return
  }
  if (!(msg.type=='chat')) {
    return
  }
  if (config_builder) {
    if (config_builder.conditionals.isGroupMessage && !config_builder.conditionals.isBotMentioned) {
      return
    }
    const config = config_builder.config;
    const response = await agent([
      {
        role: "user",
        content: msg_content
      }
    ], config);
    const data = AIMessageParser(response);
    await msg.reply(data.response);
    //await msg.reply(`> ${msg.body}`);
  }
})

client.initialize();
