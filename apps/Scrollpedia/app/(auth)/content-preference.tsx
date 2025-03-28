import { useState } from "react";
import {
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import "nativewind";
import { ThemedText } from "@/components/ThemedText";
import authService from "@/services/authService";
import { useRoute } from "@react-navigation/native";
import { AxiosError } from "axios";
import { setItem } from "@/utils/AsyncStorage";
import { useAuth } from "@/context/AuthContext";

type RouteParams = {
  username: string;
  email: string;
  password: string;
};

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

export default function PreferenceSelector() {
  const MIN_MAX_CATEGORIES = 5;
  const { username, email, password } = useRoute().params as RouteParams;
  const authContext = useAuth();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(
        selectedCategories.filter((item) => item !== category)
      );
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const handleSubmit = async () => {
    if (loading) return;
    setLoading(true);
    if (selectedCategories.length < MIN_MAX_CATEGORIES) {
      alert(
        `Please select at least ${
          MIN_MAX_CATEGORIES - selectedCategories.length
        } categories`
      );
      return;
    }
    // create user with selected categories and data passed from signup screen
    try {
      const userData = await authService.signUp(
        username,
        email,
        password,
        selectedCategories
      );
      console.log("User data:", userData);
      await setItem("userPreferences", userData?.preferences);
      await setItem("userId", userData?.user_id);
      alert("Sign up successful!");
      authContext.login();
    } catch (error) {
      console.log("Error signing up:", error);
      if ((error as AxiosError).response?.data) {
        alert(
          (error as AxiosError).response?.data?.message ||
            "Error signing up. Please try again later."
        );
      } else {
        alert("Error signing up. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <LinearGradient colors={["#000000", "#4C0120"]} className="flex-1">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          style={{ marginTop: 25 }}
        >
          <View className="flex-1 w-full p-5 items-center justify-center">
            <ThemedText className="text-4xl font-bold text-white mb-8 text-center">
              What topics interest you?
            </ThemedText>

            <View className="flex-row flex-wrap gap-3 mb-8 w-full justify-center">
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
                  <ThemedText
                    className={`text-sm font-medium ${
                      selectedCategories.includes(category)
                        ? "text-white"
                        : "text-[#CCCCCC]"
                    }`}
                  >
                    {category}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              onPress={handleSubmit}
              className="w-full bg-[#9c0040] rounded-full h-12 items-center justify-center mt-3 mb-5"
            >
              <View className="flex-row gap-3 items-center justify-center">
                <ThemedText className="text-white text-lg font-bold">
                  Submit
                </ThemedText>
                {loading && <View className="">
                  <ActivityIndicator color="#FFFFFF" />
                </View>}
              </View>
              {/* loader */}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}
