const express = require('express');
const app = express();
const port = 9000;
const fetch = require('node-fetch');
const stream = require('stream');
const Client = require('ftp');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
require('dotenv').config();


const pass = process.env.FTP_PASS;
const user = process.env.FTP_USER;

// console.log that your server is up and running
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
  console.log(user);
});

app.use(
  bodyParser.raw({
    extended: true,
  }),
);

app.use(fileUpload());

app.post('/featuremember/upload', (req, res) => {
  try {
    const client = new Client();

    client.connect({
      host: 'data.kartverket.no',
      user: user,
      password: pass,
    });

    const imageId = req.headers.id;

    console.log('request recieved' + imageId);

    if (imageId === undefined) {
      res.status(404).send({
        message: 'imageId can not be undefined',
      });
      return;
    }

    if (req.body === undefined) {
      res.status(404).send({
        message: 'body can not be empty',
      });
      return;
    }

    const file = Object.values(req.files)[0];

    client.on('ready', () => {
      console.log('FTP connection ready');
      ('');
      try {
        client.put(file.data, `/tilgjengelighet/${imageId}.jpg`, error => {
          console.log(res.statusCode);
          client.end();

          if (error) {
            console.log('serverError' + error);

            return res.send();
          } else {
            console.log('Put done');
            return res.send();
          }
        });
      } catch (e) {}
    });
  } catch (e) {
    console.log('TIMESTAMP:' + Date.now() + 'ERROR:' + e);
  }
});
