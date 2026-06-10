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
import { MaterialIcons, Feather } from "@expo/vector-icons";
import { supabase } from "./supabase";
import { Picker } from "@react-native-picker/picker";

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

const StudentTabs = createBottomTabNavigator();

export default function StudentTabNavigator({ route }) {
  const { email } = route.params;

  return (
    <StudentTabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarIcon: ({ color, size }) => {
          let name;
          if (route.name === "Home") name = "dashboard";
          if (route.name === "Browse") name = "search";
          if (route.name === "MyBooks") name = "book";
          if (route.name === "Request") name = "library-add";
          if (route.name === "Return") name = "assignment-return";
          if (route.name === "Profile") name = "person";
          return <MaterialIcons name={name} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.dark2,
        tabBarInactiveTintColor: COLORS.muted,
      })}
    >
      <StudentTabs.Screen name="Home">
        {(props) => <StudentDashboardScreen {...props} email={email} />}
      </StudentTabs.Screen>
      <StudentTabs.Screen name="Browse">
        {(props) => <BrowseBooksScreen {...props} />}
      </StudentTabs.Screen>
      <StudentTabs.Screen name="MyBooks">
        {(props) => <MyBooksScreen {...props} email={email} />}
      </StudentTabs.Screen>
      <StudentTabs.Screen name="Request">
        {(props) => <RequestBookScreen {...props} email={email} />}
      </StudentTabs.Screen>
      <StudentTabs.Screen name="Return">
        {(props) => <ReturnBookScreen {...props} email={email} />}
      </StudentTabs.Screen>
      <StudentTabs.Screen name="Profile">
        {(props) => <ProfileScreen {...props} email={email} />}
      </StudentTabs.Screen>
    </StudentTabs.Navigator>
  );
}

