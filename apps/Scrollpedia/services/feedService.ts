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
  async getFeed() {
    try {
      const feed = await this.backend.get("/feed");
      return feed.data.data as FeedArticleItem[];
    } catch (error) {
      console.log("FeedService: Promise rejected with error:", error);
      return Promise.reject(error);
    }
  }
}

export default new FeedService();
