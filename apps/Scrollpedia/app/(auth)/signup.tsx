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
import "nativewind";
import { Link } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { ThemedText } from "@/components/ThemedText";
import authService from "@/services/authService";
import { NavigationProp, useNavigation } from "@react-navigation/native";

export type RootStackParamList = {
  "content-preference": {
    username: string;
    email: string;
    password: string;
  };
};
export default function SignupScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = () => {
    if (!username || !email || !password || !confirmPassword) {
      alert("Please fill all the fields");
      return false;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleSignup = () => {
    if (!validateForm()) return;
    // pass on data to content-preferences screen, there we will store the data in our backend
    navigation.navigate("content-preference", {
      username,
      email,
      password,
    });
  };

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
                <ThemedText className="text-4xl font-bold text-white">
                  Create an
                </ThemedText>
                <ThemedText className="text-4xl font-bold text-[#ce0d5d]">
                  Account!
                </ThemedText>
              </View>

              <View className="w-full">
                <View className="flex-row items-center bg-[rgba(255,255,255,0.15)] rounded-lg mb-4 px-4 h-12">
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color="#fff"
                    className="mr-2"
                  />
                  <TextInput
                    className="flex-1 text-white h-12"
                    placeholder="Username"
                    placeholderTextColor="#ccc"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                  />
                </View>

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

                <View className="flex-row items-center bg-[rgba(255,255,255,0.15)] rounded-lg mb-4 px-4 h-12 relative">
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color="#fff"
                    className="mr-2"
                  />
                  <TextInput
                    className="flex-1 text-white h-12"
                    placeholder="Confirm Password"
                    placeholderTextColor="#ccc"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4"
                  >
                    <Ionicons
                      name={
                        showConfirmPassword ? "eye-outline" : "eye-off-outline"
                      }
                      size={20}
                      color="#fff"
                    />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  className="bg-[#9c0040] rounded-full h-12 items-center justify-center mt-3 mb-5"
                  onPress={handleSignup}
                >
                  <ThemedText className="text-white text-lg font-bold">
                    Sign Up
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity className="flex-row justify-center mt-5">
                  <Link href="/login" className="p-10" replace>
                    <ThemedText className="text-[#ccc] text-sm">
                      Already have an account?
                    </ThemedText>
                    <Link href="/login" replace>
                      <ThemedText className="text-[#e83e8c] text-sm font-bold">
                        {" "}
                        Log In
                      </ThemedText>
                    </Link>
                  </Link>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}
