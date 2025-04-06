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
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import {
  Heart,
  Send,
  Bookmark,
  MoreVertical,
  ScrollText,
  MessageCircle,
  X,
  Volume2,
  VolumeX,
  Search,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ThemedText } from "@/components/ThemedText";
import feedService, { FeedArticleItem } from "@/services/feedService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link } from "expo-router";
import { Audio } from "expo-av";
import { Sound } from "expo-av/build/Audio";
import { FlashList } from "@shopify/flash-list";
import { supabase } from '@/services/supabase';

const { height, width } = Dimensions.get("window");

interface Comment {
  id: string;
  username: string;
  text: string;
  timestamp: number;
  article_id: number;
}

const CONTENT_PREFERENCES = [
  'Artificial Intelligence',
  'Space Exploration',
  'Ancient Civilizations',
  'World Wars',
  'Hollywood & Cinema',
  'Music History',
  'Olympics & Global Sports',
  'Physics & Chemistry',
  'Medical Innovations',
  'Environmental Science',
  'Global Politics',
  'Stock Market & Economy',
  'Philosophy & Ethics',
  'Psychology & Neuroscience',
  'Modern Literature',
];

export default function FeedScreen() {
  const [feedArticles, setFeedArticles] = useState<FeedArticleItem[] | null>(null);
  const [likedItems, setLikedItems] = useState<{ [key: number]: boolean }>({});
  const [savedItems, setSavedItems] = useState<{ [key: number]: FeedArticleItem }>({});
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [currSound, setCurrSound] = useState<Sound | null>(null);
  const [prefetchedSounds, setPrefetchedSounds] = useState<{ [key: number]: Sound }>({});
  const [commentModalVisible, setCommentModalVisible] = useState<boolean>(false);
  const [currentArticleId, setCurrentArticleId] = useState<number | null>(null);
  const [commentText, setCommentText] = useState<string>("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentCounts, setCommentCounts] = useState<{ [key: number]: number }>({});
  const [username, setUsername] = useState<string>("");
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [searchModalVisible, setSearchModalVisible] = useState<boolean>(false);
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<FeedArticleItem[] | null>(null);
  const [isSearchActive, setIsSearchActive] = useState<boolean>(false);

  const colorScheme = useColorScheme();
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    (async () => {
      const user = (await supabase.auth.getUser()).data.user;
      setUsername(user?.user_metadata?.username || user?.email?.split('@')[0] || "User");
    })();
  }, []);

  useEffect(() => {
    const initializeData = async () => {
      try {
        const saved = await AsyncStorage.getItem("savedArticles");
        if (saved) setSavedItems(JSON.parse(saved));
        
        const liked = await AsyncStorage.getItem("likedArticles");
        if (liked) setLikedItems(JSON.parse(liked));

        const totalLikes = await AsyncStorage.getItem("totalLikes");
        if (!totalLikes) await AsyncStorage.setItem("totalLikes", "0");

        const counts = await AsyncStorage.getItem("commentCounts");
        if (counts) setCommentCounts(JSON.parse(counts));

        if (!feedArticles) {
          setLoading(true);
          const feed = await feedService.getFeed();
          console.log("Fetched feed articles with tags:", feed.map(a => ({ heading: a.article_data.article_heading, tags: a.tags }))); // Debug log
          setFeedArticles(feed);
        }
      } catch (error) {
        console.error("Error initializing data:", error);
        Alert.alert("Error", "Failed to initialize data");
      } finally {
        setLoading(false);
      }
    };
    initializeData();
  }, [feedArticles]);

  useEffect(() => {
    const loadComments = async () => {
      if (currentArticleId !== null && commentModalVisible) {
        try {
          const storedComments = await AsyncStorage.getItem("articleComments");
          const allComments = storedComments ? JSON.parse(storedComments) : {};
          setComments(allComments[currentArticleId] || []);
        } catch (error) {
          console.error("Error loading comments:", error);
        }
      }
    };
    loadComments();
  }, [currentArticleId, commentModalVisible]);

  useEffect(() => {
    return currSound
      ? () => {
          currSound.unloadAsync();
        }
      : undefined;
  }, [currSound]);

  useEffect(() => {
    return () => {
      Object.values(prefetchedSounds).forEach((sound) => sound.unloadAsync());
    };
  }, [prefetchedSounds]);

  const toggleMute = async () => {
    try {
      if (currSound) {
        await currSound.setVolumeAsync(isMuted ? 1.0 : 0.0);
        setIsMuted(!isMuted);
      }
    } catch (error) {
      console.error("Error toggling mute:", error);
    }
  };

  const toggleLike = async (id: number) => {
    const newLikedItems = { ...likedItems, [id]: !likedItems[id] };
    setLikedItems(newLikedItems);
    
    try {
      await AsyncStorage.setItem("likedArticles", JSON.stringify(newLikedItems));
      const currentTotalLikes = parseInt(await AsyncStorage.getItem("totalLikes") || "0", 10);
      const updatedTotalLikes = newLikedItems[id] ? currentTotalLikes + 1 : Math.max(0, currentTotalLikes - 1);
      await AsyncStorage.setItem("totalLikes", updatedTotalLikes.toString());
    } catch (error) {
      console.error("Error saving liked items:", error);
    }
  };

  const toggleSave = async (id: number) => {
    try {
      const article = feedArticles?.find((item) => item.article_id === id);
      if (!article) return;

      setSavedItems((prev) => {
        const isSaved = !!prev[id];
        let updated = { ...prev };
        if (isSaved) delete updated[id];
        else updated[id] = article;

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

  const toggleSearchModal = () => {
    setSearchModalVisible(!searchModalVisible);
    if (searchModalVisible && selectedPreferences.length === 0) {
      setIsSearchActive(false);
      setFilteredArticles(null);
    }
  };

  const togglePreference = (preference: string) => {
    setSelectedPreferences(prev =>
      prev.includes(preference)
        ? prev.filter(p => p !== preference)
        : [...prev, preference]
    );
  };

  const handleSearch = () => {
    if (selectedPreferences.length === 0) {
      Alert.alert("No Selection", "Please select at least one content preference");
      return;
    }

    if (!feedArticles) return;

    const filtered = feedArticles.filter(article =>
      article.tags && // Ensure tags exist
      selectedPreferences.some(pref =>
        article.tags.map(tag => tag.toLowerCase()).includes(pref.toLowerCase())
      )
    );
    console.log("Filtered articles by tags:", filtered.map(a => ({ heading: a.article_data.article_heading, tags: a.tags }))); // Debug log
    setFilteredArticles(filtered.length > 0 ? filtered : feedArticles); // Fallback to all articles if no match
    setIsSearchActive(true);
    setSearchModalVisible(false);
  };

  const clearSearch = () => {
    setSelectedPreferences([]);
    setFilteredArticles(null);
    setIsSearchActive(false);
    console.log("Search cleared, showing all articles"); // Debug log
  };

  const openCommentModal = (id: number) => {
    setCurrentArticleId(id);
    setCommentModalVisible(true);
  };

  const closeCommentModal = () => {
    setCommentModalVisible(false);
    setCommentText("");
  };

  const addComment = async () => {
    if (!commentText.trim() || currentArticleId === null) return;
    
    const newComment = {
      id: Date.now().toString(),
      username: username,
      text: commentText,
      timestamp: Date.now(),
      article_id: currentArticleId
    };
    
    try {
      const storedComments = await AsyncStorage.getItem("articleComments");
      const allComments = storedComments ? JSON.parse(storedComments) : {};
      const articleComments = allComments[currentArticleId] || [];
      const updatedComments = [...articleComments, newComment];
      
      const newCount = updatedComments.length;
      const updatedCounts = {...commentCounts, [currentArticleId]: newCount};
      
      allComments[currentArticleId] = updatedComments;
      await AsyncStorage.setItem("articleComments", JSON.stringify(allComments));
      await AsyncStorage.setItem("commentCounts", JSON.stringify(updatedCounts));
      
      setComments(updatedComments);
      setCommentCounts(updatedCounts);
      setCommentText("");
    } catch (error) {
      console.error("Error adding comment:", error);
      Alert.alert("Error", "Failed to add comment.");
    }
  };

  const renderItem = ({ item }: { item: FeedArticleItem }) => (
    <View className="h-fit w-full relative" style={{ height: height * 0.9 }}>
      <ImageBackground
        source={{ uri: item.article_data.article_image }}
        style={{ position: "absolute", width: "100%", height: "100%" }}
        resizeMode="cover"
      />

      <View className="absolute right-4" style={{ bottom: height * 0.45 }}>
        <TouchableOpacity onPress={toggleMute} className="mb-4">
          {isMuted ? (
            <VolumeX color="#dcdcdc" size={32} />
          ) : (
            <Volume2 color="#dcdcdc" size={32} />
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => toggleLike(item.article_id)} className="mb-4">
          <Heart
            color={likedItems[item.article_id] ? "red" : "#dcdcdc"}
            size={32}
            fill={likedItems[item.article_id] ? "red" : "none"}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => toggleSave(item.article_id)} className="mb-4">
          <Bookmark
            color={savedItems[item.article_id] ? "#FFD700" : "#dcdcdc"} 
            size={32}
            fill={savedItems[item.article_id] ? "#FFD700" : "none"}
          />
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => openCommentModal(item.article_id)}
          className="mb-4 relative"
        >
          <MessageCircle color="#dcdcdc" size={32} />
          {commentCounts[item.article_id] > 0 && (
            <View className="absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 flex items-center justify-center">
              <ThemedText className="text-white text-xs">
                {commentCounts[item.article_id]}
              </ThemedText>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => shareArticle(item.article_data.article_heading, item.article_data.article_link)}
          className="mb-4"
        >
          <Send color="#dcdcdc" size={32} />
        </TouchableOpacity>
      </View>

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

  const onViewableItemsChanged = useRef(
    async ({ viewableItems }: { viewableItems: { item: FeedArticleItem }[] }) => {
      if (viewableItems.length > 0) {
        const currentArticle = viewableItems[0].item;
        if (currSound) {
          console.log("Stopping current sound immediately");
          await currSound.stopAsync();
        }
        if (currentArticle.audio_data.file_url) {
          const sound =
            prefetchedSounds[currentArticle.article_id] ||
            (await preloadAudio(currentArticle.audio_data.file_url));
          console.log("Playing sound for article:", currentArticle.article_id);
          await sound.setVolumeAsync(isMuted ? 0.0 : 1.0);
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

  const displayArticles = isSearchActive && filteredArticles !== null ? filteredArticles : feedArticles;

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

          <View className="flex-row items-center gap-x-4">
            <TouchableOpacity onPress={toggleSearchModal}>
              <Search 
                size={24} 
                color={colorScheme === "dark" ? "white" : "#4c0120"} 
              />
            </TouchableOpacity>

            <View className="relative">
              <TouchableOpacity onPress={toggleMenu}>
                <MoreVertical
                  color={colorScheme === "dark" ? "white" : "#4c0120"}
                  size={28}
                />
              </TouchableOpacity>
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
        </View>

        <Modal
          visible={searchModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={toggleSearchModal}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
          >
            <View className="flex-1 bg-black/50 justify-center">
              <View className="mx-4 bg-white dark:bg-gray-900 rounded-2xl p-4 max-h-[80%]">
                <View className="flex-row justify-between items-center mb-4">
                  <ThemedText className="text-xl font-bold">Search Articles</ThemedText>
                  <TouchableOpacity onPress={toggleSearchModal}>
                    <X size={24} color={colorScheme === "dark" ? "white" : "black"} />
                  </TouchableOpacity>
                </View>

                <ScrollView className="mb-4">
                  {CONTENT_PREFERENCES.map((preference) => (
                    <TouchableOpacity
                      key={preference}
                      onPress={() => togglePreference(preference)}
                      className={`p-3 mb-2 rounded-lg ${
                        selectedPreferences.includes(preference)
                          ? 'bg-[#4c0120]'
                          : 'bg-gray-100 dark:bg-gray-800'
                      }`}
                    >
                      <ThemedText 
                        className={selectedPreferences.includes(preference) 
                          ? 'text-white' 
                          : 'dark:text-white'
                        }
                      >
                        {preference}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <View className="flex-row gap-x-3">
                  <TouchableOpacity
                    onPress={clearSearch}
                    className="flex-1 bg-gray-200 dark:bg-gray-700 py-3 rounded-lg items-center"
                  >
                    <ThemedText>Clear</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleSearch}
                    className="flex-1 bg-[#4c0120] py-3 rounded-lg items-center"
                  >
                    <ThemedText className="text-white">Search</ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {!displayArticles ? (
          <View className="flex-1 justify-center items-center">
            <ThemedText className="text-white font-bold">
              Couldn't load articles. Please try again later.
            </ThemedText>
          </View>
        ) : (
          <FlashList
            data={displayArticles}
            keyExtractor={(item: FeedArticleItem) => item.article_id.toString()}
            renderItem={renderItem}
            estimatedItemSize={height * 0.9}
            pagingEnabled
            snapToInterval={height * 0.9}
            snapToAlignment="start"
            decelerationRate="fast"
            showsVerticalScrollIndicator={false}
            onScrollEndDrag={() => {
              if (currSound) {
                currSound.stopAsync();
              }
            }}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
            extraData={{ likedItems, savedItems, commentCounts, isMuted }}
            className="w-full snap-y snap-mandatory rounded-tl-3xl rounded-tr-3xl"
          />
        )}

        <Modal
          visible={commentModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={closeCommentModal}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
          >
            <View className="flex-1 bg-black/50">
              <View className="flex-1 mt-20 bg-white dark:bg-gray-900 rounded-t-3xl">
                <View className="flex-row justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                  <ThemedText className="text-xl font-bold">Comments</ThemedText>
                  <TouchableOpacity onPress={closeCommentModal}>
                    <X size={24} color={colorScheme === "dark" ? "white" : "black"} />
                  </TouchableOpacity>
                </View>
                
                <ScrollView className="flex-1 p-4">
                  {comments.length > 0 ? (
                    comments.map((comment) => (
                      <View key={comment.id} className="mb-4">
                        <View className="flex-row">
                          <View className="flex-1">
                            <View className="flex-row items-center">
                              <ThemedText className="font-bold mr-2">{comment.username}</ThemedText>
                              <ThemedText>{comment.text}</ThemedText>
                            </View>
                            <View className="flex-row mt-1">
                              <ThemedText className="text-gray-500 text-xs">
                                {new Date(comment.timestamp).toLocaleDateString()}
                              </ThemedText>
                            </View>
                          </View>
                        </View>
                      </View>
                    ))
                  ) : (
                    <View className="flex-1 justify-center items-center py-10">
                      <ThemedText className="text-gray-500">No comments yet. Be the first to comment!</ThemedText>
                    </View>
                  )}
                </ScrollView>
                
                <View className="p-4 border-t border-gray-200 dark:border-gray-700 flex-row items-center">
                  <TextInput
                    className="flex-1 bg-gray-100 dark:bg-gray-800 p-3 rounded-full mr-2"
                    placeholder="Add a comment..."
                    placeholderTextColor={colorScheme === "dark" ? "#A0A0A0" : "#505050"}
                    value={commentText}
                    onChangeText={setCommentText}
                    style={{ color: colorScheme === "dark" ? "white" : "black" }}
                  />
                  <TouchableOpacity 
                    onPress={addComment}
                    disabled={!commentText.trim()}
                  >
                    <ThemedText 
                      className={`font-bold ${commentText.trim() ? "text-blue-500" : "text-blue-300"}`}>
                      Post
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </LinearGradient>
    </SafeAreaView>
  );
}