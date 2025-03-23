import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  Dimensions,
  Linking,
  SafeAreaView,
  FlatList,
  ImageBackground,
  useColorScheme,
  ActivityIndicator,
} from "react-native";
import { Heart, LucideScroll, ScrollText, Send } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ThemedText } from "@/components/ThemedText";
import feedService, { FeedArticleItem } from "@/services/feedService";

const { height } = Dimensions.get("window");

export default function FeedScreen() {
  const [feedArticles, setFeedArticles] = useState<FeedArticleItem[]|null>(null);
  const [likedItems, setLikedItems] = useState<{ [key: number]: boolean }>({});
  const [loading, setLoading] = useState(true); // New state for loading
  const flatListRef = useRef<FlatList>(null);
  const colorScheme = useColorScheme();

  const toggleLike = (id: number) => {
    setLikedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    const fetchFeed = async () => {
      setLoading(true); // Start loading
      const feed = await feedService.getFeed();
      setFeedArticles(feed);
      setLoading(false); // Stop loading
    };
    if (!feedArticles) {
      fetchFeed();
    }
  }, []);

  const renderItem = ({ item }: { item: FeedArticleItem }) => (
    <View className="h-fit w-full relative" style={{ height: height * 0.9 }}>
      <ImageBackground
        source={{ uri: item.article_data.article_image }}
        style={{ position: "absolute", width: "100%", height: "100%" }}
        resizeMode="cover"
      />

      {/* Floating Action Buttons */}
      <View className="absolute right-4" style={{ bottom: height * 0.45 }}>
        <TouchableOpacity onPress={() => toggleLike(item.article_id)} className="mb-4">
          <Heart
            color={likedItems[item.article_id] ? "red" : "white"}
            size={32}
            fill={likedItems[item.article_id] ? "red" : "none"}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => Linking.openURL(item.article_data.article_link)}>
          <Send color="white" size={32} />
        </TouchableOpacity>
      </View>

      {/* Article Information */}
      <View className="flex absolute bottom-10 w-full p-3">
        <View className="w-full rounded-3xl gap-y-2 bg-black/60 p-4">
          <ThemedText className="text-2xl font-bold text-white mb-1">
            {item.article_data.article_heading}
          </ThemedText>
          <ThemedText className="text-white mb-2" numberOfLines={10}>
            {item.article_data.article_summary}
          </ThemedText>

          <TouchableOpacity onPress={() => Linking.openURL(item.article_data.article_link)}>
            <ThemedText className="text-[#00c3ff] text-lg font-bold underline">
              Read More
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

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
