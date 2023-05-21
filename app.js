const qrcode = require('qrcode-terminal');

const { Client, LocalAuth, GroupNotificationTypes,  } = require('whatsapp-web.js');

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
  // Commands
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
