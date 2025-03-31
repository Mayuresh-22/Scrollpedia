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
  Share,
} from "react-native";
import {
  Heart,
  Send,
  Bookmark,
  MoreVertical,
  ScrollText,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ThemedText } from "@/components/ThemedText";
import feedService, { FeedArticleItem } from "@/services/feedService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link } from "expo-router";
import { Audio } from "expo-av";
import { Sound } from "expo-av/build/Audio";
import { FlashList } from "@shopify/flash-list";

const { height } = Dimensions.get("window");

export default function FeedScreen() {
  const [feedArticles, setFeedArticles] = useState<FeedArticleItem[] | null>(
    null
  );
  const [likedItems, setLikedItems] = useState<{ [key: number]: boolean }>({});
  const [savedItems, setSavedItems] = useState<{
    [key: number]: FeedArticleItem;
  }>({});
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [currSound, setCurrSound] = useState<Sound | null>(null);
  const [prefetchedSounds, setPrefetchedSounds] = useState<{
    [key: number]: Sound;
  }>({});
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

        if (!feedArticles) {
          setLoading(true);
          const feed = await feedService.getFeed();
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

  useEffect(() => {
    return currSound
      ? () => {
          currSound.unloadAsync(); // Ensure the sound is unloaded when the component unmounts
        }
      : undefined;
  }, [currSound]);

  useEffect(() => {
    return () => {
      // Unload all prefetched sounds when the component unmounts
      Object.values(prefetchedSounds).forEach((sound) => sound.unloadAsync());
    };
  }, [prefetchedSounds]);

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
          updated = { ...prev };
          delete updated[id];
        } else {
          updated = { ...prev, [id]: article };
        }

        // Save to AsyncStorage
        AsyncStorage.setItem("savedArticles", JSON.stringify(updated));
        return updated;
      });
    } catch (error) {
      console.error("Error toggling save:", error);
    }
  };

  const shareArticle = async (title: string, url: string) => {
    try {
      await Share.share({
        message: `Check out this article I found on Scrollpedia 📜\n\n${title}: ${url}`,
        url: url,
        title: title,
      });
    } catch (error) {
      console.error("Error sharing:", error);
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
        <TouchableOpacity
          onPress={() => toggleLike(item.article_id)}
          className="mb-4"
        >
          <Heart
            color={likedItems[item.article_id] ? "red" : "#dcdcdc"}
            size={32}
            fill={likedItems[item.article_id] ? "red" : "none"}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => toggleSave(item.article_id)}
          className="mb-4"
        >
          <Bookmark
            color={savedItems[item.article_id] ? "#FFD700" : "#dcdcdc"} // Gold if saved
            size={32}
            fill={savedItems[item.article_id] ? "#FFD700" : "none"}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            shareArticle(
              item.article_data.article_heading,
              item.article_data.article_link
            )
          }
          className="mb-4"
        >
          <Send color="#dcdcdc" size={32} />
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
          <TouchableOpacity
            onPress={() => Linking.openURL(item.article_data.article_link)}
          >
            <ThemedText className="text-[#00c3ff] text-lg font-bold underline">
              Read More
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const onViewableItemsChanged = useRef(
    async ({ viewableItems }: { viewableItems: any[] }) => {
      if (viewableItems.length > 0) {
        const currentArticle = viewableItems[0].item;
        if (currSound) {
          console.log("Stopping current sound immediately");
          await currSound.stopAsync();
          // await currSound.unloadAsync();
        }
        if (currentArticle.audio_data.file_url) {
          const sound =
            prefetchedSounds[currentArticle.article_id] ||
            (await preloadAudio(currentArticle.audio_data.file_url));
          console.log("Playing sound for article:", currentArticle.article_id);
          await sound.playAsync();
          setCurrSound(sound);
        }
      }
    }
  ).current;

  async function preloadAudio(audio_file_url: string): Promise<Sound> {
    const { sound } = await Audio.Sound.createAsync({ uri: audio_file_url });
    return sound;
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <ActivityIndicator
          size="large"
          color={colorScheme === "dark" ? "white" : "#4c0120"}
        />
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
          <View className="flex-row items-center gap-x-2 ml-2">
            <ScrollText
              size={24}
              color={colorScheme === "dark" ? "white" : "#4c0120"}
            />
            <ThemedText className="text-2xl font-bold text-[#4c0120] dark:text-white">
              Scrollpedia
            </ThemedText>
          </View>

          {/* 3-dots menu button - In ScrollPedia line */}
          <View className="relative">
            <TouchableOpacity onPress={toggleMenu}>
              <MoreVertical
                color={colorScheme === "dark" ? "white" : "#4c0120"}
                size={28}
              />
            </TouchableOpacity>

            {/* Menu Dropdown - UI Only */}
            {showMenu && (
              <View className="absolute right-0 top-10 bg-black/80 rounded-lg w-48 z-10 overflow-hidden">
                <TouchableOpacity onPress={toggleMenu} className="py-3 px-4">
                  <Link
                    onPress={toggleMenu}
                    href={"/(tabs)/savedArticles"}
                    style={{ color: "white" }}
                  >
                    See Saved Articles
                  </Link>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {!feedArticles ? (
          <View className="flex-1 justify-center items-center">
            <ThemedText className="text-white font-bold">
              Couldn't load articles. Please try again later.
            </ThemedText>
          </View>
        ) : (
          <FlashList
            data={feedArticles}
            keyExtractor={(item) => item.article_id.toString()}
            renderItem={renderItem}
            estimatedItemSize={height * 0.9}
            pagingEnabled
            snapToInterval={height * 0.9}
            snapToAlignment="start"
            decelerationRate="fast"
            showsVerticalScrollIndicator={false}
            onScrollEndDrag={() => {
              // Stop the current sound when the user scrolls
              if (currSound) {
                currSound.stopAsync();
              }
            }}
            onViewableItemsChanged={onViewableItemsChanged} // Use the ref callback
            viewabilityConfig={{ itemVisiblePercentThreshold: 60 }} // Ensure proper visibility threshold
            className="w-full snap-y snap-mandatory rounded-tl-3xl rounded-tr-3xl"
          />
        )}
      </LinearGradient>
    </SafeAreaView>
  );
}
