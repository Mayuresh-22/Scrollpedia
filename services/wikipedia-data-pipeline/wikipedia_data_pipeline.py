"""
Wikipedia Data Pipeline for Scrollpedia

This script fetches random articles from Wikipedia's API to populate our database.
It runs on modal.com as a scheduled job to keep our content fresh and up-to-date.
"""

import requests
import os
import modal
from gemini_service import GeminiService
from summarization_service import SummarizationService


function_image = modal.Image.debian_slim().pip_install(["requests", "supabase", "google-genai"]).add_local_python_source("gemini_service", "summarization_service")
app = modal.App("scrollpedia-wikipedia-data-pipeline", image=function_image)


def fetch_random_wikipedia_articles(secrets: dict[str, str]) -> list[dict[str, any]]:
    API_URL = "https://en.wikipedia.org/w/api.php"
    GEMINI_KEY = secrets.get("GEMINI_KEY")
    SUMMARIZATION_SERVICE_URL = secrets.get("SUMMARIZATION_SERVICE_URL")
    SUMMARIZATION_SERVICE_ENDPOINT = secrets.get("SUMMARIZATION_SERVICE_ENDPOINT") or "summarize"

    headers = {'User-Agent': 'WikipediaScraper/1.0 (contact@wikitok.com)'}
    params = {
        "action": "query",
        "format": "json",
        "generator": "random",
        "grnnamespace": 0,
        "prop": "extracts|pageimages|info",
        "inprop": "url",
        "grnlimit": 20,
        "exintro": 1,
        "exlimit": "max",
        "exsentences": 5,
        "explaintext": 1,
        "piprop": "thumbnail",
        "pithumbsize": 400,
        "origin": "*"
    }

    articles_list = []
    MAX_ARTICLES = 30

    while len(articles_list) < MAX_ARTICLES:
        try:
            response = requests.get(API_URL, headers=headers, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()

            pages = data.get("query", {}).get("pages", {})
            for page_id, page in pages.items():
                if len(articles_list) >= MAX_ARTICLES:
                    break

                # Skip articles without a thumbnail
                if "thumbnail" not in page:
                    continue

                title = page["title"]
                summary = page.get("extract", "No summary available")
                if not summary.strip():
                    continue

                image_url = page["thumbnail"]["source"]
                article_url = page["fullurl"]

                # Tag the article using GeminiService
                tags = GeminiService(GEMINI_KEY).tag_article(title, summary)

                # Summarize the article
                article_embedding = GeminiService(GEMINI_KEY).get_text_embedding(
                    data={"heading": title, "summary": summary, "tags": tags}
                )
                if not article_embedding:
                    print(f"Failed to get embedding for title: {title}")
                    continue

                # Get audio data
                audio_data = SummarizationService().get_article_audio_data(
                    data={"article_id": page_id, "article_title": title, "article_description": summary},
                    service_base_url=SUMMARIZATION_SERVICE_URL,
                    endpoint=SUMMARIZATION_SERVICE_ENDPOINT
                )
                audio_data = audio_data.get("data", {}).get("audio_data")

                article_dict = {
                    "article_id": page_id,
                    "article_data": {
                        "article_image": image_url,
                        "article_summary": summary,
                        "article_heading": title,
                        "article_link": article_url
                    },
                    "article_embedding": article_embedding,
                    "audio_data": audio_data if audio_data else None,
                    "tags": tags
                }
                articles_list.append(article_dict)
                print(f"Fetched article: {title}")

        except requests.RequestException as e:
            print(f"Network error: {str(e)}")
            continue
        except Exception as e:
            print(f"General error: {str(e)}")
            continue

    return articles_list


@app.function(secrets=[modal.Secret.from_name("scrollpedia-scheduler")], schedule=modal.Period(minutes=30), timeout=600)
def main():
    from supabase import create_client
    from time import time
    start_time = time()

    try:
        print("Log: Fetching articles")
        articles = fetch_random_wikipedia_articles({
            "GEMINI_KEY": os.environ.get("GEMINI_KEY"),
            "SUMMARIZATION_SERVICE_URL": os.environ.get("SUMMARIZATION_SERVICE_URL"),
            "SUMMARIZATION_SERVICE_ENDPOINT": os.environ.get("SUMMARIZATION_SERVICE_ENDPOINT")
        })
        print("Log: Articles fetched, count:", len(articles))

        url = os.environ.get("SUPABASE_URL")
        key = os.environ.get("SUPABASE_KEY")
        supabase = create_client(url, key)

        print("Log: Upserting all the articles into DB")
        result = supabase.table("articles").upsert(articles, on_conflict="article_id", ignore_duplicates=True).execute()
        print("Log: Upsert result:", result.data)

        stop_time = time()
        print(f"Log: Total time taken: {stop_time - start_time:.2f} seconds")
        print("Log: Upsert successful. Processing for this schedule is completed.")
    except Exception as e:
        print(f"Error: {str(e)}")
        raise e

if __name__ == "__main__":
    main()