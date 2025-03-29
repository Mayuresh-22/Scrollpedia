import React, { useState, useRef, useEffect } from "react";
import {
  View,
  ImageBackground,
  TouchableOpacity,
  Dimensions,
  Linking,
  SafeAreaView,
  FlatList,
  useColorScheme,
  ActivityIndicator,
  Text,
} from "react-native";
import { Heart, Send, Bookmark, MoreVertical } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ThemedText } from "@/components/ThemedText";
import feedService, { FeedArticleItem } from "@/services/feedService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link } from "expo-router";
import { useFocusEffect } from '@react-navigation/native'; // Import useFocusEffect

const { height } = Dimensions.get("window");

export default function FeedScreen() {
  const [feedArticles, setFeedArticles] = useState<FeedArticleItem[] | null>(null);
  const [likedItems, setLikedItems] = useState<{ [key: number]: boolean }>({});
  const [savedItems, setSavedItems] = useState<{ [key: number]: FeedArticleItem }>({});
  const [savedArticlesArray, setSavedArticlesArray] = useState<FeedArticleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const flatListRef = useRef<FlatList>(null);
  const colorScheme = useColorScheme();

  // Update savedArticlesArray whenever savedItems changes
  useEffect(() => {
    // Filter out any potentially problematic items
    const validItems = Object.values(savedItems).filter(item =>
      item && item.article_id !== undefined && item.article_data
    );
    setSavedArticlesArray(validItems);
  }, [savedItems]);

  const loadData = async () => {
    try {
      // Load saved items from AsyncStorage
      const saved = await AsyncStorage.getItem("savedArticles");
      if (saved) {
        try {
          const parsedSaved = JSON.parse(saved);
          setSavedItems(parsedSaved || {});

          // Filter out any potentially problematic items
          const validItems = Object.values(parsedSaved || {}).filter(item =>
            item && item.article_id !== undefined && item.article_data
          );
          setSavedArticlesArray(validItems);
        } catch (parseError) {
          console.error("Error parsing saved articles:", parseError);
          setSavedItems({});
          setSavedArticlesArray([]);
        }
      }

      // Fetch feed
      setLoading(true);
      const feed = await feedService.getFeed();
      setFeedArticles(feed);

    } catch (error) {
      console.error("Error initializing data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  },[]);

  useFocusEffect(
      React.useCallback(() => {
          loadData();
      }, [])
  );

  const toggleLike = (id: number) => {
    if (id === undefined) return;
    setLikedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSave = async (id: number) => {
    if (id === undefined) return;

    try {
      const article = feedArticles?.find((item) => item && item.article_id === id);
      if (!article) return;

      setSavedItems((prev) => {
        const isSaved = !!prev[id];
        let updated: { [key: number]: FeedArticleItem };

        if (isSaved) {
          // Remove from saved items
          updated = { ...prev };
          delete updated[id];
          console.log(`Article with ID ${id} removed from saved items`);
        } else {
          // Add to saved items and print article details
          updated = { ...prev, [id]: article };
          console.log("Saved Article:", JSON.stringify(article, null, 2));
        }

        // Save to AsyncStorage
        AsyncStorage.setItem("savedArticles", JSON.stringify(updated));
        return updated;
      });
    } catch (error) {
      console.error("Error toggling save:", error);
    }
  };

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const renderItem = ({ item }: { item: FeedArticleItem }) => {
    // Safety check for valid item
    if (!item || !item.article_data || item.article_id === undefined) {
      return null;
    }

    return (
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

          <TouchableOpacity onPress={() => toggleSave(item.article_id)} className="mb-4">
            <Bookmark
              color="gold" // Always gold in saved view
              size={32}
              fill="gold"  // Always filled in saved view
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => item.article_data.article_link ? Linking.openURL(item.article_data.article_link) : null}>
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
            <TouchableOpacity onPress={() => item.article_data.article_link ? Linking.openURL(item.article_data.article_link) : null}>
              <ThemedText className="text-[#00c3ff] text-lg font-bold underline">
                Read More
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  // Empty state when no saved articles
  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center p-5">
      <ThemedText className="text-xl text-center mb-4">
        You haven't saved any articles yet
      </ThemedText>
      <TouchableOpacity
        onPress={() => Linking.openURL('/(tabs)/feed')}
        className="bg-[#4C0120] py-3 px-6 rounded-full"
      >
        <ThemedText className="text-white font-bold">Browse Articles</ThemedText>
      </TouchableOpacity>
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
        <View className="flex-row justify-between items-center mt-7 mx-3 py-5">
          <ThemedText className="text-2xl font-bold text-[#4c0120] dark:text-white">
            Saved Articles
          </ThemedText>

          {/* 3-dots menu button - In ScrollPedia line */}
          <View className="relative">
            <TouchableOpacity onPress={toggleMenu}>
              <MoreVertical
                color={colorScheme === "dark" ? "white" : "black"}
                size={28}
              />
            </TouchableOpacity>

            {/* Menu Dropdown - UI Only */}
            {showMenu && (
              <View className="absolute right-0 top-10 bg-black/80 rounded-lg w-48 z-10 overflow-hidden">
                <TouchableOpacity
                  onPress={() => toggleMenu()}
                  className="py-3 px-4"
                >
                  <Link href={"/(tabs)/feed"} style={{ color: 'white' }}>All Articles</Link>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {savedArticlesArray.length > 0 ? (
          <FlatList
            ref={flatListRef}
            data={savedArticlesArray}
            keyExtractor={(item) => (item && item.article_id !== undefined) ? item.article_id.toString() : Math.random().toString()}
            renderItem={renderItem}
            pagingEnabled
            snapToAlignment="start"
            decelerationRate="fast"
            directionalLockEnabled
            showsVerticalScrollIndicator={false}
            className="w-full snap-proximity rounded-tl-3xl rounded-tr-3xl"
            extraData={savedItems} // Ensure FlatList re-renders when savedItems changes
          />
        ) : (
          renderEmptyState()
        )}
      </LinearGradient>
    </SafeAreaView>
  );
}