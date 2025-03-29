import boto3
import random
from constants.Constants import Constants

class AudioService:
    def __init__(self, region_name='us-west-2'):
        self.polly_client = boto3.Session(
            aws_access_key_id=Constants.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=Constants.AWS_SECRET_ACCESS_KEY,
            region_name=region_name
        ).client('polly')

    def synthesize_speech(self, text, voice_id='Joanna', random_voice=False, output_format = "mp3", engine='standard', language_code='en-IN', sample_rate='22050'):
        """
        Synthesizes speech from the given text and saves it to the specified file.

        :param text: The text to convert to speech.
        :param voice_id: The voice ID to use for speech synthesis.
        :param random_voice: Whether to use a random voice ID.
        :param output_format: The format of the audio output (e.g., 'mp3').
        :param engine: The engine to use ('standard' or 'neural').
        :param language_code: The language code for the text.
        :param sample_rate: The sample rate for the audio output.
        """
        # Define the list of voice IDs
        voice_ids = [
            "Joanna", "Salli", "Kimberly", "Kendra", "Ivy", 
            "Gregory", "Kevin", "Matthew", "Justin", "Joey"
        ]
        # Select voice ID based on the random_voice parameter
        if random_voice:
            voice_id = random.choice(voice_ids)

        response = self.polly_client.synthesize_speech(
            VoiceId=voice_id,
            OutputFormat=output_format,
            Text=text,
            Engine=engine,
            LanguageCode=language_code,
            TextType='text',
            SampleRate=sample_rate
        )
        return response["AudioStream"]

# Example usage:
if __name__ == "__main__":
    aws_access_key_id = Constants.AWS_ACCESS_KEY_ID
    aws_secret_access_key = Constants.AWS_SECRET_ACCESS_KEY
    text = '''- Instead of hosting custom models, we can use third-party TTS (text-to-speech) service
    - Google TTS service gives 60 min/month (which is very little)
    - Murf AI TTS gives 1lakh char (lifetime) which we'll consume in testing itself
    - So, Amazon Polly is promising to give 5 million for 12 months'''
    output_file = 'speech.mp3'

    audio_service = AudioService(aws_access_key_id, aws_secret_access_key)
    audio_service.synthesize_speech(text, output_file)