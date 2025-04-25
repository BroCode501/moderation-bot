import qrcode from 'qrcode-terminal';
import { app, AIMessageParser, agent } from "./agent.js";
import whatsapp from 'whatsapp-web.js';

const { Client, LocalAuth } = whatsapp;

console.log(typeof(app))

const client = new Client({
  authStrategy: new LocalAuth({
    clientId: "Primary_Session",
    dataPath: ".wwebjs_auth"
  }),
});

class JSONQueue {
  constructor(limit = 10) {
    this.limit = limit;
    this.queue = [];
  }

  push(item) {
    if (typeof item !== 'object' || item === null || Array.isArray(item)) {
      throw new Error('Only non-null JSON objects are allowed');
    }
    this.queue.push(item);
    if (this.queue.length > this.limit) {
      this.queue.shift();
    }
  }

  getAll() {
    return [...this.queue];
  }

  clear() {
    this.queue = [];
  }
}

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
  console.log(`${msg.from} ${msg.author}: ${msg.body}`);
  const queue = new JSONQueue(10);
  queue.push({
    role: "user",
    content: `${msg.from}::${msg.author}:\n${msg.body}`
  });
  if (msg.mentionedIds.includes('919547400579@c.us')) {
    const config = { configurable: { thread_id: msg.author } };
    const response = await agent([
      {
        role: "user",
        content: msg.body
      }
    ], config);
    const data = AIMessageParser(response);
    console.log(data);
    await msg.reply(data.response);
    //await msg.reply(`> ${msg.body}`);
  }
})

client.initialize();
