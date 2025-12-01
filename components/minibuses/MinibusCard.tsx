"use client"

import type { Minibus } from "@/types/transport"
import { LinearGradient } from "expo-linear-gradient"
import { ChevronRight, Clock, MapPin, Route } from "lucide-react-native"
import React from "react"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"

interface MinibusCardProps {
  minibus: Minibus
  selected: boolean
  onSelect: () => void
}

export function MinibusCard({ minibus, selected, onSelect }: MinibusCardProps) {
  return (
    <TouchableOpacity 
      onPress={onSelect}
      activeOpacity={0.7}
    >
      {selected ? (
        <LinearGradient
          colors={["#06b6d4", "#14b8a6"] as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.container,
            styles.selectedContainer
          ]}
        >
          <View style={[
            styles.lineBadge,
            styles.selectedLineBadge
          ]}>
            <Text style={[
              styles.lineText,
              styles.selectedLineText
            ]}>
              {minibus.linea}
            </Text>
          </View>
          
          <View style={styles.content}>
            <Text style={[
              styles.title,
              styles.selectedText
            ]}>
              {minibus.sindicato}
            </Text>
            
            <View style={styles.routeInfo}>
              <Route size={12} color="rgba(255,255,255,0.8)" />
              <Text style={[
                styles.routeText,
                styles.selectedSubText
              ]}>
                {minibus.rutaNombre}
              </Text>
            </View>
            
            <View style={styles.details}>
              <View style={styles.detailItem}>
                <MapPin size={12} color="rgba(255,255,255,0.7)" />
                <Text style={[
                  styles.detailText,
                  styles.selectedDetailText
                ]}>
                  {minibus.ruta.length} paradas
                </Text>
              </View>
              
              <View style={styles.detailItem}>
                <Clock size={12} color="rgba(255,255,255,0.7)" />
                <Text style={[
                  styles.detailText,
                  styles.selectedDetailText
                ]}>
                  5-10 min
                </Text>
              </View>
            </View>
          </View>
          
          <ChevronRight 
            size={20} 
            color="rgba(255,255,255,0.7)" 
          />
        </LinearGradient>
      ) : (
        <View
          style={[
            styles.container,
            styles.normalContainer
          ]}
        >
          <View style={[
            styles.lineBadge,
            styles.normalLineBadge
          ]}>
            <Text style={[
              styles.lineText,
              styles.normalLineText
            ]}>
              {minibus.linea}
            </Text>
          </View>
          
          <View style={styles.content}>
            <Text style={[
              styles.title,
              styles.normalText
            ]}>
              {minibus.sindicato}
            </Text>
            
            <View style={styles.routeInfo}>
              <Route size={12} color="#6b7280" />
              <Text style={[
                styles.routeText,
                styles.normalSubText
              ]}>
                {minibus.rutaNombre}
              </Text>
            </View>
            
            <View style={styles.details}>
              <View style={styles.detailItem}>
                <MapPin size={12} color="#9ca3af" />
                <Text style={[
                  styles.detailText,
                  styles.normalDetailText
                ]}>
                  {minibus.ruta.length} paradas
                </Text>
              </View>
              
              <View style={styles.detailItem}>
                <Clock size={12} color="#9ca3af" />
                <Text style={[
                  styles.detailText,
                  styles.normalDetailText
                ]}>
                  5-10 min
                </Text>
              </View>
            </View>
          </View>
          
          <ChevronRight 
            size={20} 
            color="#d1d5db" 
          />
        </View>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 16,
    marginVertical: 4,
  },
  selectedContainer: {
    shadowColor: "#06b6d4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  normalContainer: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#f3f4f6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  lineBadge: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedLineBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  normalLineBadge: {
    backgroundColor: "#ecfeff",
  },
  lineText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  selectedLineText: {
    color: "#ffffff",
  },
  normalLineText: {
    color: "#0891b2",
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  selectedText: {
    color: "#ffffff",
  },
  normalText: {
    color: "#1f2937",
  },
  routeInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 6,
  },
  routeText: {
    fontSize: 12,
  },
  selectedSubText: {
    color: "rgba(255, 255, 255, 0.8)",
  },
  normalSubText: {
    color: "#6b7280",
  },
  details: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  detailText: {
    fontSize: 12,
  },
  selectedDetailText: {
    color: "rgba(255, 255, 255, 0.7)",
  },
  normalDetailText: {
    color: "#9ca3af",
  },
})