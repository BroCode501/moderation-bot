const express = require('express');

server = express();

server.get('/', (req, res) => {
  res.send('I am Alive.')
})

function keepAlive() {
  server.listen(8000, () => {
    console.log('Server has started on port 8000');
  })
}

module.exports = keepAlive;
