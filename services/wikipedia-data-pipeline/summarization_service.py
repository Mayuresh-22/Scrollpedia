import requests

class SummarizationService:
        
    def get_article_audio_data(self, data: dict[str, str], service_base_url: str, endpoint: str) -> str | None:
        """
        Get the audio summary link for the provided article data.

        :param data: The article data article_id, article_heading, article_description.
        :return: The URL of the audio summary or None if an error occurs.
        """
        try:
            response = requests.post(
                url=f"{service_base_url}/{endpoint}",
                json=data,
            )
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            print(f"Error fetching audio summary link: {e}")
            return None