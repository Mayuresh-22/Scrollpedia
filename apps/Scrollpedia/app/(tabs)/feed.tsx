import React, { useState, useRef } from "react";
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
} from "react-native";
import { Heart, LucideScroll, ScrollText, Send } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ThemedText } from "@/components/ThemedText";

const { height, width } = Dimensions.get("window");

const feedItems = [
  {
    id: 1,
    category: "For You",
    image: require("@/assets/images/article3.jpg"),
    title: "Artificial Intelligence",
    description:
      "AI is the simulation of human intelligence in machines. It enables systems to learn, reason, and solve problems. AI is widely used in automation, natural language processing, and robotics. Its applications range from self-driving cars to medical diagnosis.",
    wikiLink: "https://en.wikipedia.org/wiki/Artificial_intelligence",
  },
  {
    id: 2,
    category: "For You",
    image: require("@/assets/images/article3.jpg"),
    title: "Rolls-Royce",
    description:
      "Rolls-Royce is a British luxury car manufacturer known for its craftsmanship and elegance. Established in 1906, it produces high-end vehicles with advanced technology and premium materials. Rolls-Royce is renowned for its smooth, quiet rides and iconic Spirit of Ecstasy emblem.",
    wikiLink: "https://en.wikipedia.org/wiki/Rolls-Royce_Motor_Cars",
  },
  {
    id: 3,
    category: "For You",
    image: require("@/assets/images/article3.jpg"),
    title: "Kyoto",
    description:
      "Kyoto, Japan's cultural heart, is known for its stunning temples, traditional tea houses, and breathtaking cherry blossoms. The city preserves the beauty of Japan's ancient traditions while blending them with modern life.",
    wikiLink: "https://en.wikipedia.org/wiki/Kyoto",
  },
];

export default function FeedScreen() {
  const [likedItems, setLikedItems] = useState<{ [key: number]: boolean }>({});
  const [activeCategory, setActiveCategory] = useState("For You");
  const flatListRef = useRef<FlatList>(null);
  const colorScheme = useColorScheme();

  const toggleLike = (id: number) => {
    setLikedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderItem = ({ item }: { item: (typeof feedItems)[0] }) => (
    <View className="h-fit w-full relative" style={{ height: height * 0.9 }}>
      <ImageBackground
        source={item.image}
        style={{ position: "absolute", width: "100%", height: "100%" }}
        resizeMode="cover"
      />

      {/* Floating Action Buttons */}
      <View className="absolute right-4" style={{ bottom: height * 0.3 }}>
        <TouchableOpacity onPress={() => toggleLike(item.id)} className="mb-4">
          <Heart
            color={likedItems[item.id] ? "red" : "white"}
            size={32}
            fill={likedItems[item.id] ? "red" : "none"}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => Linking.openURL(item.wikiLink)}>
          <Send color="white" size={32} />
        </TouchableOpacity>
      </View>

      {/* Article Information */}
      <View className="flex absolute bottom-10 w-full p-3">
        <View className="w-full rounded-lg gap-y-2 bg-black/60 p-4">
          <ThemedText className="text-2xl font-bold text-white mb-1">
            {item.title}
          </ThemedText>
          <ThemedText className="text-white mb-2" numberOfLines={3}>
            {item.description}
          </ThemedText>

          <TouchableOpacity onPress={() => Linking.openURL(item.wikiLink)}>
            <ThemedText className="text-[#00c3ff] text-lg font-bold underline">
              Read More
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const filteredFeed = feedItems.filter(
    (item) => item.category === activeCategory
  );

  return (
    <SafeAreaView className="flex-1">
      <LinearGradient
        colors={[colorScheme === "dark" ? "#000000" : "#ffeff7", "#4C0120"]}
        className="flex-1"
      >
        {/* Header Section */}
        <View className="flex-row justify-start gap-2 mt-7 ml-3 py-5">
          <ScrollText size={28} color="white" className="ml-4" />
          <ThemedText className="text-2xl font-bold text-white">
            Scrollpedia
          </ThemedText>
        </View>

        {/* Feed Section */}
        <FlatList
          ref={flatListRef}
          data={filteredFeed}
          keyExtractor={(item) => item.id.toString()}
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
