from services.LLM import LLM
from constants.Constants import Constants
from services.AudioService import AudioService

class SummarizationService:

    def summarize(self, article_data: dict[str, str]) -> dict:
        """
            This method returns the audio summary file link as output.
            :param text: The text to summarize.
        """
        # get summarization from the model
        text_summary = LLM().text_summary(article_data)
        print("text_summary", text_summary)
        # give it to audio model
        # get audio file link from audio model
        audio_stream = AudioService().synthesize_speech(
            text=text_summary
        )
        if audio_stream:
            return text_summary

if __name__ == "__main__":
    # Example usage:
    aws_access_key_id = Constants.AWS_ACCESS_KEY_ID
    aws_secret_access_key = Constants.AWS_SECRET_ACCESS_KEY
    text = '''- Instead of hosting custom models, we can use third-party TTS (text-to-speech) service
    - Google TTS service gives 60 min/month (which is very little)
    - Murf AI TTS gives 1lakh char (lifetime) which we'll consume in testing itself
    - So, Amazon Polly is promising to give 5 million for 12 months'''

    audio_service = AudioService(aws_access_key_id, aws_secret_access_key)
    audio_service.synthesize_speech(text)
