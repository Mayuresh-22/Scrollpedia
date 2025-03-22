import { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import "nativewind";
import { Link } from "expo-router";
import { ThemedText } from "@/components/ThemedText";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <SafeAreaView className="flex-1">
      <LinearGradient colors={["#000000", "#4C0120"]} className="flex-1">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          >
            <View className="flex-1 p-5 justify-center">
              <View className="mb-10">
                <ThemedText className="text-4xl font-bold text-white">Welcome</ThemedText>
                <ThemedText className="text-4xl font-bold text-[#ce0d5d]">Back!</ThemedText>
              </View>

              <View className="w-full">
                <View className="flex-row items-center bg-[rgba(255,255,255,0.15)] rounded-lg mb-4 px-4 h-12">
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color="#fff"
                    className="mr-2"
                  />
                  <TextInput
                    className="flex-1 text-white h-12"
                    placeholder="Email Address"
                    placeholderTextColor="#ccc"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View className="flex-row items-center bg-[rgba(255,255,255,0.15)] rounded-lg mb-4 px-4 h-12 relative">
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color="#fff"
                    className="mr-2"
                  />
                  <TextInput
                    className="flex-1 text-white h-12"
                    placeholder="Password"
                    placeholderTextColor="#ccc"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    className="absolute right-4"
                  >
                    <Ionicons
                      name={showPassword ? "eye-outline" : "eye-off-outline"}
                      size={20}
                      color="#fff"
                    />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  className="flex-row items-center mb-5"
                  onPress={() => setRememberMe(!rememberMe)}
                >
                  <View
                    className={`w-4 h-4 border border-[#ccc] rounded-sm mr-2 items-center justify-center ${
                      rememberMe && "bg-[#ce0d5d] border-[#ce0d5d]"
                    }`}
                  >
                    {rememberMe && (
                      <Ionicons name="checkmark" size={12} color="#fff" />
                    )}
                  </View>
                  <ThemedText className="text-[#ccc] text-sm">
                    Remember for 30 days
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity className="bg-[#9c0040] rounded-lg h-12 items-center justify-center mb-5">
                  <ThemedText className="text-white text-lg font-bold">Log In</ThemedText>
                </TouchableOpacity>

                <TouchableOpacity className="items-center">
                  <ThemedText className="text-[#ccc] text-sm">Forgot Password?</ThemedText>
                </TouchableOpacity>

                <View className="flex-row justify-center mt-5">
                  <Link href="/signup" className="p-10" replace>
                    <ThemedText className="text-[#ccc] text-sm">
                      Don't have an account?
                    </ThemedText>
                    <Link href="/signup" replace>
                      <ThemedText className="text-[#ce0d5d] text-sm font-bold">
                        {" "}
                        Sign up
                      </ThemedText>
                    </Link>
                  </Link>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}
