import os
import requests
from typing import BinaryIO
from constants.constants import Constants

class CloudinaryService:
    ROOT_ASSETS_PATH = "summary_audio_files"

    def __init__(self):
        self.CLOUD_NAME = Constants.CLOUDINARY_CLOUD_NAME

    def upload_audio_stream(self, audio_stream: BinaryIO) -> dict:
        """
        Uploads an MP3/WAV audio stream to Cloudinary.

        :param audio_stream: The audio stream to upload.
        :return: The response from Cloudinary.
        """
        try:
            files = {"file": audio_stream}
            data = {"upload_preset": "ml_default", "resource_type": "audio"}
            response = requests.post(
                f"https://api.cloudinary.com/v1_1/{self.CLOUD_NAME}/auto/upload",
                files=files,
                data=data,
            )
            print(f"Cloudinary upload response: {response.status_code} {response.text} {response.json()}")
            respJson = response.json()
            if not respJson.get("secure_url"):
                raise Exception("Invalid response from Cloudinary")
            return {
                "file_url": respJson.get("secure_url"),
                "file_public_id": respJson.get("public_id"),
                "file_format": respJson.get("format"),
                "duration": respJson.get("duration"),
                "file_size": respJson.get("bytes"),
                "technical": respJson.get("audio")
            }
        except Exception as e:
            print(f"Error uploading audio stream: {e}")
            return None
