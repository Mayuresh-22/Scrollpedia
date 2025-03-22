import { useState } from "react";
import { Text, View, TouchableOpacity, ImageBackground, SafeAreaView, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import "nativewind";

const categories = [
<<<<<<< HEAD
  "Technology & Science",
  "History & Culture",
  "Entertainment & Media",
  "Sports & Games",
  "Education & Knowledge",
  "Business & Economics",
  "Health & Wellness",
=======
  "Health & Wellness",
  "Entertainment",
  "Sports",
  "Travel & Culture",
  "Education",
  "Science & Technology",
  "News & Politics",
>>>>>>> a28dd170db93a85cc0151c605b69a817534f7c08
];

export default function PreferenceSelector() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((item) => item !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const handleSubmit = () => {
    console.log("Selected categories:", selectedCategories);
    // Handle submission logic here
  };

  return (
    // <ImageBackground source={require("./assets/background.jpg")} className="flex-1 bg-[#4C0120]">
      <SafeAreaView className="flex-1 bg-[rgba(76,1,32,0.85)]">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View className="flex-1 p-5 items-center justify-center">
            <Text className="text-4xl font-bold text-white mb-8 text-center">What would you like to see?</Text>

            <View className="w-full mb-8">
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  className={`bg-[rgba(255,255,255,0.2)] rounded-xl p-4 my-2 border border-[rgba(255,255,255,0.3)] ${
                    selectedCategories.includes(category) && "bg-[rgba(255,91,125,0.6)] border-[rgba(255,255,255,0.5)]"
                  }`}
                  onPress={() => toggleCategory(category)}
                >
                  <View className="flex-row items-center w-full">
                    <View
                      className={`w-6 h-6 rounded-full border-2 border-white mr-3 items-center justify-center ${
                        selectedCategories.includes(category) && "border-white"
                      }`}
                    >
                      {selectedCategories.includes(category) && <View className="w-3 h-3 rounded-full bg-white" />}
                    </View>
                    <Text className="text-white text-lg font-medium">{category}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity onPress={handleSubmit} className="w-full rounded-xl overflow-hidden">
              <LinearGradient
                colors={["#FF5B7D", "#8C52FF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="p-4 items-center justify-center"
              >
                <Text className="text-white text-lg font-bold">SUBMIT</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    // </ImageBackground>
  );
}