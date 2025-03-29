"""
Wikipedia Data Pipeline for Scrollpedia

This script fetches articles from Wikipedia's API to populate our database (Thanks Wikipedia). 
It runs on modal.com as a scheduled job to keep our content fresh and up-to-date.

Each run retrieves a batch of articles across different categories 
like science, history, and technology.
"""

import requests
import random
import urllib.parse
import os
import modal
from gemini_service import GeminiService
from summarization_service import SummarizationService

function_image = modal.Image.debian_slim().pip_install(["requests", "supabase", "google-genai"])
app = modal.App("scrollpedia-wikipedia-data-pipeline", image=function_image)

def get_wikipedia_articles(secrets=dict[str, str]) -> list[dict[str, any]]:
    API_URL = "https://en.wikipedia.org/w/api.php"
    BASE_WIKI_URL = "https://en.wikipedia.org/wiki/"
    GEMINI_KEY = secrets.get("GEMINI_KEY")
    SUMMARIZATION_SERVICE_URL = secrets.get("SUMMARIZATION_SERVICE_URL")
    SUMMARIZATION_SERVICE_ENDPOINT = secrets.get("SUMMARIZATION_SERVICE_ENDPOINT") or "summarize"

    categories = {
        "Artificial Intelligence": ["Artificial intelligence"],
        "Space Exploration": ["Space exploration"],
        "World Wars": ["World War II"],
        "Hollywood & Cinema": ["Film"],
        "Music History": ["Music"],
        "Olympics & Global Sports": ["Olympic Games"],
        "Physics & Chemistry": ["Physics"],
        "Medical Innovations": ["Medicine"],
        "Environmental Science": ["Environmental science"],
        "Global Politics": ["Politics"],
        "Stock Market & Economy": ["Economics"],
        "Philosophy & Ethics": ["Philosophy"],
        "Psychology & Neuroscience": ["Neuroscience"],
        "Modern Literature": ["Literature"]
    }
    headers = {
        'User-Agent': 'WikipediaScraper/1.0 (contact@wikitok.com)'
    }
    articles_list = []
    MAX_ARTICLES = 26
    base_params = {
        "action": "query",
        "format": "json",
        "formatversion": "2"
    }

    for main_category, sub_categories in categories.items():
        if len(articles_list) >= MAX_ARTICLES:
            break

        articles_fetched = 0
        attempts = 0

        while articles_fetched < 4 and attempts < 20 and len(articles_list) < MAX_ARTICLES:
            subcategory = random.choice(sub_categories)
            attempts += 1

            try:
                # Step 1: Get articles from category
                category_params = base_params.copy()
                category_params.update({
                    "list": "categorymembers",
                    "cmtype": "page",
                    "cmtitle": f"Category:{subcategory}",
                    "cmlimit": "20"
                })

                response = requests.get(API_URL, headers=headers, params=category_params, timeout=10)
                response.raise_for_status()
                data = response.json()

                articles = data["query"]["categorymembers"]
                if not articles:
                    print(f"No articles found in Category:{subcategory}")
                    continue

                selected_articles = random.sample(articles, min(6, len(articles)))

                for article in selected_articles:
                    if len(articles_list) >= MAX_ARTICLES:
                        break
                    title = article["title"]

                    # Step 2: Get summary, image, and pageid
                    article_params = base_params.copy()
                    article_params.update({
                        "prop": "extracts|images",
                        "exintro": "1",
                        "exlimit": "1",
                        "explaintext": "1",
                        "titles": title
                    })

                    article_response = requests.get(API_URL, headers=headers, params=article_params, timeout=10)
                    article_response.raise_for_status()
                    article_data = article_response.json()
                    pages = article_data["query"]["pages"]
                    if not pages:
                        continue

                    page = pages[0]
                    if "missing" in page or "pageid" not in page:
                        continue

                    page_id = page["pageid"]
                    summary = page.get("extract", "No summary available")
                    if summary == "No summary available" or not summary.strip():
                        continue
                    summary = summary[:500] + "..." if len(summary) > 500 else summary

                    # Step 3: Get image URL
                    image_url = "No image found"
                    if "images" in page:
                        for img in page["images"]:
                            if img["title"].endswith((".jpg", ".png", ".jpeg")):
                                img_params = base_params.copy()
                                img_params.update({
                                    "prop": "imageinfo",
                                    "iiprop": "url",
                                    "titles": img["title"]
                                })
                                img_response = requests.get(API_URL, headers=headers, params=img_params, timeout=10)
                                img_data = img_response.json()
                                img_pages = img_data["query"]["pages"]
                                if not img_pages:
                                    continue
                                img_page = img_pages[0]
                                if "imageinfo" in img_page:
                                    image_url = img_page["imageinfo"][0]["url"]
                                    break
                    if image_url == "No image found":
                        continue
                    article_url = f"{BASE_WIKI_URL}{urllib.parse.quote(title.replace(' ', '_'))}"

                    # Step 4: Now get the embedding for the article
                    # Include, heading, summary, and tags
                    article_embedding = GeminiService(GEMINI_KEY).get_text_embedding(
                        data={
                            "heading": title,
                            "summary": summary,
                            "tags": [main_category, subcategory]
                        })
                    if not article_embedding:
                        # Bruh simply skip this article
                        print(f"Failed to get embedding for id: {page_id} and title: {title}")
                        continue
                    audio_data = SummarizationService().get_article_audio_data(
                        data={
                            "article_id": page_id,
                            "article_title": title,
                            "article_description": summary
                        },
                        service_base_url=SUMMARIZATION_SERVICE_URL,
                        endpoint=SUMMARIZATION_SERVICE_ENDPOINT
                    )
                    audio_data = audio_data.get("data").get("audio_data")
                    print(f"Audio data for {page_id}: {audio_data}")
                    if not audio_data:
                        # Still we can save the article, audio isn't mandatory
                        print(f"Failed to get audio summary link for id: {page_id} and title: {title}")

                    article_dict = {
                        "article_id": page_id,
                        "article_data" : {
                            "article_image": image_url,
                            "article_summary": summary,
                            "article_sub_tag": subcategory,
                            "article_heading": title,
                            "article_link": article_url
                        },
                        "article_embedding": article_embedding,
                        "audio_data": audio_data if audio_data else None,
                        "tags": [main_category, subcategory]
                    }
                    articles_list.append(article_dict)
                    articles_fetched += 1
                    print(f"Fetched article: {title}")

            except requests.RequestException as e:
                print(f"Network error processing {subcategory}: {str(e)}")
                continue
            except Exception as e:
                print(f"General error processing {subcategory}: {str(e)}")
                continue

    return articles_list


