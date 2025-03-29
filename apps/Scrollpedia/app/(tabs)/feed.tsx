import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Image,
  Linking,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  FlatList,
  ImageBackground,
  useColorScheme,
  ActivityIndicator,
  Share, // Import Share API for sharing functionality
} from "react-native";
import { Heart, LucideScroll, ScrollText, Send } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ThemedText } from "@/components/ThemedText";
import feedService, { FeedArticleItem } from "@/services/feedService";

const { height } = Dimensions.get("window"); // Get screen height for layout adjustments

export default function FeedScreen() {
  // State to store the fetched feed articles
  const [feedArticles, setFeedArticles] = useState<FeedArticleItem[] | null>(null);
  // State to track liked articles
  const [likedItems, setLikedItems] = useState<{ [key: number]: boolean }>({});
  // State to manage loading indicator
  const [loading, setLoading] = useState(true);
  
  const flatListRef = useRef<FlatList>(null); // Reference for FlatList scrolling
  const colorScheme = useColorScheme(); // Detect light/dark mode

  // Function to toggle like state of an article
  const toggleLike = (id: number) => {
    setLikedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Function to fetch the feed articles from the service
  useEffect(() => {
    const fetchFeed = async () => {
      setLoading(true); // Show loading indicator
      const feed = await feedService.getFeed(); // Fetch feed data
      setFeedArticles(feed); // Update state with fetched data
      setLoading(false); // Hide loading indicator
    };
    if (!feedArticles) {
      fetchFeed();
    }
  }, []);

  // Function to share article details using Share API
  const shareArticle = async (title: string, url: string) => {
    try {
      await Share.share({
        message: `Check out "${title}" on Wikipedia:\n${url}\nShared via Scrollpedia 📚`,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  // Function to render each article item
  const renderItem = ({ item }: { item: FeedArticleItem }) => (
    <View className="h-fit w-full relative" style={{ height: height * 0.9 }}>
      {/* Article background image */}
      <ImageBackground
        source={{ uri: item.article_data.article_image }}
        style={{ position: "absolute", width: "100%", height: "100%" }}
        resizeMode="cover"
      />

      {/* Floating Action Buttons */}
      <View className="absolute right-4" style={{ bottom: height * 0.45 }}>
        {/* Like Button */}
        <TouchableOpacity onPress={() => toggleLike(item.article_id)} className="mb-4">
          <Heart
            color={likedItems[item.article_id] ? "red" : "white"}
            size={32}
            fill={likedItems[item.article_id] ? "red" : "none"}
          />
        </TouchableOpacity>

        {/* Share Button */}
        <TouchableOpacity
          onPress={() =>
            shareArticle(item.article_data.article_heading, item.article_data.article_link)
          }
          className="mb-4"
        >
          <Send color="white" size={32} />
        </TouchableOpacity>
      </View>

      {/* Article Information Section */}
      <View className="flex absolute bottom-10 w-full p-3">
        <View className="w-full rounded-3xl gap-y-2 bg-black/60 p-4">
          {/* Article Title */}
          <ThemedText className="text-2xl font-bold text-white mb-1">
            {item.article_data.article_heading}
          </ThemedText>
          {/* Article Summary */}
          <ThemedText className="text-white mb-2" numberOfLines={10}>
            {item.article_data.article_summary}
          </ThemedText>

          {/* Read More Button */}
          <TouchableOpacity onPress={() => Linking.openURL(item.article_data.article_link)}>
            <ThemedText className="text-[#00c3ff] text-lg font-bold underline">
              Read More
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // Show loading indicator while fetching data
  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color={colorScheme === "dark" ? "white" : "#4c0120"} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1">
      <LinearGradient
        colors={[colorScheme === "dark" ? "#000000" : "#ffeff7", "#4C0120"]}
        className="flex-1"
      >
        {/* Header Section */}
        <View className="flex-row justify-start gap-2 mt-7 ml-3 py-5">
          <ScrollText
            size={28}
            color={colorScheme === "dark" ? "white" : "#4c0120"}
            className="ml-4"
          />
          <ThemedText className="text-2xl font-bold text-[#4c0120] dark:text-white">
            Scrollpedia
          </ThemedText>
        </View>

        {/* Feed Section */}
        <FlatList
          ref={flatListRef}
          data={feedArticles}
          keyExtractor={(item) => item.article_id.toString()}
          renderItem={renderItem}
          pagingEnabled
          snapToAlignment="start"
          decelerationRate="fast"
          directionalLockEnabled
          showsVerticalScrollIndicator={false}
          className="w-full snap-proximity rounded-tl-3xl rounded-tr-3xl"
        />
      </LinearGradient>
    </SafeAreaView>
  );
}