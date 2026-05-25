import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator
} from "react-native";

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialIcons } from "@expo/vector-icons";
import { supabase } from './supabase';

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

/* -------------------- Dashboard -------------------- */
function LibrarianHome({ navigation }) {
  const [stats, setStats] = useState({ books: 0, members: 0 });
  const [loading, setLoading] = useState(true);

  const actions = [
    { title: "Book Management", icon: "menu-book", color: "#10b981", screen: "ManageBooks" },
    { title: "Member Management", icon: "people", color: "#b5a820", screen: "ManageMembers" },
    { title: "Issue/Return Requests", icon: "assignment-return", color: "#3a5a40", screen: "IssueReturn" },
    { title: "Recommend Books", icon: "thumb-up", color: COLORS.accent2, screen: "Recommendations" }, // Added Recommendation Action
    { title: "Profile", icon: "person", color: "#061d17", screen: "Profile" },
  ];

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      // Fetching live counts from Supabase
      const { count: bookCount } = await supabase.from('books').select('*', { count: 'exact', head: true });
      const { count: memberCount } = await supabase.from('members').select('*', { count: 'exact', head: true });
      
      setStats({
        books: bookCount || 0,
        members: memberCount || 0
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.title}>Librarian Dashboard</Text>
        
        <View style={{ marginTop: 20, flexDirection: "row", justifyContent: "space-between" }}>
          <View style={styles.statCard}>
            <Text style={styles.statTitle}>📘 Total Books</Text>
            {loading ? (
              <ActivityIndicator size="small" color={COLORS.dark2} />
            ) : (
              <Text style={styles.statValue}>{stats.books.toLocaleString()}</Text>
            )}
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statTitle}>👥 Members</Text>
            {loading ? (
              <ActivityIndicator size="small" color={COLORS.dark2} />
            ) : (
              <Text style={styles.statValue}>{stats.members.toLocaleString()}</Text>
            )}
          </View>
        </View>

        <Text style={{ fontWeight: "700", marginTop: 25, marginBottom: 12 }}>Quick Actions</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
          {actions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={{ 
                width: "48%", 
                backgroundColor: action.color + "15", // HCI Lab 12: subtle tint
                padding: 16, 
                borderRadius: 12, 
                marginBottom: 12,
                borderWidth: 1,
                borderColor: action.color + "30" // Adding a stroke for hierarchy
              }}
              onPress={() => navigation.navigate(action.screen)}
            >
              <MaterialIcons name={action.icon} size={28} color={action.color} />
              <Text style={{ marginTop: 8, fontWeight: "700", color: COLORS.dark }}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* -------------------- Book Management -------------------- */
function ManageBooksScreen() {
  const [books, setBooks] = React.useState([]);
  const [title, setTitle] = React.useState("");
  const [author, setAuthor] = React.useState("");
  const [category, setCategory] = React.useState("");

  React.useEffect(() => {
    fetchBooks();
  }, []);

  async function fetchBooks() {
    const { data, error } = await supabase
      .from("books")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setBooks(data);
  }

  async function addBook() {
    if (!title || !author || !category)
      return Alert.alert("All fields required");

    const { error } = await supabase.from("books").insert([
      {
        title,
        author,
        category,
        status: "Available",
      },
    ]);

    if (error) Alert.alert("Error", error.message);
    else {
      setTitle("");
      setAuthor("");
      setCategory("");
      fetchBooks();
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.title}>Book Management</Text>

        <View style={styles.card}>
          <TextInput placeholder="Title" style={styles.input} value={title} onChangeText={setTitle} />
          <TextInput placeholder="Author" style={styles.input} value={author} onChangeText={setAuthor} />
          <TextInput placeholder="Category" style={styles.input} value={category} onChangeText={setCategory} />

          <TouchableOpacity style={styles.primaryBtn} onPress={addBook}>
            <Text style={styles.primaryBtnText}>Add Book</Text>
          </TouchableOpacity>
        </View>

        {books.map((b) => (
          <View key={b.book_id} style={styles.card}>
            <Text style={{ fontWeight: "700" }}>{b.title}</Text>
            <Text>{b.author}</Text>
            <Text style={{ color: COLORS.muted }}>{b.category} • {b.status}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}


/* -------------------- Member Management -------------------- */

import { Picker } from "@react-native-picker/picker";

function ManageMembersScreen() {
  const [members, setMembers] = React.useState([]);

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("123456");
  const [role, setRole] = React.useState("student");
  const [department, setDepartment] = React.useState("");
  const [genre, setGenre] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [address, setAddress] = React.useState("");

  React.useEffect(() => {
    fetchMembers();
  }, []);

  async function fetchMembers() {
    const { data, error } = await supabase.from("members").select("*");
    if (!error) setMembers(data);
  }

  async function addMember() {
    if (!name || !email || !password)
      return Alert.alert("Error", "Required fields missing");

    const { error } = await supabase.from("members").insert([
      {
        name,
        email,
        password,
        role,
        department,
        favorite_genre: genre,
        phone,
        address,
      },
    ]);

    if (error) Alert.alert("Error", error.message);
    else {
      fetchMembers();
      setName(""); setEmail(""); setDepartment("");
      setGenre(""); setPhone(""); setAddress("");
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.title}>Member Management</Text>

        <View style={styles.card}>
          <TextInput placeholder="Name" style={styles.input} value={name} onChangeText={setName} />
          <TextInput placeholder="Email" style={styles.input} value={email} onChangeText={setEmail} />
          <TextInput placeholder="Default Password" style={styles.input} value={password} onChangeText={setPassword} />

          <Picker selectedValue={role} onValueChange={setRole}>
            <Picker.Item label="Student" value="student" />
            <Picker.Item label="Faculty" value="faculty" />
            <Picker.Item label="Librarian" value="librarian" />
          </Picker>

          <TextInput placeholder="Department" style={styles.input} value={department} onChangeText={setDepartment} />
          <TextInput placeholder="Favorite Genre" style={styles.input} value={genre} onChangeText={setGenre} />
          <TextInput placeholder="Phone" style={styles.input} value={phone} onChangeText={setPhone} />
          <TextInput placeholder="Address" style={styles.input} value={address} onChangeText={setAddress} />

          <TouchableOpacity style={styles.primaryBtn} onPress={addMember}>
            <Text style={styles.primaryBtnText}>Add Member</Text>
          </TouchableOpacity>
        </View>

        {members.map((m) => (
          <View key={m.member_id} style={styles.card}>
            <Text style={{ fontWeight: "700" }}>{m.name}</Text>
            <Text>{m.email}</Text>
            <Text>{m.role} • {m.department}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}



/* -------------------- Issue/Return Requests -------------------- */

function IssueReturnScreen() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('requests')
        .select(`
          *,
          members (name, role, department),
          books (title, author)
        `)
        .eq('status', 'pending');

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error("Fetch Error:", error.message);
    } finally {
      setLoading(false);
    }
  }

  // 🔥 GLOBAL PRIORITY SORTING logic
  const sortedRequests = [...requests].sort((a, b) => {
    // 1. Priority: Role (Faculty always comes before Student)
    const roleA = a.members?.role?.toLowerCase();
    const roleB = b.members?.role?.toLowerCase();

    if (roleA === 'faculty' && roleB !== 'faculty') return -1;
    if (roleA !== 'faculty' && roleB === 'faculty') return 1;

    // 2. Secondary: Date (Oldest request first within the same role category)
    return new Date(a.created_at) - new Date(b.created_at);
  });

  async function handleApprove(req) {
    try {
      // Step 1: Record the issue in issued_books table
      await supabase.from('issued_books').insert([{
        member_id: req.member_id,
        book_id: req.book_id,
        status: 'issued',
        due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
      }]);

      // Step 2: Update the Book status
      await supabase.from('books').update({ status: 'issued' }).eq('book_id', req.book_id);

      // Step 3: AUTO-DELETE all requests for this book (Requirement satisfied)
      const { error: delError } = await supabase
        .from('requests')
        .delete()
        .eq('book_id', req.book_id);

      if (delError) throw delError;

      Alert.alert("Approved", `Book issued to ${req.members.name}. All other requests for this book have been removed.`);
      fetchRequests(); // Refresh list
    } catch (err) {
      Alert.alert("Transaction Error", err.message);
    }
  }

  async function handleReject(request_id) {
    // Simply delete the specific request
    const { error } = await supabase.from('requests').delete().eq('request_id', request_id);
    if (!error) {
      Alert.alert("Removed", "Request deleted.");
      fetchRequests();
    }
  }

  if (loading) return (
    <View style={styles.center}><ActivityIndicator size="large" color={COLORS.secondary} /></View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.header}>Request Queue</Text>
        <Text style={styles.subHeader}>Priority: Faculty requests are locked to the top</Text>

        {sortedRequests.map((item) => {
          const isFaculty = item.members?.role?.toLowerCase() === 'faculty';
          
          return (
            <View key={item.request_id} style={[
              styles.card, 
              isFaculty && styles.facultyCard // Lab 12 Stroke logic
            ]}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bookTitle}>{item.books?.title}</Text>
                  <Text style={styles.memberInfo}>By: {item.members?.name}</Text>
                </View>
                {isFaculty && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>FACULTY</Text>
                  </View>
                )}
              </View>

              <View style={styles.divider} />
              
              <Text style={styles.deptText}>Dept: {item.members?.department || "N/A"}</Text>

              <View style={styles.actions}>
                <TouchableOpacity style={[styles.btn, styles.approveBtn]} onPress={() => handleApprove(item)}>
                  <Text style={styles.btnText}>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, styles.rejectBtn]} onPress={() => handleReject(item.request_id)}>
                  <Text style={styles.btnText}>Reject</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {sortedRequests.length === 0 && <Text style={styles.empty}>No pending requests.</Text>}
      </ScrollView>
    </SafeAreaView>
  );
}

/* -------------------- Book Recommendations -------------------- */
function RecommendationsScreen() {
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  async function fetchRecommendations() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("book_recommendations")
        .select(`
          id,
          title,
          author,
          reason,
          created_at,
          members (
            name,
            role,
            department
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRecs(data || []);
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  }

  // New function to handle the recommendation removal
  async function handleBookAdded(recommendationId) {
    try {
      const { error } = await supabase
        .from("book_recommendations")
        .delete()
        .eq("id", recommendationId);

      if (error) throw error;

      Alert.alert("Success", "Book marked as added and recommendation removed.");
      fetchRecommendations(); // Refresh the list
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.dark2} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.title}>Book Recommendations</Text>

        {recs.length === 0 && (
          <Text style={{ color: COLORS.muted, marginTop: 20 }}>
            No recommendations yet
          </Text>
        )}

        {recs.map((r) => {
          const isFaculty = r.members?.role === "faculty";

          return (
            <View
              key={r.id}
              style={[
                styles.card,
                isFaculty && { borderLeftWidth: 5, borderLeftColor: COLORS.accent2 }
              ]}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: "700" }}>{r.title}</Text>
                  <Text style={{ color: COLORS.muted }}>{r.author}</Text>
                </View>
                {isFaculty && (
                   <View style={styles.badge}>
                    <Text style={styles.badgeText}>FACULTY</Text>
                  </View>
                )}
              </View>

              <View style={{ marginVertical: 8 }}>
                <Text>{r.reason}</Text>
              </View>

              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 12, color: COLORS.muted }}>
                  Recommended by: {r.members?.name || "Unknown"} ({r.members?.department || "N/A"})
                </Text>
              </View>

              {/* Added Button: Book Added */}
              <TouchableOpacity 
                style={styles.addedBtn} 
                onPress={() => handleBookAdded(r.id)}
              >
                <Text style={styles.btnText}>Book Added</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

import AsyncStorage from "@react-native-async-storage/async-storage";

function ProfileScreen({ navigation }) {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [memberId, setMemberId] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const stored = await AsyncStorage.getItem("user");
    if (stored) {
      const user = JSON.parse(stored);
      setMemberId(user.id);
      
      const { data, error } = await supabase
        .from("members")
        .select("name, email")
        .eq("member_id", user.id)
        .single();

      if (!error && data) {
        setName(data.name);
        setEmail(data.email);
      }
    }
  }

  // HCI LAB 10: Updating the core Smart Object (Member Record)
  async function onSave() {
    if (!name) return Alert.alert("Error", "Name is required");
    setLoading(true);
    
    const { error } = await supabase
      .from("members")
      .update({ name })
      .eq("member_id", memberId);

    setLoading(false);
    if (error) Alert.alert("Error", error.message);
    else Alert.alert("Success", "Librarian profile updated.");
  }

  async function onDelete() {
    Alert.alert("Confirm Deletion", "This will permanently remove your librarian account.", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Delete", 
        style: "destructive", 
        onPress: async () => {
          const { error } = await supabase.from("members").delete().eq("member_id", memberId);
          if (!error) {
            await AsyncStorage.removeItem("user");
            navigation.replace("Login");
          } else {
            Alert.alert("Error", error.message);
          }
        } 
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.title}>Librarian Settings</Text>
        <View style={styles.card}>
          <Text style={styles.characterLabel}>Full Name</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} />
          
          <Text style={styles.characterLabel}>Email (Read-Only)</Text>
          <TextInput style={[styles.input, styles.readOnlyInput]} value={email} editable={false} />

          {/* LAB 12: Action Buttons with Depth and Strokes */}
          <TouchableOpacity style={styles.saveBtnShadow} onPress={onSave} disabled={loading}>
            <Text style={styles.btnText}>{loading ? "Saving..." : "Save Changes"}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteBtnStroke} onPress={onDelete}>
            <Text style={styles.deleteBtnText}>Delete Account</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.logoutBtnDepth} onPress={() => navigation.replace("Login")}>
            <Text style={styles.btnText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* -------------------- Navigator -------------------- */
export default function LibrarianTabNavigator() {
  const Tabs = createBottomTabNavigator();
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => (
          <MaterialIcons
            name={
              route.name === "Home"
                ? "dashboard"
                : route.name === "ManageBooks"
                ? "menu-book"
                : route.name === "ManageMembers"
                ? "people"
                : route.name === "IssueReturn"
                ? "assignment-return"
                : "person"
            }
            size={size}
            color={color}
          />
        ),
        tabBarActiveTintColor: COLORS.dark2,
        tabBarInactiveTintColor: COLORS.muted,
      })}
    >
      <Tabs.Screen name="Home" component={LibrarianHome} />
      <Tabs.Screen name="ManageBooks" component={ManageBooksScreen} options={{ title: "Book Mgmt" }} />
      <Tabs.Screen name="ManageMembers" component={ManageMembersScreen} options={{ title: "Member Mgmt" }} />
      <Tabs.Screen name="IssueReturn" component={IssueReturnScreen} options={{ title: "Requests" }} />
       <Tabs.Screen
    name="Recommendations"
    component={RecommendationsScreen}
    options={{ title: "Recommendations" }}
  />
      <Tabs.Screen name="Profile" component={ProfileScreen} />
    </Tabs.Navigator>
  );
}

/* -------------------- Styles -------------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  title: { fontSize: 22, fontWeight: "700", color: COLORS.dark, marginTop: 4 },
  statCard: { flex: 1, backgroundColor: COLORS.card, marginHorizontal: 6, padding: 12, borderRadius: 12, alignItems: "center" },
  statTitle: { color: COLORS.dark2, fontWeight: "700" },
  statValue: { fontSize: 18, fontWeight: "800", marginTop: 6 },
  input: { backgroundColor: COLORS.card, padding: 12, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: "#e6e6e6" },
  primaryBtn: { marginTop: 12, backgroundColor: COLORS.dark2, paddingVertical: 12, paddingHorizontal: 18, borderRadius: 10, alignItems: "center" },
  primaryBtnText: { color: "#fff", fontWeight: "700" },
  header: { fontSize: 24, fontWeight: "800", color: COLORS.dark },
  subHeader: { color: COLORS.muted, marginBottom: 20 },
  card: { backgroundColor: COLORS.card, borderRadius: 12, padding: 16, marginBottom: 15, borderWidth: 1, borderColor: '#eee' },
  facultyCard: { borderColor: COLORS.accent2, borderLeftWidth: 6 },
  bookTitle: { fontSize: 17, fontWeight: "700" },
  badge: { backgroundColor: COLORS.accent2, padding: 4, borderRadius: 4 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '900' },
  divider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 15 },
  deptText: { color: COLORS.muted, fontSize: 12 },
  btn: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center' },
  approveBtn: { backgroundColor: COLORS.dark2 },
  rejectBtn: { backgroundColor: '#e74c3c' },
  btnText: { color: '#fff', fontWeight: '700' },
  
  // --- LAB 11: Character Panel Styling ---
  characterLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.dark2,
    marginBottom: 5,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  readOnlyInput: {
    backgroundColor: '#f1f1f1',
    color: COLORS.muted,
  },

  // --- LAB 12: Drop Shadow & Stroke Effects ---
  saveBtnShadow: {
    backgroundColor: COLORS.dark2,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    // Android Shadow
    elevation: 4,
    // iOS Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  deleteBtnStroke: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 15,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: "#c0392b", // Red Stroke for Warning
  },
  deleteBtnText: {
    color: "#c0392b",
    fontWeight: "800",
  },

  addedBtn: {
    backgroundColor: COLORS.accent2,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    // Lab 12: Stroke and Shadow for hierarchy
    borderWidth: 1,
    borderColor: '#0d9488', 
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  
  logoutBtnDepth: {
    backgroundColor: COLORS.accent,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    // Simulate inner shadow/depth with border bottom
    borderBottomWidth: 4,
    borderBottomColor: "#8a7e10", 
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" }
});