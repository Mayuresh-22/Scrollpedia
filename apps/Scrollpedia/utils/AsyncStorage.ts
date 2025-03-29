import AsyncStorage from '@react-native-async-storage/async-storage';

const SAVED_ARTICLES_KEY = 'savedArticles';

export const setItem = async (key: string, value: any): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error setting item:', error);
  }
};

export const getItem = async (key: string): Promise<any | null> => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value !== null ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Error getting item:', error);
    return null;
  }
};

export const removeItem = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing item:', error);
  }
};

export const mergeItem = async (key: string, value: any): Promise<void> => {
  try {
    await AsyncStorage.mergeItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error merging item:', error);
  }
};

export const clear = async (): Promise<void> => {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error('Error clearing AsyncStorage:', error);
  }
};

// New functions for saving articles
export const saveArticle = async (article: any): Promise<void> => {
  try {
    let savedArticles = await getItem(SAVED_ARTICLES_KEY);
    if (!savedArticles) savedArticles = [];

    // Check if the article is already saved
    const exists = savedArticles.some((a: any) => a.article_id === article.article_id);
    if (!exists) {
      savedArticles.push(article);  // Store full article
      await setItem(SAVED_ARTICLES_KEY, savedArticles);
    }
  } catch (error) {
    console.error("Error saving article:", error);
  }
};
export const getSavedArticles = async (): Promise<any[]> => {
  try {
    return (await getItem(SAVED_ARTICLES_KEY)) || [];
  } catch (error) {
    console.error("Error getting saved articles:", error);
    return [];
  }
};

export const removeSavedArticle = async (articleId: number): Promise<void> => {
  try {
    let savedArticles = await getItem(SAVED_ARTICLES_KEY);
    if (!savedArticles) return;
    
    savedArticles = savedArticles.filter((a: any) => a.article_id !== articleId);
    await setItem(SAVED_ARTICLES_KEY, savedArticles);
  } catch (error) {
    console.error('Error removing saved article:', error);
  }
};
