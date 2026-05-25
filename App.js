import AsyncStorage from "@react-native-async-storage/async-storage";
import * as React from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  Pressable,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MaterialIcons } from "@expo/vector-icons";

// Screens
import BrowseBooksGuestScreen from "./BrowseBooksGuestScreen";
import StudentTabNavigator from "./student"; 
import FacultyTabNavigator from "./faculty";
import LibrarianTabNavigator from "./librarian";

import { supabase } from "./supabase";

// Optional (only if you are running Expo Web)
import "./styles.js";

/* ------------------------
  Theme / Colors
------------------------ */
const COLORS = {
  dark: "#061d17",
  dark2: "#3a5a40",
  bg: "#f9fafb", 
  accent: "#b5a820",
  accent2: "#10b981",
  text: "#111",
  card: "#ffffff",
  muted: "#777",
};

/* ------------------------
  Splash Screen
------------------------ */
function SplashScreen({ navigation }) {
  React.useEffect(() => {
    const t = setTimeout(() => navigation.replace("Login"), 1600);
    return () => clearTimeout(t);
  }, [navigation]);

  return (
    <SafeAreaView style={[styles.center, { backgroundColor: COLORS.bg }]}>
      <View style={styles.splashCard}>
        <Text style={styles.splashLogo}>📚 SmartLib</Text>
        <Text style={styles.splashSub}>Smart University Library App</Text>
      </View>
    </SafeAreaView>
  );
}

/* ------------------------
  Login Screen
------------------------ */
function LoginScreen({ navigation }) {
  const [role, setRole] = React.useState("student");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  async function onLogin() {
    if (!email || !password) {
      Alert.alert("Error", "Please provide email and password.");
      return;
    }

    try {
      const inputEmail = email.trim().toLowerCase();

      const { data, error } = await supabase
        .from("members")
        .select("member_id, role, name")
        .eq("email", inputEmail)
        .eq("password", password) 
        .eq("role", role)
        .single();

      if (error || !data) {
        Alert.alert("Login Failed", "Email, password or role is incorrect");
        return;
      }
            
      // ✅ SAVE LOGGED IN USER
      await AsyncStorage.setItem(
        "user",
        JSON.stringify({
          id: data.member_id,
          name: data.name,
          role: data.role,
        })
      );

      // Role-based navigation
      if (data.role === "student") {
        navigation.replace("StudentTabs", { email: inputEmail });
      } else if (data.role === "faculty") {
        navigation.replace("FacultyTabs", { email: inputEmail });
      } else if (data.role === "librarian") {
        navigation.replace("LibrarianTabs", { email: inputEmail });
      }
    } catch (err) {
      Alert.alert("Error", "Something went wrong. Please try again.");
      console.log(err);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={{ marginTop: 40 }}>
          <Text style={styles.title}>Welcome to SmartLib</Text>
          <Text style={styles.subtitle}>Login to continue</Text>
        </View>

        <View style={styles.roleRow}>
          {["student", "faculty", "librarian"].map((r) => (
            <Pressable
              key={r}
              onPress={() => setRole(r)}
              style={[styles.rolePill, role === r && styles.roleActive]}
            >
              <Text style={[styles.roleText, role === r && styles.roleTextActive]}>
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>

        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          secureTextEntry
        />

        <TouchableOpacity style={styles.primaryBtn} onPress={onLogin}>
          <Text style={styles.primaryBtnText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => navigation.navigate("BrowseGuest")}
        >
          <Text style={styles.secondaryBtnText}>Stay Logged Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ------------------------
  App Navigation Stack
------------------------ */
const Stack = createNativeStackNavigator();
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Splash">
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="BrowseGuest" component={BrowseBooksGuestScreen} />
        <Stack.Screen name="StudentTabs" component={StudentTabNavigator} />
        <Stack.Screen name="FacultyTabs" component={FacultyTabNavigator} />
        <Stack.Screen name="LibrarianTabs" component={LibrarianTabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  splashCard: {
    backgroundColor: COLORS.card,
    padding: 40,
    borderRadius: 16,
    alignItems: "center",
    elevation: 4,
  },
  splashLogo: { fontSize: 28, fontWeight: "800", color: COLORS.dark },
  splashSub: { marginTop: 8, color: COLORS.muted },
  title: { fontSize: 26, fontWeight: "800", color: COLORS.dark, marginBottom: 6 },
  subtitle: { color: COLORS.muted, marginBottom: 20 },
  roleRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  rolePill: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: "#e5e7eb" },
  roleActive: { backgroundColor: COLORS.accent },
  roleText: { color: COLORS.text, fontWeight: "600" },
  roleTextActive: { color: "#fff" },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  primaryBtn: {
    backgroundColor: COLORS.dark2,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  primaryBtnText: { color: "#fff", fontWeight: "700" },
  secondaryBtn: {
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
    borderWidth: 1,
    borderColor: COLORS.dark2,
  },
  secondaryBtnText: { color: COLORS.dark2, fontWeight: "700" },
});