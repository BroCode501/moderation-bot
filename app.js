// Imports
const qrcode = require('qrcode-terminal');
const { Client, LocalAuth, GroupNotificationTypes,  } = require('whatsapp-web.js');
const fs = require('fs');
const wikipedia = require('wikipedia');
const FormData = require('form-data');
const axios = require('axios');

require('dotenv').config();


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
    const { nudity, alcohol } = response.data;
    console.log(response.data)
      
    if (alcohol > 0.5){
      return true
    }
    if (nudity.none > 0.8){
      return true
    }
    return false; // No NSFW content or alcoholic photo found
  } catch (error) {
    console.error('Error occurred during image analysis:', error);
  }
}



/*
// Load the NSFW model
async function loadModel() {
  const model = await nsfwjs.load();
  return model;
}

// Function to check for NSFW images and alcoholic photos
async function checkImage(imageBase64) {
  const model = await loadModel();

  // Decode the base64 image
  const imageBuffer = Buffer.from(imageBase64, 'base64');

  // Load the image using TensorFlow.js
  const imageTensor = tf.node.decodeImage(imageBuffer);

  // Normalize the image
  const image = tf.div(imageTensor, 255.0);

  // Make predictions using the NSFW model
  const predictions = await model.classify(image);

  // Check if NSFW content or alcoholic photo found
  for (const prediction of predictions) {
    if (prediction.className === 'NSFW' || prediction.className === 'Alcohol') {
      return true;
    }
  }

  return false; // No NSFW content or alcoholic photo found
}
*/
//Client Object with LocalAuth to preserve the session
const client = new Client({
  authStrategy: new LocalAuth({clientId: 'Primary_Session'})
});

// Profanity Filter English
function detectEnSlang(message) {
  // Load and parse the JSON file
  const jsonData = fs.readFileSync('slangs_en.json');
  const slangs = JSON.parse(jsonData);

  // Iterate through the slangs array
  for (const slang of slangs) {
    if (message.toLowerCase().includes(slang.text)) {
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


client.on('message', async (message) => {
  //Profanity check
  if (typeof message.body === 'string'){
    param = detectEnSlang(message.body);
    console.log(param);
    if (param.detected){
      if (message.author === '8618651561986@c.us'){
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
  if (message.type === 'image') {
    media = await message.downloadMedia();
    checkImage(media.data, process.env.SIGHTENGINE_API_USER, process.env.SIGHTENGINE_API_SECRET)
      .then((dt) => {
        console.log(dt)
        message.delete(true).catch((error) => {console.log(error)});
        client.sendMessage(message.from, 'Aiii, Chup! Ye sab nahi chalega yaha')
      })
      .catch((error) => {
        console.log(error)
      })
  }

  console.log(`${message.from} ${message.author} ${message.type} ${message.body}`);
  console.log(`Message Object: ${message}`)
  console.log(message.links.link)
  console.log(message.links.isSuspicious)
  // Commands
    if (message.body === ';web'){
    message.reply('Email: brocode404@proton.me\nWebsite: https://brocode-tech.netlify.app/\nTwitter: https://twitter.com/brocode501\nVisit our website More Details');
  } else {
    if (message.body === ';source'){
      message.reply('Hi, I am Nova, the Moderation Bot and here is the source code: https://github.com/BroCode501/moderation-bot')
    } else {
      if ((message.body === ';h') || (message.body === ';help')){
        message.reply("Hi, I am Nova, the Moderation Bot of the Group.\nCommand List:\n;web - External links to Author and BroCode\n;source - Source code of Bot\n;wikipedia - Get any wikipedia article\n;help or ;h - Help Command")
      } else {
      // Complex Commands Go here
      cmd_array = message.body.split(' ')
        if (cmd_array[0] === ';wikipedia'){
          dt = await wikipedia.summary(cmd_array.slice(1).join(' '))
          message.reply(dt.extract)
          message.reply(dt.content_urls.mobile.page).catch((error) => {
              message.reply(error).catch((error) => {
                console.log(error)
              })
          })
         }
      }
    }
  }
});

client.on('group_leave', async (notification) => { 
  console.log(notification);
  notification
    .getChat()
    .then((chat) => {
      notification.recipientIds.map((i) => {
        client.sendMessage(i, "We're sorry to see you leave the group. If you have any feedback or suggestions for improvement, please feel free to share them with us. You're always welcome back if you decide to rejoin in the future. Take care and best wishes!");
      });
    })
    .catch(error => {
      console.log(error)
    })
});


client.on('group_join', async (notification) => { 
  console.log(notification);
  notification
    .getChat()
    .then((chat) => {
      notification.recipientIds.map((i) => {
        client.sendMessage(i, "Welcome to the group! We're glad to have you here. Feel free to introduce yourself and engage in discussions with fellow members. If you have any questions or need assistance, don't hesitate to ask. Enjoy your time in the group!");
      });
    })
    .catch(error => {
      console.log(error)
    })
});


client.initialize();
