import { StyleSheet } from "react-native";
import { COLORS } from "./theme";

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: COLORS.bg },

  splashCard: {
    alignItems: "center",
    padding: 40,
    borderRadius: 14,
    backgroundColor: COLORS.card,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    elevation: 2,
  },

  splashLogo: { fontSize: 36, fontWeight: "800", color: COLORS.dark },
  splashSub: { marginTop: 8, color: COLORS.dark2 },

  title: { fontSize: 22, fontWeight: "700", color: COLORS.dark, marginTop: 4 },
  subtitle: { color: COLORS.muted, marginTop: 6, marginBottom: 10 },

  input: {
    backgroundColor: COLORS.card,
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e6e6e6",
  },

  primaryBtn: {
    marginTop: 12,
    backgroundColor: COLORS.dark2,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
    alignItems: "center",
  },

  primaryBtnText: { color: "#fff", fontWeight: "700" },
});