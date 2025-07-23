import React, { useState } from "react";
import { View, Text, ScrollView, Image, TouchableOpacity, Dimensions, Linking } from "react-native";
import { Heart, Send } from "lucide-react-native";

const { height, width } = Dimensions.get("window");
const contentWidth = width * 0.9; // Match width of text section

const feedItems = [
  {
    id: 1,
    image: require("@/assets/images/article11.jpg"),
    title: "Artificial Intelligence",
    description:
      "AI is the simulation of human intelligence in machines. It enables systems to learn, reason, and solve problems. AI is widely used in automation, natural language processing, and robotics. Its applications range from self-driving cars to medical diagnosis.",
    wikiLink: "https://en.wikipedia.org/wiki/Artificial_intelligence",
  },
  {
    id: 2,
    image: require("@/assets/images/article2.jpg"),
    title: "Rolls-Royce",
    description:
      "Rolls-Royce is a British luxury car manufacturer known for its craftsmanship and elegance. Established in 1906, it produces high-end vehicles with advanced technology and premium materials. Rolls-Royce is renowned for its smooth, quiet rides and iconic Spirit of Ecstasy emblem.",
    wikiLink: "https://en.wikipedia.org/wiki/Rolls-Royce_Motor_Cars",
  },
  {
    id: 3,
    image: require("@/assets/images/article3.jpg"),
    title: "Kyoto",
    description:
      "Kyoto, Japan's cultural heart, is known for its stunning temples, traditional tea houses, and breathtaking cherry blossoms. The city preserves the beauty of Japan's ancient traditions while blending them with modern life.",
    wikiLink: "https://en.wikipedia.org/wiki/Kyoto",
  },
];

export default function SocialFeed() {
  const [likedItems, setLikedItems] = useState<{ [key: number]: boolean }>({});

  const toggleLike = (id: number) => {
    setLikedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <View className="flex-1 bg-[#4c0120]">
      {/* Header Section */}
      <View className="flex-row justify-center mt-6 py-3">
        <TouchableOpacity className="bg-white/10 px-4 py-3 rounded-full mx-2">
          <Text className="text-white">For You</Text>
        </TouchableOpacity>
        <TouchableOpacity className="bg-white/10 px-4 py-3 rounded-full mx-2">
          <Text className="text-white">Saved</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        pagingEnabled
        snapToInterval={height}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
      >
        {feedItems.map((item) => (
          <View key={item.id} className="h-screen justify-center items-center">
            <Image
              source={item.image}
              style={{
                width: contentWidth, // Matching width with text section
                height: height * 0.55,
                borderRadius: 15,
                marginHorizontal: (width - contentWidth) / 2, // Centering the image
              }}
              resizeMode="cover"
            />

            {/* Floating Action Buttons */}
            <View className="absolute right-8" style={{ bottom: height * 0.4 }}>
              <TouchableOpacity className="mb-3">
                <Send color="white" size={32} />
              </TouchableOpacity>

              {/* Like Button */}
              <TouchableOpacity onPress={() => toggleLike(item.id)} className="mb-3">
                <Heart color="white" size={32} fill={likedItems[item.id] ? "white" : "none"} />
              </TouchableOpacity>
            </View>

            {/* Overlapping Text Section */}
            <View
              className="bg-black/60 px-5 py-5 rounded-lg mt-1"
              style={{ width: contentWidth }}
            >
              <Text className="text-2xl font-bold text-white">{item.title}</Text>
              <Text className="text-white mt-2">{item.description}</Text>

              <TouchableOpacity onPress={() => Linking.openURL(item.wikiLink)} className="mt-3">
                <Text className="text-[#00c3ff] font-bold underline">READ ARTICLE</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
