import { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#6A1B4D", "#4C0120"]} style={styles.gradientBackground}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.content}>
          

          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>Welcome</Text>
            <Text style={styles.backText}>Back!</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#fff" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor="#ccc"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#fff" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#ccc"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.rememberContainer}>
              <TouchableOpacity style={styles.checkboxContainer} onPress={() => setRememberMe(!rememberMe)}>
                <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                  {rememberMe && <Ionicons name="checkmark" size={12} color="#fff" />}
                </View>
                <Text style={styles.rememberText}>Remember for 30 days</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.loginButton}>
              <Text style={styles.loginButtonText}>LOG IN</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.forgotPasswordContainer}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <View style={styles.signupContainer}>
              <Text style={styles.noAccountText}>Don't have an account?</Text>
              <TouchableOpacity>
                <Text style={styles.signupText}> Sign up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: "contain",
    marginBottom: 20,
  },
  welcomeContainer: {
    marginBottom: 20,
    alignItems: "center",
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
  },
  backText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#e83e8c",
  },
  formContainer: {
    width: "100%",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  eyeIcon: {
    position: "absolute",
    right: 15,
  },
  input: {
    flex: 1,
    color: "#fff",
    height: 50,
  },
  rememberContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 3,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#e83e8c",
    borderColor: "#e83e8c",
  },
  rememberText: {
    color: "#ccc",
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: "#9c0040",
    borderRadius: 10,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  forgotPasswordContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  forgotPasswordText: {
    color: "#ccc",
    fontSize: 14,
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  noAccountText: {
    color: "#ccc",
    fontSize: 14,
  },
  signupText: {
    color: "#e83e8c",
    fontSize: 14,
    fontWeight: "bold",
  },
});
