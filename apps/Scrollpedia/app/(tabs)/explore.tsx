import { useEffect } from "react";
import { Link, useRouter } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import { View } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { LinearGradient } from "expo-linear-gradient";

export default function TabTwoScreen() {
  return (
    <View className="flex-1 items-center justify-center">
      <LinearGradient
        colors={["#000000", "#4c0120"]}
        className="flex-1 w-full items-start justify-center p-5"
      >
        <ThemedText className="text-2xl font-bold text-start text-white">
          Account Screen will be shipped in next release.
        </ThemedText>
        <Link href="/(auth)" replace className="p-3 bg-[#ce0d5d] rounded-lg mt-4">
          <ThemedText className="text-white font-semibold">Explore Feed</ThemedText>
        </Link>
      </LinearGradient>
    </View>
  );
}
