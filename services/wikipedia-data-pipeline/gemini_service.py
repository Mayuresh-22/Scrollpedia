from google import genai
import os
from dotenv import load_dotenv
load_dotenv()

class GeminiService:
    def __init__(self, api_key: str):
        """
        Initialize the GeminiService with the provided API key.
        """
        self.genAI = genai.Client(api_key=api_key)
        self.model = None

    def get_text_embedding(self, data: any, model: str = "text-embedding-004") -> list | None:
        """
        Get text embedding from Gemini AI.

        :param data: The input data to embed.
        :param model: The model to use for embedding (default: "text-embedding-004").
        :return: A list of embedding values.
        """
        serialize_text = str(data)  # Serialize the input data to a string
        self.model = model
        result = self.genAI.models.embed_content(
            model=self.model,
            contents=serialize_text
        )
        return result.embeddings[0].values

    def tag_article(self, title: str, summary: str) -> list[str]:
        """
        Generate tags for an article using Gemini AI.

        :param title: The title of the article.
        :return: A list of tags.
        """
        prompt = f"Generate 5 relevant comma seperated tags for the article titled '{title}', summary {summary}. Along with previous 5 include atleast one relevant tag(s) out of this: [Artificial Intelligence,Space Exploration,World Wars,Hollywood & Cinema,Music History,Olympics & Global Sports,Physics & Chemistry,Medical Innovations,Environmental Science,Global Politics,Global Politics,Philosophy & Ethics,Psychology & Neuroscience,Modern Literature]. No other text."
        response = self.genAI.models.generate_content(
            model="gemini-2.0-flash-lite",
            contents=[prompt]
        )
        return response.text.replace("\n", "").split(", ") if response.text else []

if __name__ == "__main__":
    test_tags = GeminiService(os.environ.get("GEMINI_KEY")).tag_article("Gemini AI", "Gemini AI is a powerful tool for generating text embeddings and tags.")
    if "Artificial Intelligence" in test_tags:
        print("Test passed, tags has expected term:", test_tags)
    else:
        print("Test failed, tags does not have expected term:", test_tags)