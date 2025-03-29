// this class is for handling feed for the user its self explanatory

import BaseService from "./baseService";

export interface FeedArticleItem {
    article_id: number;
    article_data: {
        article_link: string;
        article_image: string;
        article_heading: string;
        article_sub_tag: string;
        article_summary: string;
    };
    tags: string[];
}

class FeedService extends BaseService {
  async getFeed(selectedCategories?: string[]) {
    try {
      let endpoint = "/feed";
      
      // If categories are selected, send them as query params
      if (selectedCategories && selectedCategories.length > 0) {
        endpoint = `/feed?categories=${encodeURIComponent(selectedCategories.join(","))}`;
      }

      const feed = await this.backend.get(endpoint);
      return feed.data.data as FeedArticleItem[];
    } catch (error) {
      console.log("FeedService: Promise rejected with error:", error);
      return Promise.reject(error);
    }
  }
}


export default new FeedService();
