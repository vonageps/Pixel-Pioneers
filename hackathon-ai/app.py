import os
import openai
from textractor import Textractor
from textractor.data.constants import TextractFeatures
import boto3
import time
import requests
from flask import Flask, request, jsonify
from dotenv import load_dotenv

load_dotenv()

aws_region = os.getenv("AWS_REGION_NAME")
aws_access_key = os.getenv("AWS_ACCESS_KEY_ID")
aws_secret_key = os.getenv("AWS_SECRET_ACCESS_KEY")
aws_bucket = os.getenv("S3_BUCKET_NAME")
openai_key = os.getenv("OPEN_AI_API_KEY")

app = Flask(__name__)


@app.route("/health", methods=['GET'])
def health_check():
    return "API health OK."

@app.route("/extract", methods=['GET','POST'])
def extract_text():
    document_name = request.args.get('s3_link')

    extractor = Textractor(region_name=aws_region)
    document = extractor.start_document_analysis(
        document_name,
        features = [ TextractFeatures.TABLES, TextractFeatures.SIGNATURES, TextractFeatures.LAYOUT, TextractFeatures.FORMS],
    )
    value=""

    for line in document.lines:
        value += str(line) + "\n"

    prompt = f"Extract important information such as name, age, gender, diseas, any allergies to a certain medicine etc. from the following text:\n{value}"
    extracted_information = extract_information_from_text(prompt)

    return jsonify(extracted_information)

@app.route("/transcript", methods=['GET','POST'])
def get_transcripts():
    session = boto3.Session(
        aws_access_key_id=aws_access_key,
        aws_secret_access_key=aws_secret_key
    )
    document_name = request.args.get('s3_link')

    _, file_extension = os.path.splitext(document_name)
    file_extension = file_extension.lstrip('.')
    transcribe_client = session.client('transcribe', region_name=aws_region)

    # Start a transcription job
    job_name = f'transcription-job-{int(time.time())}'
    job_uri = document_name
    transcribe_client.start_transcription_job(
        TranscriptionJobName=job_name,
        Media={'MediaFileUri': job_uri},
        MediaFormat=file_extension,
        LanguageCode='en-US'
    )

    while True:
        response = transcribe_client.get_transcription_job(TranscriptionJobName=job_name)
        if response['TranscriptionJob']['TranscriptionJobStatus'] in ['COMPLETED', 'FAILED']:
            break
        time.sleep(5)

    if response['TranscriptionJob']['TranscriptionJobStatus'] == 'COMPLETED':
        transcript_uri = response['TranscriptionJob']['Transcript']['TranscriptFileUri']
        transcript_response = requests.get(transcript_uri)
        transcript_json = transcript_response.json()
        transcription_text = transcript_json['results']['transcripts'][0]['transcript']
    else:
        raise Exception(f"Transcription job failed: {response['TranscriptionJob']['FailureReason']}")

    prompt = f"You are given a conversation between a doctor and a patient, go through it and extract important infromation such asas name, age, gender, diseas, any allergies to a certain medicine, any good to have tests, etc. from the following text:\n{transcription_text}"
    extracted_information = extract_information_from_text(prompt)

    return jsonify(extracted_information)

def extract_information_from_text(prompt):
    openai.api_key = openai_key
    response = openai.Completion.create(
        engine="text-davinci-003",
        prompt=prompt,
        temperature=0,
        max_tokens=150
    )

    return response.choices[0].text.strip()

if __name__=='__main__':
    app.run(host='0.0.0.0', port=80, debug=True)