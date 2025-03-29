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
  audio_data: {
    duration: number;
    file_url: string;
    file_size: number;
    technical: {
      codec: string;
      bit_rate: string;
      channels: number;
      frequency: number;
      channel_layout: string;
    };
    file_format: string;
    file_public_id: string;
  }
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
