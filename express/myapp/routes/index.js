var express = require('express');
var router = express.Router();

var expressWs = require('express-ws')(router);

var aWss = expressWs.getWss('/stream');

// const record = require('node-record-lpcm16');

// Imports the Google Cloud client library
// const speech = require('@google-cloud/speech');
// var toWav = require('audiobuffer-to-wav')
// // Creates a client
// const client = new speech.SpeechClient();
// const convert = require('pcm-convert')

// const encoding = 'LINEAR16'; //'LINEAR16';
// const sampleRateHertz = 16000;
// const languageCode = 'en-US';

// const config = {
//   encoding: encoding,
//   sampleRateHertz: sampleRateHertz,
//   languageCode: languageCode,
// };

// var request = {
//   config: config,
//   interimResults: false, // If you want interim results, set this to true
// };

// const recognizeStream = client
//   .streamingRecognize(config)
//   .on('error', console.error)
//   .on('data', data =>
//     process.stdout.write(
//       data.results[0] && data.results[0].alternatives[0]
//         ? `Transcription: ${data.results[0].alternatives[0].transcript}\n`
//         : `\n\nReached transcription time limit, press Ctrl+C\n`
//     )
//   );

// var collect = []

/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Tae is so Handsome' });
// });

// setInterval(function () {
//   aWss.clients.forEach(function (client) {
//     client.send('hello');
//   });
// }, 5000);


// router.ws('/stream', (ws, req) => {
//   ws.on('message', (msg) => {
//     console.log(msg)
//     aWss.clients.forEach((client) => {
//       client.send(msg);
//     })
// });
// })

module.exports = router;
