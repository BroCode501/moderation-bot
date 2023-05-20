const qrcode = require('qrcode-terminal');

const { Client, LocalAuth, GroupNotification } = require('whatsapp-web.js');

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
  console.log(message.from, message.body);
  
  if (message.body === ';web'){
    message.reply('Email: brocode404@proton.me\nWebsite: https://brocode-tech.netlify.app/\nTwitter: https://twitter.com/brocode501\nVisit our website More Details');
  }


});

client.on('group_join', async (notification) => { 
  console.log(notification);
  notification
    .getContact()
    .then((contact) => {
      console.log(contact);
      notification
        .getChat()
        .then((chat) => {
          chat.sendMessage('Hello, @${contact.id.participant}', {
            mentions: [contact]
          });
        })
        .catch(error => {
          console.log(error);
        })
    })
    .catch(error => {
      console.log(error);
    })
  /*
  notification
    .getChat()
    .then((chat) => {
      chat.sendMessage('Hello, World!')
    })
    .catch(error => {
      console.log(error)
    })
    */
  //chat.sendMessage('Hello @${contact.id.user},\nWelcome to our Community. Hoe you have a good time.', {mentions: [contact]});
});

client.initialize();
