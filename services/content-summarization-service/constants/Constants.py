from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

class Constants:
    """Class to load constants from the .env file."""
    AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY')
    AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_KEY')
    REGION_NAME = os.getenv('REGION_NAME', 'us-west-2')  # Default to 'us-west-2' if not set
    GROQ_KEY = os.getenv('GROQ_KEY')
    CLOUDINARY_CLOUD_NAME = os.getenv('CLOUDINARY_CLOUD_NAME')