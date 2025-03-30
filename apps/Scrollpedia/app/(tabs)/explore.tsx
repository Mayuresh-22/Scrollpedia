import { useEffect } from "react";
import { Link, useRouter } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import { useColorScheme, View } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { LinearGradient } from "expo-linear-gradient";

export default function TabTwoScreen() {
  const colorScheme = useColorScheme();
  return (
    <View className="flex-1 items-center justify-center">
      <LinearGradient
        colors={[colorScheme === "dark" ? "black" : "white", "#4c0120"]}
        className="flex-1 w-full items-center justify-center p-5"
      >
        <ThemedText className="text-xl font-bold text-center text-white">
          Account Screen will be shipped in next release.
        </ThemedText>
        <Link href="/(auth)" replace className="p-3 bg-[#ce0d5d] rounded-lg mt-4">
          <ThemedText className="text-white font-semibold">Explore Feed</ThemedText>
        </Link>
      </LinearGradient>
    </View>
  );
}
