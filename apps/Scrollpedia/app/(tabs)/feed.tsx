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
import { Audio } from 'expo-av';
import { Sound } from "expo-av/build/Audio";

const { height } = Dimensions.get("window");

export default function FeedScreen() {
  const [feedArticles, setFeedArticles] = useState<FeedArticleItem[] | null>(null);
  const [likedItems, setLikedItems] = useState<{ [key: number]: boolean }>({});
  const [savedItems, setSavedItems] = useState<{ [key: number]: FeedArticleItem }>({});
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [currSound, setCurrSound] = useState<Sound|null>(null);
  const colorScheme = useColorScheme();
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const initializeData = async () => {
      try {
        // Load saved items from AsyncStorage
        const saved = await AsyncStorage.getItem("savedArticles");
        if (saved) {
          setSavedItems(JSON.parse(saved));
        }

        // Fetch feed if not already loaded
        if (!feedArticles) {
          setLoading(true);
          const feed = await feedService.getFeed();
          console.log(feed);
          
          setFeedArticles(feed);
        }
      } catch (error) {
        console.error("Error initializing data:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [feedArticles]);

  const toggleLike = (id: number) => {
    setLikedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSave = async (id: number) => {
    try {
      const article = feedArticles?.find((item) => item.article_id === id);
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
          console.log("Saved Article:", JSON.stringify(article, null, 2)); // Pretty print article object
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

        <TouchableOpacity onPress={() => toggleSave(item.article_id)} className="mb-4">
          <Bookmark
            color={savedItems[item.article_id] ? "#FFD700" : "white"} // Gold if saved
            size={32}
            fill={savedItems[item.article_id] ? "#FFD700" : "none"}
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

  async function playSound(audio_file_url: string) {
    console.log('Loading Sound');
    currSound?.stopAsync(); // Stop any currently playing sound
    const { sound } = await Audio.Sound.createAsync({ uri: audio_file_url });
    setCurrSound(sound);
    await sound.playAsync();
  }

  useEffect(() => {
    return currSound
      ? () => {
          currSound.unloadAsync();
        }
      : undefined;
  }, [currSound]);

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
            Scrollpedia
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
                  <Link href={"/(tabs)/savedArticles"} style={{ color: 'white' }}>See Saved Articles</Link>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

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
          onViewableItemsChanged={({ viewableItems }) => {
            if (viewableItems.length > 0 && viewableItems[0].item.audio_data.file_url) {
              playSound(viewableItems[0].item.audio_data.file_url);
            }
          }}
          className="w-full snap-proximity rounded-tl-3xl rounded-tr-3xl"
        />
      </LinearGradient>
    </SafeAreaView>
  );
}