/* =========================
   DASHBOARD
========================= */
function StudentDashboardScreen({ email, navigation }) {
  const quickActions = [
    { title: "Browse Books", icon: "search", color: "#10b981", screen: "Browse" },
    { title: "My Books", icon: "book", color: "#b5a820", screen: "MyBooks" },
    { title: "Request Book", icon: "library-add", color: "#3a5a40", screen: "Request" },
    { title: "Return Book", icon: "assignment-return", color: "#f59e0b", screen: "Return" },
    { title: "Profile", icon: "person", color: "#061d17", screen: "Profile" },
  ];

  const [name, setName] = React.useState("");

  React.useEffect(() => {
    supabase
      .from("members")
      .select("name")
      .eq("email", email)
      .single()
      .then(({ data }) => setName(data?.name));
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={{
          backgroundColor: COLORS.accent2 + "20",
          borderRadius: 12, padding: 16, marginBottom: 20
        }}>
          <Text style={{ fontSize: 24, fontWeight: "700", color: COLORS.dark }}>Welcome, {name} 👋</Text>
          <Text style={{ color: COLORS.muted, marginTop: 4 }}>Here's a quick overview of your library activity</Text>
        </View>

        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 20 }}>
          <View style={[styles.statCard]}>
            <Text style={styles.statTitle}>📚 Books Borrowed</Text>
            <Text style={styles.statValue}>3</Text>
          </View>
          <View style={[styles.statCard]}>
            <Text style={styles.statTitle}>⏳ Overdue</Text>
            <Text style={styles.statValue}>1</Text>
          </View>
          <View style={[styles.statCard]}>
            <Text style={styles.statTitle}>💰 Fine</Text>
            <Text style={styles.statValue}>Rs. 200</Text>
          </View>
        </View>

        <Text style={{ fontSize: 18, fontWeight: "700", color: COLORS.dark, marginBottom: 12 }}>Quick Actions</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={{
                width: "48%",
                backgroundColor: action.color + "30",
                padding: 16,
                borderRadius: 12,
                marginBottom: 12
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

/* =========================
   BROWSE BOOKS
========================= */
function BrowseBooksScreen() {
  const [books, setBooks] = React.useState([]);
  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState("");

  React.useEffect(() => {
    supabase
      .from("books")
      .select("*")
      .eq("status", "Available")
      .then(({ data }) => setBooks(data || []));
  }, []);

  const filtered = books.filter((b) => {
    const matchesSearch = b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !category || b.category.toLowerCase() === category.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.title}>Browse Books</Text>
        <View style={{ marginVertical: 12 }}>
          <View style={styles.searchBox}>
            <Feather name="search" size={18} color={COLORS.muted} style={{ marginRight: 8 }} />
            <TextInput placeholder="Search by title or author" style={{ flex: 1 }} value={search} onChangeText={setSearch} />
          </View>
          <TextInput placeholder="Category (optional)" style={[styles.input, { marginTop: 10 }]} value={category} onChangeText={setCategory} />
        </View>

        {filtered.map((b) => (
          <View key={b.book_id} style={styles.bookCard}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: "700" }}>{b.title}</Text>
              <Text style={{ color: COLORS.muted }}>{b.author} • {b.category}</Text>
            </View>
            <Text style={[styles.badge, { backgroundColor: COLORS.accent2 }]}>{b.status}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

/* =========================
   MY BOOKS
========================= */
function MyBooksScreen({ email }) {
  const [books, setBooks] = React.useState([]);

  React.useEffect(() => {
    async function load() {
      const { data: member } = await supabase
        .from("members")
        .select("member_id")
        .eq("email", email)
        .single();

      if (!member) return;

      const { data } = await supabase
        .from("issued_books")
        .select("issue_id, issue_date, due_date, status, books (title, author)")
        .eq("member_id", member.member_id);

      setBooks(data || []);
    }
    load();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={[styles.title, { marginBottom: 16 }]}>My Books</Text>
        {books.map((b) => (
          <View key={b.issue_id} style={[styles.card, { backgroundColor: COLORS.accent2 + "10", padding: 16 }]}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: "700", fontSize: 16, color: COLORS.dark }}>{b.books.title}</Text>
              <Text style={{ color: COLORS.muted }}>{b.books.author}</Text>
              <Text style={{ color: COLORS.muted, fontSize: 12 }}>Due: {b.due_date || "-"}</Text>
              <Text style={{
                marginTop: 6,
                alignSelf: "flex-start",
                color: "#fff",
                backgroundColor: b.status === "overdue" ? "#f87171" : "#10b981",
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 12,
                fontWeight: "700",
                fontSize: 12
              }}>
                {b.status.toUpperCase()}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

/* =========================
   REQUEST BOOK
========================= */
function RequestBookScreen({ email }) {
  const [categories, setCategories] = React.useState([]);
  const [requests, setRequests] = React.useState([]);
  const [title, setTitle] = React.useState("");
  const [author, setAuthor] = React.useState("");
  const [category, setCategory] = React.useState("");

  React.useEffect(() => {
    supabase
      .from("books")
      .select("category")
      .then(({ data }) => setCategories([...new Set((data || []).map((c) => c.category))]));
  }, []);

  React.useEffect(() => {
    async function loadRequests() {
      const { data: member } = await supabase.from("members").select("member_id").eq("email", email).single();
      if (!member) return;
      const { data } = await supabase.from("requests").select("*").eq("member_id", member.member_id);
      setRequests(data || []);
    }
    loadRequests();
  }, []);

  async function submitRequest() {
    if (!title || !author || !category) return Alert.alert("Please fill all fields");

    const { data: member } = await supabase.from("members").select("member_id").eq("email", email).single();
    if (!member) return;

    const { data: book } = await supabase
      .from("books")
      .select("*")
      .eq("title", title)
      .eq("author", author)
      .eq("category", category)
      .eq("status", "Available")
      .single();

    if (!book) return Alert.alert("Book not found or not available");

    // Insert into requests
    await supabase.from("requests").insert({
      member_id: member.member_id,
      book_id: book.book_id,
      book_title: book.title,
      author: book.author,
      category: book.category,
      status: "pending",
      request_type: "issue",
      priority: "normal",
    });

    // Insert into issued_books
    await supabase.from("issued_books").insert({
      member_id: member.member_id,
      book_id: book.book_id,
      status: "overdue", // immediately appears in return dropdown
      issue_date: new Date(),
      due_date: new Date(Date.now() + 7*24*60*60*1000),
    });

    // Update book status
    await supabase.from("books").update({ status: "Requested" }).eq("book_id", book.book_id);

    Alert.alert("Success", "Book requested successfully");

    setRequests(prev => [
      {
        request_id: Date.now(),
        book_title: book.title,
        author: book.author,
        category: book.category,
        status: "pending",
      },
      ...prev
    ]);

    setTitle("");
    setAuthor("");
    setCategory("");
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={[styles.title, { marginBottom: 12 }]}>Request a Book</Text>
        <View style={[styles.card, { padding: 16 }]}>
          <TextInput placeholder="Book Title" style={styles.input} value={title} onChangeText={setTitle} />
          <TextInput placeholder="Author" style={styles.input} value={author} onChangeText={setAuthor} />
          <Picker selectedValue={category} onValueChange={setCategory} style={{ marginVertical: 8 }}>
            <Picker.Item label="Select Category" value="" />
            {categories.map((c) => <Picker.Item key={c} label={c} value={c} />)}
          </Picker>
          <TouchableOpacity style={[styles.primaryBtn, { alignSelf: "flex-start" }]} onPress={submitRequest}>
            <Text style={styles.primaryBtnText}>Submit Request</Text>
          </TouchableOpacity>
        </View>

        <Text style={{ marginTop: 20, marginBottom: 8, fontWeight: "700", color: COLORS.dark }}>My Previous Requests</Text>
        {requests.map((r) => (
          <View key={r.request_id} style={[styles.card, { flexDirection: "row", justifyContent: "space-between", padding: 12, backgroundColor: COLORS.accent + "10" }]}>
            <View>
              <Text style={{ fontWeight: "700" }}>{r.book_title}</Text>
              <Text style={{ color: COLORS.muted }}>{r.author} • {r.category}</Text>
            </View>
            <Text style={[styles.badge, r.status === "approved" ? { backgroundColor: COLORS.accent2 } : { backgroundColor: "#f59e0b" }]}>{r.status}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

/* =========================
   RETURN BOOK
========================= */
function ReturnBookScreen({ email }) {
  const [overdueBooks, setOverdueBooks] = React.useState([]);
  const [selectedBook, setSelectedBook] = React.useState("");
  const [returnHistory, setReturnHistory] = React.useState([]);

  React.useEffect(() => {
    async function load() {
      const { data: member } = await supabase.from("members").select("member_id").eq("email", email).single();
      if (!member) return;

      const { data: overdue } = await supabase
        .from("issued_books")
        .select("issue_id, books (title, author)")
        .eq("member_id", member.member_id)
        .eq("status", "overdue");

      const { data: returned } = await supabase
        .from("issued_books")
        .select("issue_id, books (title, author), return_date")
        .eq("member_id", member.member_id)
        .eq("status", "returned");

      setOverdueBooks(overdue || []);
      setReturnHistory(returned || []);
    }
    load();
  }, [email]);

  async function handleReturn() {
    if (!selectedBook) return Alert.alert("Please select a book");

    const { data: member } = await supabase.from("members").select("member_id").eq("email", email).single();
    if (!member) return;

    const bookToReturn = overdueBooks.find(b => b.books.title === selectedBook);
    if (!bookToReturn) return;

    await supabase.from("issued_books").update({ status: "returned", return_date: new Date() }).eq("issue_id", bookToReturn.issue_id);
    await supabase.from("books").update({ status: "Available" }).eq("book_id", bookToReturn.book_id);

    Alert.alert("Success", "Book returned successfully");

    setOverdueBooks(prev => prev.filter(b => b.issue_id !== bookToReturn.issue_id));
    setReturnHistory(prev => [...prev, { ...bookToReturn, return_date: new Date() }]);
    setSelectedBook("");
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={[styles.title, { marginBottom: 12 }]}>Return Book</Text>

        <View style={[styles.card, { padding: 16 }]}>
          <Text style={{ fontWeight: "700", marginBottom: 8 }}>Book Title</Text>
          <Picker selectedValue={selectedBook} onValueChange={setSelectedBook}>
            <Picker.Item label="Select Book" value="" />
            {overdueBooks.map(b => <Picker.Item key={b.issue_id} label={b.books.title} value={b.books.title} />)}
          </Picker>
          <TouchableOpacity style={[styles.primaryBtn, { marginTop: 12 }]} onPress={handleReturn}>
            <Text style={styles.primaryBtnText}>Return Book</Text>
          </TouchableOpacity>
        </View>

        <Text style={{ fontWeight: "700", fontSize: 16, marginTop: 20, marginBottom: 8 }}>Return History</Text>
        {returnHistory.map(b => (
          <View key={b.issue_id} style={[styles.card, { flexDirection: "row", justifyContent: "space-between", padding: 12, backgroundColor: COLORS.accent + "10" }]}>
            <View>
              <Text style={{ fontWeight: "700" }}>{b.books.title}</Text>
              <Text style={{ color: COLORS.muted }}>{b.books.author}</Text>
            </View>
            <Text style={{ fontSize: 12, color: COLORS.dark2 }}>{new Date(b.return_date).toLocaleDateString()}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

/* =========================
   PROFILE
========================= */
function ProfileScreen({ navigation, email }) {
  const [user, setUser] = React.useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
  });

  React.useEffect(() => {
    async function loadProfile() {
      if (!email) return;
      const { data } = await supabase
        .from("members")
        .select("*")
        .eq("email", email)
        .single();
      if (data) setUser(data);
    }
    loadProfile();
  }, [email]);

  async function saveChanges() {
    await supabase.from("members").update({
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      password: user.password
    }).eq("member_id", user.member_id);
    Alert.alert("Success", "Profile updated successfully");
  }

  async function deleteAccount() {
    Alert.alert("Confirm Delete", "Are you sure you want to delete?", [
      { text: "No" },
      {
        text: "Yes",
        onPress: async () => {
          await supabase.from("members").delete().eq("member_id", user.member_id);
          navigation.navigate("Login");
        },
      },
    ]);
  }

  function logout() {
    navigation.navigate("Login");
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={[styles.title, { marginBottom: 12 }]}>Profile</Text>

        {["name", "email", "phone", "address", "password"].map((field) => (
          <TextInput
            key={field}
            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
            style={styles.input}
            value={user[field]}
            onChangeText={(val) => setUser({ ...user, [field]: val })}
            secureTextEntry={field === "password"}
          />
        ))}

        <TouchableOpacity style={styles.primaryBtn} onPress={saveChanges}>
          <Text style={styles.primaryBtnText}>Save Changes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: "#f87171", marginTop: 12 }]}
          onPress={deleteAccount}
        >
          <Text style={styles.primaryBtnText}>Delete Account</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: "#10b981", marginTop: 12 }]}
          onPress={logout}
        >
          <Text style={styles.primaryBtnText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

/* =========================
   STYLES
========================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  title: { fontSize: 22, fontWeight: "700", color: COLORS.dark, marginTop: 4 },
  subtitle: { color: COLORS.muted, marginTop: 6, marginBottom: 10 },

  statCard: { flex: 1, backgroundColor: COLORS.card, marginHorizontal: 6, padding: 12, borderRadius: 12, alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.05, elevation: 2 },
  statTitle: { color: COLORS.dark2, fontWeight: "700" },
  statValue: { fontSize: 18, fontWeight: "800", marginTop: 6 },

  searchBox: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.card, padding: 10, borderRadius: 10, borderWidth: 1, borderColor: "#e6e6e6" },
  bookCard: { flexDirection: "row", backgroundColor: COLORS.card, padding: 12, borderRadius: 10, marginBottom: 10, alignItems: "center" },
  badge: { color: "#fff", fontSize: 12, fontWeight: "700", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },

  card: { backgroundColor: COLORS.card, padding: 12, borderRadius: 12, marginBottom: 12 },
  bookRow: { flexDirection: "row", marginBottom: 12 },
  requestRow: { flexDirection: "row", marginBottom: 12, justifyContent: "space-between", alignItems: "center" },

  input: { backgroundColor: COLORS.card, padding: 12, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: "#e6e6e6" },
  primaryBtn: { marginTop: 12, backgroundColor: COLORS.dark2, paddingVertical: 12, paddingHorizontal: 18, borderRadius: 10, alignItems: "center" },
  primaryBtnText: { color: "#fff", fontWeight: "700" },
});
