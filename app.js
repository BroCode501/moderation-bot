const qrcode = require('qrcode-terminal');

const { Client, LocalAuth, GroupNotificationTypes,  } = require('whatsapp-web.js');

const profanity = require('profanity-hindi')

const client = new Client({
  authStrategy: new LocalAuth({clientId: 'Primary_Session'})
});

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', async (message) => {
  console.log(message);
  if ((typeof message.body)==='string'){
  if (profanity.isMessageDirty(message.body)){
    client.sendMessage(message.from, `Please Don't ruin the environment`)

    client.sendMessage(message.id.participant, `You can Consider this as a threat, but for reasons, I will Call it a Warning. If I catch you using, slurs or any thing that ruins the environment, You don't know when I will change my miind and do something else other than sending this so called Warning message.`)
    message.forward(message.id.participant);
  }

  }
    if (message.body === ';web'){
    message.reply('Email: brocode404@proton.me\nWebsite: https://brocode-tech.netlify.app/\nTwitter: https://twitter.com/brocode501\nVisit our website More Details');
  } else {
    if (message.body === ';source'){
      message.reply('Hi, I am Moderation Bot and here is the source code: https://github.com/BroCode501/moderation-bot')
    } else {
      if ((message.body === ';h') || (message.body === ';help')){
        message.reply("Hi, I am Nova, the Moderation Bot of the Group.\nCommand List:\n;web - External links to Author and BroCode\n;source - Source code of Bot\n;help or ;h - Help Command")
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
  //chat.sendMessage('Hello @${contact.id.user},\nWelcome to our Community. Hoe you have a good time.', {mentions: [contact]});
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
  //chat.sendMessage('Hello @${contact.id.user},\nWelcome to our Community. Hoe you have a good time.', {mentions: [contact]});
});


client.initialize();