@app.function(secrets=[modal.Secret.from_name("scrollpedia-scheduler")], schedule=modal.Period(minutes=25))
def main():
    from supabase import create_client
    from time import time
    start_time = time()

    try:
        # Get the articles
        print("Log: Fetching articles")
        articles = get_wikipedia_articles({
            "GEMINI_KEY": os.environ.get("GEMINI_KEY"),
            "SUMMARIZATION_SERVICE_URL": os.environ.get("SUMMARIZATION_SERVICE_URL"),
            "SUMMARIZATION_SERVICE_ENDPOINT": os.environ.get("SUMMARIZATION_SERVICE_ENDPOINT")
        })
        print("Log: Articles fetched, count:", len(articles))

        url = os.environ.get("SUPABASE_URL")
        key = os.environ.get("SUPABASE_KEY")
        supabase = create_client(url, key)
        
        # Now dump all of our articles in the db
        print("Log: Upserting all the article into DB")
        result = supabase.table("articles").upsert(articles, on_conflict="article_id", ignore_duplicates=True).execute()
        print("Log: Upsert result:", result.data)
        
        stop_time = time()
        print(f"Log: Total time taken: {stop_time - start_time:.2f} seconds")
        print("Log: Upsert successfull processing for this schedule is completed.")
    except Exception as e:
        print(f"Error: {str(e)}")
        raise e

if __name__ == "__main__":
    main()