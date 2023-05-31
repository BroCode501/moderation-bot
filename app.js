// Imports
const qrcode = require('qrcode-terminal');
const { Client, LocalAuth, GroupNotificationTypes, Util } = require('whatsapp-web.js');
const fs = require('fs');
const wikipedia = require('wikipedia');
const FormData = require('form-data');
const axios = require('axios');
const express = require('express');
const { Configuration, OpenAIApi } = require("openai");

require('dotenv').config();

const configuration = new Configuration({
  apiKey: process.env.FOXGPTAPI_KEY, //get a free key in our discord server!
  basePath: "https://api.hypere.app"

});

const openai = new OpenAIApi(configuration);

openai.createChatCompletion({
  model: "gpt-3.5-turbo",
  messages: [
    {
      role: "user",
      content: "Hey there, how are you?"
    }
  ]
}).then((dt) => {
  console.log(dt.data.choices[0].message)
}).catch((error) => {
  console.log(error)
})

async function getWeather(apiKey, city) {
  try {
    const response = await axios.get('http://api.openweathermap.org/data/2.5/weather', {
      params: {
        q: city,
        appid: apiKey,
        units: 'metric'
      }
    });

    // Handle the API response
    console.log(response.data);
    // You can perform additional processing or return the data as needed
    return response.data;

  } catch (error) {
    // Handle any errors
    console.error(error);
  }
}

server = express();

server.get('/', (req, res) => {
  res.send('I am Alive.')
})

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
} 


async function insultAPI(){
  try{
    const response = await axios.get(`https://evilinsult.com/generate_insult.php?lang=en&type=json`);
    return response.data.insult;
  } catch (error) {
    console.log(error)
    return 'Insulting you is an Insult to those wors, whom i used as an Insult.'
  }
}

// Function to decode base64 image and upload it to 0x0.st
async function uploadImageTo0x0St(imageBase64) {
  const imagePath = 'tempImage.jpg';

  // Decode the base64 image and save it to disk
  const imageBuffer = Buffer.from(imageBase64, 'base64');
  fs.writeFileSync(imagePath, imageBuffer);

  // Create form data with the image file
  const formData = new FormData();
  formData.append('file', fs.createReadStream(imagePath));

  try {
    const response = await axios.post('https://0x0.st', formData, {
      headers: formData.getHeaders()
    });

    return response.data.trim();
  } catch (error) {
    console.error('Error occurred while uploading image:', error);
  } finally {
    // Remove the temporary image file
    fs.unlinkSync(imagePath);
  }
}

// Function to check for NSFW images and alcoholic photos
async function checkImage(imageBase64, apiUser, apiSecret) {
  const imageUrl = await uploadImageTo0x0St(imageBase64);
  const endpoint = 'https://api.sightengine.com/1.0/check.json';

  const params = {
    models: 'nudity-2.0,wad,offensive,tobacco',
    api_user: apiUser,
    api_secret: apiSecret,
    url: imageUrl
  };

  try {
    const response = await axios.get(endpoint, { params });
    const { nudity, alcohol, offensive } = response.data;
    console.log(response.data)
      
    if (alcohol > 0.5){
      return true
    }
    if (nudity.none < 0.8){
      return true
    }
    if (offensive.middle_finger > 0.5) {
      return true
    }
    return false; // No NSFW content or alcoholic photo found
  } catch (error) {
    console.error('Error occurred during image analysis:', error);
  }
}

//Client Object with LocalAuth to preserve the session
const client = new Client({
  authStrategy: new LocalAuth({clientId: 'Primary_Session'})
});

// Profanity Filter English
function detectEnSlang(message) {
  // Load and parse the JSON file
  const jsonData = fs.readFileSync('slangs_en.json');
  const slangs = JSON.parse(jsonData);
  msg = message.toLowerCase().split(' ')

  // Iterate through the slangs array
  for (const slang of slangs) {
    if (msg.includes(slang.text)) {
      return {
        detected: true, 
        data: slang
      }; // Slang detected
    }
  }
  return {
    detected: false,
    data: null
  }; // No slangs detected
}


client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('Client is ready!');
});

