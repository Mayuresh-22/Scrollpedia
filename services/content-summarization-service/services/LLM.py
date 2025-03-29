from groq import Groq
from constants.Constants import Constants

class LLM:
    def __init__(self):
        self.client = Groq(api_key=Constants.GROQ_KEY)

    def text_summary(self, content: str) -> str:
        chat_completion = self.client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are an intelligent summarizer for having mastery in beautifully summarizing wikipedia articles in less than 250 characters."},
                {"role": "user", "content": "Here's article title {} and description {}. Summarize it in less than 250 characters.".format(content['article_title'], content['article_description'])},
            ],
            model="llama-3.3-70b-versatile",
        )
        return chat_completion.choices[0].message.content