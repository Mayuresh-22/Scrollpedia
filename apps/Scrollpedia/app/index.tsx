import {
  Image,
  TouchableOpacity,
  ImageBackground,
  SafeAreaView,
  StatusBar,
  Platform,
  useColorScheme,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ThemedText } from "@/components/ThemedText";

export default function WelcomeScreen() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaView className="flex-1" style={{ marginTop: Platform.OS === "android" ? StatusBar.currentHeight : 0 }}>
      <ImageBackground
        source={require("@/assets/images/image.png")}
        className="flex-1"
      />
        <LinearGradient
          colors={[colorScheme === "dark" ? "#000000" : "#ffffff", "#4C0120"]}
          className="flex-1 w-full h-full absolute justify-end items-center opacity-95 pb-[30%]"
        >
          <Image
            source={require("@/assets/images/icon.png")} // mayuresh: Replace with logo
            className="w-16 h-16 mb-6 rounded-full"
          />
          <ThemedText className="text-white text-3xl font-bold mb-4">
            Welcome to Scrollpedia
          </ThemedText>
          <ThemedText className="text-white text-lg text-center px-10 mb-6">
            Discover and explore articles in a visually engaging way
          </ThemedText>
          <TouchableOpacity
            className="bg-[#4C0120] dark:bg-white px-6 py-3 rounded-full mb-3"
            // onPress={() => navigation.navigate('SignUp')}
          >
            <ThemedText className="text-white dark:text-[#4C0120] text-lg font-semibold">
              Sign Up
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            className="border border-white px-6 py-3 rounded-full"
            // onPress={() => navigation.navigate('Login')}
          >
            <ThemedText className="text-white text-lg font-semibold">Log In</ThemedText>
          </TouchableOpacity>
        </LinearGradient>
    </SafeAreaView>
  );
}
