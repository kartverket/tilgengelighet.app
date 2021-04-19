const express = require('express');
const app = express();
const port = 9000;
const fetch = require('node-fetch');
const stream = require('stream');
const Client = require('ftp');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');

// console.log that your server is up and running
app.listen(port, () => console.log(`Listening on port ${port}`));

app.use(
  bodyParser.raw({
    extended: true,
  }),
);

app.use(fileUpload());

// create a GET route
app.get('/express_backend', (req, res) => {
  res.send({
    express: 'YOUR EXPRESS BACKEND IS CONNECTED TO REACT',
  });
});

app.post('/featuremember/upload', (req, res) => {
  console.log('files' + req.files);

  console.log(req);

  const client = new Client();

  client.connect({
    host: 'data.kartverket.no',
    user: 'tilgjengelighet',
    password: 'armod-1745-livlig',
  });

  const imageId = req.headers.id;

  console.log('request recieved' + imageId);

  console.log(req.body);

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
    client.put(file.data, `/tilgjengelighet/${imageId}.jpg`, error => {
      if (error) {
        console.log(error);
        res.status(500).send(error);
      } else {
        console.log('Put done');
        res.status(200).send('OK');
      }
    });
  });
});

app.get('/featuremember/image', (req, res) => {
  const imageId = req.headers.id;

  console.log('request recieved' + imageId);

  if (imageId === undefined) {
    res.status(404).send({
      message: 'imageId can not be null',
    });
    return;
  }

  fetch(
    `http://data.kartverket.no/tilgjengelighet/tilgjengelighet/${imageId}`,
    {
      method: 'GET',
    },
  ).then(response => {
    const ps = new stream.PassThrough(); // <---- this makes a trick with stream error handling
    stream.pipeline(
      response.body,
      ps, // <---- this makes a trick with stream error handling
      err => {
        if (err) {
          console.log(err); // No such file or any other kind of error
          return res.sendStatus(400);
        }
      },
    );
    ps.pipe(res); //

    //  res.send(response.blob);
  });
});
