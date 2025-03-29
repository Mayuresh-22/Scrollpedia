from app.constants.constants import Constants
from app.services.llm import LLM
from app.services.audio_service import AudioService
from app.services.cloudinary_service import CloudinaryService

class SummarizationService:

    def summarize(self, article_data: dict[str, str]) -> dict:
        """
            This method returns the audio summary file link as output.
            :param text: The text to summarize.
        """
        # get summarization from the model
        text_summary = LLM().text_summary(article_data)
        if  text_summary is None:
            return None
        # give it to audio model
        # get audio file link from audio model
        audio_stream = AudioService().synthesize_speech(
            text=text_summary
        )
        if not audio_stream:
            return None
        # upload audio stream to cloudinary
        audio_file_link = CloudinaryService().upload_audio_stream(audio_stream)
        return audio_file_link
        

if __name__ == "__main__":
    # Example usage:
    aws_access_key_id = Constants.AWS_ACCESS_KEY_ID
    aws_secret_access_key = Constants.AWS_SECRET_ACCESS_KEY
    text = '''Instead of hosting custom models, we can use third-party TTS (text-to-speech) service'''

    audio_service = AudioService(aws_access_key_id, aws_secret_access_key)
    audio_service.synthesize_speech(text)