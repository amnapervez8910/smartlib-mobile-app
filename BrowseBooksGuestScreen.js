import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { supabase } from "./supabase"; 

const COLORS = {
  dark: "#061d17",
  dark2: "#3a5a40",
  bg: "#f9fafb",
  accent: "#b5a820",
  accent2: "#10b981", 
  issued: "#ef4444",  
  text: "#111",
  card: "#ffffff",
  muted: "#777",
};

export default function BrowseBooksGuestScreen({ navigation }) {
  const [search, setSearch] = useState("");
  const [books, setBooks] = useState([]); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooks();
  }, []);

  async function fetchBooks() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .order("title", { ascending: true });

      if (error) {
        console.error("Error fetching books:", error);
        Alert.alert("Error", "Could not load books.");
      } else {
        setBooks(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = books.filter((b) =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.author.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingTop: 60, paddingHorizontal: 20 }}>
        <Text style={styles.title}>Browse Library Books</Text>
        <Text style={styles.subtitle}>View available books in our collection</Text>

        {/* --- MOVED LOGIN SECTION TO TOP --- */}
        <View style={styles.loginMessageCard}>
          <Text style={styles.loginMessageText}>
            To issue any book, please{" "}
            <Text style={styles.loginLink} onPress={() => navigation.navigate("Login")}>
              login
            </Text>
          </Text>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.primaryBtnText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
        {/* --------------------------------- */}

        {/* Search Bar */}
        <View style={{ marginBottom: 20 }}>
          <View style={styles.searchBox}>
            <Feather name="search" size={18} color={COLORS.muted} style={{ marginRight: 8 }} />
            <TextInput
              placeholder="Search by title or author"
              style={{ flex: 1 }}
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </View>

        <Text style={{ marginBottom: 12, color: COLORS.muted, fontWeight: "600" }}>
          Current Collection ({filtered.length})
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.dark2} style={{ marginTop: 20 }} />
        ) : (
          filtered.map((item) => {
            const isAvailable = item.status && item.status.toLowerCase() === "available";
            
            return (
              <View key={item.book_id || item.id} style={styles.bookCard}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: "700", fontSize: 16 }}>{item.title}</Text>
                  <Text style={{ color: COLORS.muted }}>
                    {item.author} • {item.category}
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text
                    style={[
                      styles.badge,
                      { backgroundColor: isAvailable ? COLORS.accent2 : COLORS.issued },
                    ]}
                  >
                    {isAvailable ? "Available" : "Issued"}
                  </Text>
                </View>
              </View>
            );
          })
        )}
        
        {/* Added some padding at the bottom for better scrolling feel */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  title: { fontSize: 22, fontWeight: "700", color: COLORS.dark },
  subtitle: { fontSize: 14, color: COLORS.muted, marginTop: 4 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e6e6e6",
  },
  bookCard: {
    flexDirection: "row",
    backgroundColor: COLORS.card,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: "center",
    elevation: 2, 
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  badge: {
    color: "#fff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 12,
    fontWeight: "700",
    overflow: "hidden",
  },
  loginMessageCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginVertical: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    // Adding subtle shadow for the top placement
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  loginMessageText: { color: COLORS.muted, fontSize: 14 },
  loginLink: { color: COLORS.dark2, fontWeight: "800", textDecorationLine: 'underline' },
  primaryBtn: {
    marginTop: 10,
    backgroundColor: COLORS.dark2,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    width: "100%"
  },
  primaryBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});