function keepAlive() {
  server.listen(8000, () => {
    console.log('Server has started on port 8000');
  })
}
keepAlive();

function choice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

client.on('message', async (message) => {
  await sleep(2*1000);
  // Chat Logs
  client.sendMessage('919679915121@c.us', `${message.author}\n${message.from}\n${message.body}`);
    //Profanity check
  if (typeof message.body === 'string'){
    param = detectEnSlang(message.body);
    console.log(param);
    if (param.detected){
      if ((message.author === '8618651561986@c.us') || (message.author === '919565303474@c.us')){
        console.log(message.body)
      } else {
      client.sendMessage(message.from, `Stop Slanging. You have been warned for using a ${param.data['category_1']} like slang.`);
      client.sendMessage(message.author, `Stop Slanging. You have been warned for using a ${param.data['category_1']} like slang.`).catch((error) => {
        console.log(error);
      });
      message.forward(message.author).catch((error) => {
        console.log(error);
      });
      message.delete(true).catch((error) => {
        console.log(error);
      });
    }}
  }

  //NSFW Images
  if ((message.type === 'image') || (message.type === 'sticker')) {
    media = await message.downloadMedia();
    try {
    checkImage(media.data, process.env.SIGHTENGINE_API_USER, process.env.SIGHTENGINE_API_SECRET)
      .then((dt) => {
        console.log(dt)
        if (dt){
          message.delete(true).catch((error) => {console.log(error)});
          client.sendMessage(message.from, 'Aiii, Chup! Ye sab nahi chalega yaha')
        }
      })
      .catch((error) => {
        console.log(error)
      })} catch (error) {
        console.log(error)
      }
  } //Shorten it to Maybe 30 Words, and make it look like a Text that would have been sent in a Chat room

  // Wa me settings bug Shorten it to Maybe 30 Words, and make it look like a Text that would have been sent in a Chat room
  if (message.body.toLowerCase().includes('wa.me/settings')){
    message.delete(true)
  }
  //Probability to reply to a Messge via GPT
  num = Math.floor(Math.random()*69)
  if ((num === 2) && (message.author != undefined)){
    console.log('Lucky')
    try{
      chat = await message.getChat();
      msgs = await chat.fetchMessages({
        limit: 10
      });
      last10texts = msgs.map((message) => {
        contact = message.getContact();
        return JSON.stringify({
          body : message.body,
          from: ((message.fromMe) ? 'Nova' : ((contact.isMyContact) ? (contact.name) : (message.puhname)))})
      }).join('\n');
      console.log(last10texts);
    } catch (error) {
      console.log(error);
      last10texts = '';
    }
    dt = await openai.createChatCompletion({
                  model: "gpt-3.5-turbo",
                  messages: [
                    {
                      role: 'user',
                      content: `${last10texts}\n${message.body}\nThese are the Last 10 messages. Now You need to reply as Nova the Moderator of BroCode Tech Community, and in a short (30-40 words) and as if you are texting in a chatroom, like including acronyms and ect.Remember to be Funny, but wise with your response`
                    }
                  ]
                }).catch((error) => {
                  console.log(error)
                })
    try {
      text = dt.data.choices[0].message.content;
      console.log(text);
    } catch (error) {
      console.log(error)
      text='Unexpected Error'
    }

      message.reply(text)
    }
  if (message.author == undefined){
    console.log('DM')
    try{
      chat = await message.getChat();
      msgs = await chat.fetchMessages({
        limit: 10
      });
      last10texts = msgs.map((message) => {
        return JSON.stringify({body : message.body, from: ((message.fromMe) ? 'Nova' : 'User')})
      }).join('\n');
    } catch (error) {
      console.log(error);
      last10texts = '';
    }
    console.log(last10texts);
    dt = await openai.createChatCompletion({
                  model: "gpt-3.5-turbo",
                  messages: [
                    {
                      role: 'user',
                      content: `'${last10texts}\n${message.body}'\nThese are the Last 10 messages for context. Now You need to reply as Nova, pretending to be him, the Moderator (bot) of BroCode Tech Community made by Arnav ghosh, and text as if you are texting in a chatroom. Don't Respond like a Dialouge Script and Don't Start the message with 'Nova:'. Remind the User too, that sending ;h reveals all the Available Commands. Skip with your Introduction if it gets repetative.`
                    }
                  ]
                }).catch((error) => {
                  console.log(error)
                })
    try {
      text = dt.data.choices[0].message.content;
      console.log(text);
    } catch (error) {
      console.log(error)
      text='Unexpected Error'
    }

      message.reply(text)
    }



  console.log(`${message.from} ${message.author} ${message.type} ${message.body}`);
  // Commands
    if (message.body === ';web'){
    message.reply('Email: brocode404@proton.me\nWebsite: https://brocode-tech.netlify.app/\nTwitter: https://twitter.com/brocode501\nVisit our website More Details');
  } else {
    if (message.body === ';source'){
      message.reply('Hi, I am Nova, the Moderation Bot and here is the source code: https://github.com/BroCode501/moderation-bot')
    } else {
      if ((message.body === ';h') || (message.body === ';help')){
        message.reply(`
Hi, I am Nova, the Moderation Bot of the Group.
Command List:
Argument less Commands.
  ;help or ;h - Help Command
  ;web - External links to Author and BroCode
  ;source - Source code of Bot
  ;oof - Random Insults
Commands That Need Arguments
  ;wikipedia - Get any wikipedia article (argument1: article name)
  ;0x0-img - Uploads the Attached image to 0x0.st and replies the link (argument1: Attached Image (Just Use this as the caption of a photo))
  ;gpt - GPT-3.5-turbo Bot *Usage: _;gpt Hello!_*
  ;weather - Get weather of that Place (argument1: Place)
          `)
      } else {
      // Complex Commands Go here
      cmd_array = message.body.split(' ')
        if (cmd_array[0] === ';wikipedia'){
          wikipedia.summary(cmd_array.slice(1).join(' '))
            .then((dt) => {
              if ((dt.title === 'Not found.') ||dt.content_urls) {
                message.reply(`${dt.extract}\n${dt.content_urls.mobile.page}`)
              } else {
                message.reply('Not found')
              }
            })
            .catch((error) => {
              message.reply(`Unexpected Error Occured. Please Try again later`)
              console.log(error)
            })
        } else {
          if ((message.body === ';tirtha') || (message.body === ';tutu') || (message.body === ';oof')){
              enhi = ['en', 'hi'];
              dt = await insultAPI(choice(enhi));
              message.reply(`${dt}`)
              console.log(`${dt}`)
          }else {
            if (cmd_array[0] === ';weather'){
              try{
                dt = await getWeather(process.env.OWMAPI_KEY, cmd_array[1])
                strweather = JSON.stringify(dt)
              } catch (error) {
                console.log(error)
              }
              try{
                dt = await openai.createCompletion({
                  model: "text-davinci-003",
                  prompt: `The data contains the following JSON:\n${strweather}\n\nGive a Summary of the Weather Report:`,
                  max_tokens: 100,
                  temperature: 0.4
                })
                reply = dt.data.choices[0].text.trim();
                console.log(reply)
              } catch (error) {
                console.log(error)
                reply = "Unexpected Error"
              }
              message.reply(reply)
            }else {
              if (cmd_array[0] === ';gpt'){
                dt = await openai.createChatCompletion({
                  model: "gpt-3.5-turbo",
                  messages: [{role: "user", content: cmd_array.slice(1).join(' ')}]
                }).catch((error) => {
                  console.log(error)
                })
                try {
                  text = dt.data.choices[0].message.content;
                  console.log(text);
                } catch (error) {
                  console.log(error)
                  text='Unexpected Error'
                }
                message.reply(text)
              } else {
                if (message.body === ';0x0-img'){
                  try{
                    try{
                      media = await message.downloadMedia();
                    } catch (error) {
                      message.reply('Can\'t download image')
                    }
                    url = await uploadImageTo0x0St(media.data);
                    message.reply(url)
                  } catch (error) {
                    message.reply('Unexpected Error')
                    console.log(error)
                    client.sendMessage('919163827035@c.us', error)
                  }
                } else{
                    console.log('')
                }
              }
            }
          }
        }
      }
    }
  }
});
client.initialize();
