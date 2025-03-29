from google import genai

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
