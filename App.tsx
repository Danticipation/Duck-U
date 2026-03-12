import React from "react";
import { SafeAreaView, Text, StyleSheet } from "react-native";

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Duck U</Text>
      <Text style={styles.subtitle}>Expo app is running 🎉</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0f172a",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fbbf24",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#e5e7eb",
  },
});

