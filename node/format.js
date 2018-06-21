// Imports the Google Cloud client library
const speech = require('@google-cloud/speech');
const fs = require('fs');

// Creates a client
const client = new speech.SpeechClient();

// The name of the audio file to transcribe
const fileName = '../resources/real.flac';

// Reads a local audio file and converts it to base64
const file = fs.readFileSync(fileName);
console.log(file)
const audioBytes = file.toString('base64');
console.log(audioBytes === Buffer.from(file).toString('base64'));
