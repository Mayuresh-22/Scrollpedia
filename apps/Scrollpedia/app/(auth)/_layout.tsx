import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Redirect, Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import "@/global.css";
import { useColorScheme } from "@/hooks/useColorScheme";
import { supabase } from "@/services/supabase";
import { useAuth } from "@/context/AuthContext";


export default function AuthLayout() {
  const colorScheme = useColorScheme();
  const authContext = useAuth();

  if (authContext.isAuthenticated) {
    return <Redirect href="/(tabs)/home" />;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ headerShown: false }} />
        <Stack.Screen
          name="content-preference"
          options={{ headerShown: false }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
