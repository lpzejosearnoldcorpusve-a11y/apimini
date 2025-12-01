"use client"

import { LinearGradient } from "expo-linear-gradient"
import { Bus, Search } from "lucide-react-native"
import React from "react"
import { Platform, StyleSheet, Text, TextInput, View } from "react-native"

interface MinibusHeaderProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  totalLines: number
}

export function MinibusHeader({ searchQuery, onSearchChange, totalLines }: MinibusHeaderProps) {
  return (
    <LinearGradient
      colors={["#0891b2", "#0d9488"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.headerContent}>
        <View style={styles.titleRow}>
          <View style={styles.iconContainer}>
            <Bus size={22} color="#ffffff" />
          </View>
          <View>
            <Text style={styles.title}>Minibuses</Text>
            <Text style={styles.subtitle}>{totalLines} líneas disponibles</Text>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchIcon}>
            <Search size={18} color="rgba(255, 255, 255, 0.6)" />
          </View>
          <TextInput
            placeholder="Buscar línea, sindicato o ruta..."
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            value={searchQuery}
            onChangeText={onSearchChange}
            style={styles.searchInput}
            selectionColor="rgba(255, 255, 255, 0.3)"
          />
        </View>
      </View>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 48 : 32,
    paddingBottom: 24,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  headerContent: {
    width: "100%",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
    letterSpacing: -0.5,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#ffffff",
    padding: 0,
    includeFontPadding: false,
    ...Platform.select({
      ios: {
        height: 20,
      },
      android: {
        height: 24,
        paddingVertical: 0,
      },
    }),
  },
})