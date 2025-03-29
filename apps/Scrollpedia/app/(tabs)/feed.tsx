import React, { useState, useRef, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  Dimensions,
  Linking,
  SafeAreaView,
  FlatList,
  ImageBackground,
  useColorScheme,
  ActivityIndicator,
  ScrollView,
  Text,
} from "react-native";
import { Heart, Send, Search, MoreVertical, ArrowLeft } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ThemedText } from "@/components/ThemedText";
import feedService, { FeedArticleItem } from "@/services/feedService";

const { height } = Dimensions.get("window");

const categories = [
  "Artificial Intelligence",
  "Space Exploration",
  "Ancient Civilizations",
  "World Wars",
  "Hollywood & Cinema",
  "Music History",
  "Olympics & Global Sports",
  "Physics & Chemistry",
  "Medical Innovations",
  "Environmental Science",
  "Global Politics",
  "Stock Market & Economy",
  "Philosophy & Ethics",
  "Psychology & Neuroscience",
  "Modern Literature",
];

export default function FeedScreen() {
  const [feedArticles, setFeedArticles] = useState<FeedArticleItem[] | null>(null);
  const [likedItems, setLikedItems] = useState<{ [key: number]: boolean }>({});
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);
  const colorScheme = useColorScheme();

  // Search State
  const [searchActive, setSearchActive] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchFeed = async () => {
      setLoading(true);
      const feed = await feedService.getFeed(selectedCategories);
      setFeedArticles(feed);
      setLoading(false);
    };
    fetchFeed();
  }, [selectedCategories]); // Fetches new data when selectedCategories change

  const toggleLike = (id: number) => {
    setLikedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

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

  return (
    <SafeAreaView className="flex-1">
      <LinearGradient colors={[colorScheme === "dark" ? "#000000" : "#ffeff7", "#4C0120"]} className="flex-1">
        {/* Header Section */}
        <View className="flex-row justify-between items-center mt-7 ml-3 py-5 px-4">
          <ThemedText className="text-2xl font-bold text-[#4c0120] dark:text-white">Scrollpedia</ThemedText>
          <View className="flex-row gap-4">
            <TouchableOpacity onPress={() => setSearchActive(true)}>
              <Search size={28} color={colorScheme === "dark" ? "white" : "#4c0120"} />
            </TouchableOpacity>
            <TouchableOpacity>
              <MoreVertical size={28} color={colorScheme === "dark" ? "white" : "#4c0120"} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search UI */}
        {searchActive ? (
          <View>
            {/* Back Button */}
            <View className="flex-row items-center p-5">
            <TouchableOpacity
            onPress={() => {
              setSearchActive(false);
              setSelectedCategories([]); // Reset selected categories
            }}
            className="mr-3"
            >
            <ArrowLeft size={28} color="#4c0120" />
</TouchableOpacity>
              <Text className="text-lg text-white">Select Topics of Interest</Text>
            </View>

            {/* Category Selection */}
            <ScrollView className="p-5">
              <View className="flex-row flex-wrap gap-3">
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    className={`px-4 py-2 rounded-full border ${
                      selectedCategories.includes(category)
                        ? "bg-[#a7255b] border-[#FFFFFF]"
                        : "bg-transparent border-[#CCCCCC]"
                    }`}
                    onPress={() => toggleCategory(category)}
                  >
                    <Text className="text-sm font-medium text-white">{category}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Search Button */}
        <View className="flex items-center p-5">
        <TouchableOpacity
          className="px-6 py-3 rounded-full"
          style={{
            backgroundColor: selectedCategories.length > 0 ? "#a7255b" : "#00c3ff",
          }}
          onPress={() => {
            setSearchActive(false);
            setSelectedCategories([]); // Reset selected categories
          }}
        >
          <Text className="text-white text-lg font-bold">Search</Text>
        </TouchableOpacity>
        </View>

          </View>
        ) : (
          // Feed List
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
        )}
      </LinearGradient>
    </SafeAreaView>
  );
}
