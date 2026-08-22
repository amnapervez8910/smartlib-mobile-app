import AsyncStorage from "@react-native-async-storage/async-storage";


import * as React from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialIcons } from "@expo/vector-icons";

import { Picker } from "@react-native-picker/picker";

import { supabase } from "./supabase"; 



async function getLoggedInUserId() {
  const stored = await AsyncStorage.getItem("user");
  if (!stored) return null;
  const user = JSON.parse(stored);
  return user.id;
}



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

/* ==================== HOME ==================== */
function FacultyHome({ navigation }) {
  const quickActions = [
    { title: "Issue Books", icon: "library-add", color: "#10b981", screen: "Issue" },
    { title: "Return Books", icon: "assignment-return", color: "#b5a820", screen: "Return" },
    { title: "Recommend Book", icon: "library-books", color: "#3a5a40", screen: "Recommend" },
    { title: "Reports", icon: "assignment", color: "#f59e0b", screen: "Reports" },
    { title: "Profile", icon: "person", color: "#061d17", screen: "Profile" },
  ];

  return ( 
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={styles.welcomeBox}>
          <Text style={styles.welcomeText}>Welcome, Faculty 👋</Text>
          <Text style={styles.muted}>Manage your library activities</Text>
        </View>

        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <View style={styles.grid}>
          {quickActions.map((a, i) => (
            <TouchableOpacity 
              key={i}
              style={[styles.quickCard, { backgroundColor: a.color + "30" }]}
              onPress={() => navigation.navigate(a.screen)}
            >
              <MaterialIcons name={a.icon} size={28} color={a.color} />
              <Text style={styles.quickText}>{a.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ==================== ISSUE ==================== */

function IssueScreen() {
  const [books, setBooks] = React.useState([]);
  const [requestedBooks, setRequestedBooks] = React.useState([]);
  const [bookId, setBookId] = React.useState("");

  React.useEffect(() => {
    fetchBooks();
    fetchMyRequests();
  }, []);

  /* ===== FETCH BOOKS ===== */
  async function fetchBooks() {
    const { data, error } = await supabase
      .from("books")
      .select("*")
      .order("title");

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    setBooks(data || []);
  }

  /* ===== FETCH MY REQUESTS ===== */
  async function fetchMyRequests() {
    const uid = await getLoggedInUserId();
    if (!uid) return;

    const { data, error } = await supabase
      .from("requests")
      .select(`
        request_id,
        book_title,
        author,
        category,
        status,
        created_at
      `)
      .eq("member_id", uid)
      .order("created_at", { ascending: false });

    if (!error) setRequestedBooks(data || []);
  }

  /* ===== REQUEST BOOK ===== */
  async function issueBook() {
    if (!bookId) {
      Alert.alert("Error", "Please select a book");
      return;
    }

    const uid = await getLoggedInUserId();
    if (!uid) {
      Alert.alert("Error", "User not logged in");
      return;
    }

    // get selected book info
    const { data: book, error: bookError } = await supabase
      .from("books")
      .select("title, author, category")
      .eq("book_id", bookId)
      .single();

    if (bookError || !book) {
      Alert.alert("Error", "Book not found");
      return;
    }

    //  INSERT INTO requests 
    const { error } = await supabase.from("requests").insert({
      member_id: uid,
      book_id: bookId,
      book_title: book.title,
      author: book.author,
      category: book.category,
      status: "pending",
      request_type: "issue",
      priority: "higher",
    });

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    Alert.alert("Success", "Book request submitted");
    setBookId("");
    fetchMyRequests();
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.title}>Issue a Book</Text>

        <View style={styles.card}>
          <Picker
            selectedValue={bookId}
            onValueChange={setBookId}
            style={styles.input}
          >
            <Picker.Item label="Select Book Title" value="" />
            {books.map(b => (
              <Picker.Item
                key={b.book_id}
                label={`${b.title} — ${b.author}`}
                value={b.book_id}
              />
            ))}
          </Picker>

          <TouchableOpacity style={styles.primaryBtn} onPress={issueBook}>
            <Text style={styles.primaryBtnText}>Request Book</Text>
          </TouchableOpacity>
        </View>

        <Text style={{ fontWeight: "700", marginBottom: 8 }}>
          My Requested Books
        </Text>

        {requestedBooks.length === 0 && (
          <Text style={{ color: COLORS.muted }}>No requests yet</Text>
        )}

        {requestedBooks.map(r => (
          <View key={r.request_id} style={styles.card}>
            <Text style={{ fontWeight: "700" }}>{r.book_title}</Text>
            <Text style={{ color: COLORS.muted }}>
              {r.author} • {r.category}
            </Text>
            <Text style={{ marginTop: 6, fontWeight: "700", color: "#f59e0b" }}>
              Status: {r.status.toUpperCase()}
            </Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}


/* ==================== RETURN (FIXED) ==================== */
function ReturnScreen() {
  const [myBooks, setMyBooks] = React.useState([]);

  React.useEffect(() => {
    fetchIssuedBooks();
  }, []);

  // ✅ Correct Fetch Function (No comments in query string)
  async function fetchIssuedBooks() {
    const uid = await getLoggedInUserId();
    if (!uid) return;

    const { data, error } = await supabase
      .from("issued_books")
      .select(`
        issue_id,
        issued_at,
        status, 
        return_date,
        book:books!issued_books_book_id_fkey (
          book_id, 
          title,
          author,
          category
        )
      `)
      .eq("member_id", uid)
      // .eq("status", "issued") <--- Correctly commented out to show history
      .order("issued_at", { ascending: false });

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    setMyBooks(data || []);
  }

  async function returnBook(issueId, bookId) {
    try {
      // 1. Mark issue as returned
      const { error: issueError } = await supabase
        .from("issued_books")
        .update({
          status: "returned",
          return_date: new Date().toISOString(),
        })
        .eq("issue_id", issueId);

      if (issueError) throw issueError;

      // 2. Mark book as Available
      const { error: bookError } = await supabase
        .from("books")
        .update({ status: "Available" })
        .eq("book_id", bookId);

      if (bookError) throw bookError;

      Alert.alert("Success", "Book returned successfully!");
      fetchIssuedBooks(); // Refresh list immediately

    } catch (error) {
      Alert.alert("Error", error.message);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.title}>Return Book</Text>

        {myBooks.length === 0 && (
          <Text style={{ color: COLORS.muted }}>
            No issued books found.
          </Text>
        )}

        {myBooks.map(b => (
          <View key={b.issue_id} style={[
            styles.card,
            // Optional: Dim the card if returned
            b.status === "returned" && { backgroundColor: "#f3f4f6", opacity: 0.8 }
          ]}>
            <Text style={{ fontWeight: "700", fontSize: 16 }}>
              {b.book?.title || "Unknown Title"}
            </Text>
            <Text style={{ color: COLORS.muted, marginBottom: 8 }}>
              {b.book?.author} • {b.book?.category}
            </Text>
            
            {/* Show Status Label */}
            {b.status === "issued" ? (
              <View>
                <Text style={{ color: "#d97706", fontWeight: "bold", marginBottom: 5 }}>
                  Status: ISSUED
                </Text>
                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={() => returnBook(b.issue_id, b.book?.book_id)}
                >
                  <Text style={styles.primaryBtnText}>Return Book</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <Text style={{ color: "#10b981", fontWeight: "bold", marginTop: 4 }}>
                  ✅ Returned
                </Text>
                <Text style={{ fontSize: 12, color: COLORS.muted }}>
                   {b.return_date ? new Date(b.return_date).toDateString() : ""}
                </Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
/* ==================== RECOMMEND SCREEN ==================== */
function RecommendScreen() {
  const [title, setTitle] = React.useState("");
  const [author, setAuthor] = React.useState("");
  const [reason, setReason] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function submitRecommendation() {
    if (!title || !author) {
      Alert.alert("Error", "Please enter at least the Book Title and Author.");
      return;
    }

    setLoading(true);
    const uid = await getLoggedInUserId();
    
    if (!uid) {
      setLoading(false);
      Alert.alert("Error", "User session not found. Please relogin.");
      return;
    }

    // Insert into 'book_recommendations' matching your DB schema
    const { error } = await supabase.from("book_recommendations").insert({
      member_id: uid,
      title: title,
      author: author,
      reason: reason,
    });

    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert("Success", "Book recommendation submitted successfully!");
      // Clear fields
      setTitle("");
      setAuthor("");
      setReason("");
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.title}>Recommend a Book</Text>
        <Text style={{ marginBottom: 10, color: COLORS.muted }}>
            Suggest books you would like the library to acquire.
        </Text>

        <View style={styles.card}>
          <Text style={{ fontWeight: "700" }}>Book Title</Text>
          <TextInput 
            style={styles.input} 
            placeholder="e.g. Clean Code"
            value={title} 
            onChangeText={setTitle} 
          />

          <Text style={{ fontWeight: "700" }}>Author</Text>
          <TextInput 
            style={styles.input} 
            placeholder="e.g. Robert C. Martin"
            value={author} 
            onChangeText={setAuthor} 
          />

          <Text style={{ fontWeight: "700" }}>Reason (Optional)</Text>
          <TextInput 
            style={[styles.input, { height: 80, textAlignVertical: 'top' }]} 
            placeholder="Why is this book needed?"
            multiline={true}
            numberOfLines={3}
            value={reason} 
            onChangeText={setReason} 
          />

          <TouchableOpacity 
            style={[styles.primaryBtn, { opacity: loading ? 0.7 : 1 }]} 
            onPress={submitRecommendation}
            disabled={loading}
          >
            <Text style={styles.primaryBtnText}>
                {loading ? "Submitting..." : "Submit Recommendation"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
/* ==================== REPORTS ==================== */
function ReportsScreen() {
  const [issued, setIssued] = React.useState(0);
  const [returned, setReturned] = React.useState(0);
  const [recommended, setRecommended] = React.useState(0);

  React.useEffect(() => {
    fetchReports();
  }, []);

  async function fetchReports() {
    const uid = await getLoggedInUserId();  // Make sure this is fetching the correct user ID
    if (!uid) {
      Alert.alert("Error", "User not logged in");
      return;
    }

    try {
      // Total ISSUED Books
      const { count: issuedCount, error: issuedError } = await supabase
        .from("issued_books")
        .select("*", { count: "exact", head: true })
        .eq("member_id", uid)
        .eq("status", "issued");

      if (issuedError) throw new Error(issuedError.message);

      // Total RETURNED Books
      const { count: returnedCount, error: returnedError } = await supabase
        .from("issued_books")
        .select("*", { count: "exact", head: true })
        .eq("member_id", uid)
        .eq("status", "returned");

      if (returnedError) throw new Error(returnedError.message);

      // Total RECOMMENDATIONS
      const { count: recommendedCount, error: recommendedError } = await supabase
        .from("book_recommendations")
        .select("*", { count: "exact", head: true })
        .eq("member_id", uid);

      if (recommendedError) throw new Error(recommendedError.message);

      // Set state
      setIssued(issuedCount || 0);
      setReturned(returnedCount || 0);
      setRecommended(recommendedCount || 0);
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  }

  const max = Math.max(issued, returned, recommended, 1);

  const Bar = ({ label, value }) => (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ fontWeight: "700" }}>
        {label}: {value}
      </Text>
      <View style={styles.barBg}>
        <View
          style={[
            styles.barFill,
            { width: `${(value / max) * 100}%` },
          ]}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.title}>Library Reports</Text>

        <View style={styles.card}>
          <Bar label="Issued Books" value={issued} />
          <Bar label="Returned Books" value={returned} />
          <Bar label="Recommended Books" value={recommended} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


/* ==================== PROFILE ==================== */
function ProfileScreen({ navigation }) {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [department, setDepartment] = React.useState("");
  const [genre, setGenre] = React.useState("");
  const [memberId, setMemberId] = React.useState(null);

  React.useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const stored = await AsyncStorage.getItem("user");
      if (!stored) return;

      const user = JSON.parse(stored);
      setMemberId(user.id);

      const { data, error } = await supabase
        .from("members")
        .select("name, email, department, favorite_genre")
        .eq("member_id", user.id)
        .single();

      if (error) {
        Alert.alert("Error", error.message);
        return;
      }
 
      setName(data.name || "");
      setEmail(data.email || "");
      setDepartment(data.department || "");
      setGenre(data.favorite_genre || "");
    } catch (e) {
      console.log(e);
    }
  }
 
  async function onSave() {
    if (!memberId) return;

    const { error } = await supabase
      .from("members")
      .update({
        name,
        department,
        favorite_genre: genre,
      })
      .eq("member_id", memberId);

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert("Success", "Profile updated");
    }
  }

  async function onDelete() {
  if (!memberId) {
    Alert.alert("Error", "User not found");
    return;
  }

  Alert.alert(
    "Confirm",
    "Delete your account permanently? This action cannot be undone.",
    [
      { text: "Cancel" },
      {
        text: "Delete",
        style: "destructive",
        async onPress() { 
          try {
            // 1️⃣ Delete related data first (IMPORTANT)
            await supabase.from("issued_books").delete().eq("member_id", memberId);
            await supabase.from("book_recommendations").delete().eq("member_id", memberId);

            // 2️⃣ Delete member profile
            const { error } = await supabase
              .from("members")
              .delete()
              .eq("member_id", memberId);

            if (error) {
              Alert.alert("Error", error.message);
              return;
            }

            // 3️⃣ Clear local session
            await AsyncStorage.removeItem("user");

            Alert.alert("Account Deleted", "Your account has been deleted");
            navigation.replace("Login");
          } catch (e) {
            Alert.alert("Error", "Something went wrong");
            console.log(e);
          }
        },
      },
    ]
  );
}


  async function logout() {
    await AsyncStorage.removeItem("user");
    navigation.replace("Login");
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.title}>My Profile</Text>

        <View style={styles.card}>
          <Text style={{ fontWeight: "700" }}>Full Name</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} />

          <Text style={{ fontWeight: "700" }}>Email</Text>
          <TextInput style={styles.input} value={email} editable={false} />

          <Text style={{ fontWeight: "700" }}>Department</Text>
          <TextInput
            style={styles.input}
            value={department}
            onChangeText={setDepartment}
          />

          <Text style={{ fontWeight: "700" }}>Favorite Genre</Text>
          <TextInput
            style={styles.input}
            value={genre}
            onChangeText={setGenre}
          />

          <TouchableOpacity
            style={[styles.primaryBtn, { marginTop: 10 }]}
            onPress={onSave}
          >
            <Text style={styles.primaryBtnText}>Save Changes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.deleteBtn, { marginTop: 12 }]}
            onPress={onDelete}
          >
            <Text style={{ color: "#fff" }}>Delete Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.logoutBtn, { marginTop: 18 }]}
            onPress={logout}
          >
            <Text style={{ color: "#fff" }}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView> 
    </SafeAreaView>
  );
}

/* ==================== TABS ==================== */
export default function FacultyTabNavigator() {
  const Tabs = createBottomTabNavigator();

  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let icon =
            route.name === "Home" ? "dashboard" :
            route.name === "Issue" ? "library-add" :
            route.name === "Return" ? "assignment-return" :
            route.name === "Recommend" ? "library-books" :
            route.name === "Reports" ? "assignment" :
            "person";

          return <MaterialIcons name={icon} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.dark2,
        tabBarInactiveTintColor: COLORS.muted,
      })}
    >
      <Tabs.Screen name="Home" component={FacultyHome} />
      <Tabs.Screen name="Issue" component={IssueScreen} />
      <Tabs.Screen name="Return" component={ReturnScreen} />
      <Tabs.Screen name="Recommend" component={RecommendScreen} />
      <Tabs.Screen name="Reports" component={ReportsScreen} />
      <Tabs.Screen name="Profile" component={ProfileScreen} />
    </Tabs.Navigator>
  );
}

/* ==================== STYLES ==================== */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  title: { fontSize: 22, fontWeight: "700", color: COLORS.dark, marginBottom: 12 },
  card: { backgroundColor: COLORS.card, padding: 14, borderRadius: 12, marginBottom: 14 },
  input: { borderWidth: 1, borderColor: "#ddd", padding: 12, borderRadius: 10, marginBottom: 10 },
  primaryBtn: { backgroundColor: COLORS.dark2, padding: 12, borderRadius: 10, alignItems: "center", marginTop: 8 },
  primaryBtnText: { color: "#fff", fontWeight: "700" },
  welcomeBox: { backgroundColor: COLORS.accent2 + "20", padding: 16, borderRadius: 12, marginBottom: 20 },
  welcomeText: { fontSize: 24, fontWeight: "700", color: COLORS.dark },
  muted: { color: COLORS.muted },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 10 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  quickCard: { width: "48%", padding: 16, borderRadius: 12, marginBottom: 12 },
  quickText: { marginTop: 8, fontWeight: "700" },
 barBg: {
  height: 10,
  backgroundColor: "#e5e7eb",
  borderRadius: 10,
  marginTop: 6,
},
barFill: {
  height: 10,
  backgroundColor: "#3a5a40",
  borderRadius: 10, 
},

  deleteBtn: {
    backgroundColor: "#c0392b",  
    padding: 12,
    borderRadius: 10,
    alignItems: "center", 
  },
  logoutBtn: {
    backgroundColor: COLORS.accent,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
});