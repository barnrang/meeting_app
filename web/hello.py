import numpy as np
from flask import Flask
from flask import render_template
from flask_uwsgi_websocket import GeventWebSocket

import os
import re
import sys
import time
import asyncio

from google.cloud import speech
from google.cloud.speech import enums
from google.cloud.speech import types

os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "/Users/barnrang/Downloads/meeting/meeting-7cd042634123.json"

from six.moves import queue

buffer = queue.Queue()


app = Flask(__name__)
ws = GeventWebSocket(app)

RATE = 44100
CHUNK = int(RATE / 10)  # 100ms

def listen_print_loop(responses):
    """Iterates through server responses and prints them.

    The responses passed is a generator that will block until a response
    is provided by the server.

    Each response may contain multiple results, and each result may contain
    multiple alternatives; for details, see https://goo.gl/tjCPAU.  Here we
    print only the transcription for the top alternative of the top result.

    In this case, responses are provided for interim results as well. If the
    response is an interim one, print a line feed at the end of it, to allow
    the next result to overwrite it, until the response is a final one. For the
    final one, print a newline to preserve the finalized transcription.
    """
    num_chars_printed = 0
    for response in responses:
        if not response.results:
            continue

        # The `results` list is consecutive. For streaming, we only care about
        # the first result being considered, since once it's `is_final`, it
        # moves on to considering the next utterance.
        result = response.results[0]
        if not result.alternatives:
            continue

        # Display the transcription of the top alternative.
        transcript = result.alternatives[0].transcript

        # Display interim results, but with a carriage return at the end of the
        # line, so subsequent lines will overwrite them.
        #
        # If the previous result was longer than this one, we need to print
        # some extra spaces to overwrite the previous result
        overwrite_chars = ' ' * (num_chars_printed - len(transcript))

        if not result.is_final:
            sys.stdout.write(transcript + overwrite_chars + '\r')
            sys.stdout.flush()

            num_chars_printed = len(transcript)

        else:
            print(transcript + overwrite_chars)

            # Exit recognition if any of the transcribed phrases could be
            # one of our keywords.
            if re.search(r'\b(exit|quit)\b', transcript, re.I):
                print('Exiting..')
                break

            num_chars_printed = 0

def getSampleRate(msg):
    return 1

@app.route('/')
def hello():
    return render_template('test.html')

@app.route('/text')
def text_flow():
    language_code = 'en-US'
    client = speech.SpeechClient()
    config = types.RecognitionConfig(
        encoding=enums.RecognitionConfig.AudioEncoding.LINEAR16,
        sample_rate_hertz=RATE,
        language_code=language_code)
    streaming_config = types.StreamingRecognitionConfig(
        config=config,
        interim_results=True)
    
    audio_streamer = audio(ws)

def returnVoice(arr):
    yield 'tt'

async def do_something(msg):
    a = 1
    while True:
        print('go')

@ws.route('/websocket')
def audio(ws):
    first_message = True
    total_msg = ""
    sample_rate = 0
    client = speech.SpeechClient()
    config = types.RecognitionConfig(
        encoding=enums.RecognitionConfig.AudioEncoding.LINEAR16,
        sample_rate_hertz=44100,
        language_code='en-US')

    counter = 0
    while True:
        msg = ws.receive()
        collect = []

        if first_message and msg is not None: # the first message should be the sample rate
            sample_rate = getSampleRate(msg)
            first_message = False
            continue
        elif msg is not None:
            audio_as_int_array = msg
            print(audio_as_int_array)
            collect.append(msg)
            counter += 1
            print('yeah', counter)
            if counter == 20:
                print('we are here x')
                msg = b''.join(collect)
                print('we are here xx')
                audio = types.RecognitionAudio(content=msg)
                print('we are here xxx')
                response = client.recognize(config, audio)
                print('we are here xxxx')
                counter = 0
                collect = []
                print('we are here')
                time.sleep(1)
            #     for result in response.results:
            #         print('Transcript: {}'.format(result.alternatives[0].transcript))
            #yield audio_as_int_array
            #print(types.RecognitionAudio(content=audio_as_int_array.tobytes))
        else:
            break