"use client"

import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from "@/constants/theme"
import { Ionicons } from "@expo/vector-icons"
import { useState } from "react"
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native"

interface EvidenceInputProps {
  images: string[]
  videos: string[]
  audios: string[]
  onImagesChange: (images: string[]) => void
  onVideosChange: (videos: string[]) => void
  onAudiosChange: (audios: string[]) => void
}

export function EvidenceInput({
  images,
  videos,
  audios,
  onImagesChange,
  onVideosChange,
  onAudiosChange,
}: EvidenceInputProps) {
  const [newImageUrl, setNewImageUrl] = useState("")
  const [newVideoUrl, setNewVideoUrl] = useState("")
  const [newAudioUrl, setNewAudioUrl] = useState("")

  const addUrl = (
    url: string,
    list: string[],
    onChange: (newList: string[]) => void,
    setUrl: (url: string) => void,
    type: string
  ) => {
    if (!url.trim()) {
      Alert.alert("Error", `Por favor ingresa una URL válida para ${type}`)
      return
    }
    if (list.includes(url.trim())) {
      Alert.alert("Error", "Esta URL ya ha sido agregada")
      return
    }
    onChange([...list, url.trim()])
    setUrl("")
  }

  const removeUrl = (index: number, list: string[], onChange: (newList: string[]) => void) => {
    const newList = list.filter((_, i) => i !== index)
    onChange(newList)
  }

  const renderUrlList = (
    title: string,
    list: string[],
    onChange: (newList: string[]) => void,
    icon: string
  ) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        <Ionicons name={icon as any} size={16} /> {title} ({list.length})
      </Text>
      {list.map((url, index) => (
        <View key={index} style={styles.urlItem}>
          <Text style={styles.urlText} numberOfLines={1}>
            {url}
          </Text>
          <TouchableOpacity
            onPress={() => removeUrl(index, list, onChange)}
            style={styles.removeButton}
          >
            <Ionicons name="close-circle" size={20} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      ))}
    </View>
  )

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Evidencias (opcional)</Text>

      {/* Imágenes */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>URL de Imagen</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="https://ejemplo.com/imagen.jpg"
            value={newImageUrl}
            onChangeText={setNewImageUrl}
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => addUrl(newImageUrl, images, onImagesChange, setNewImageUrl, "imagen")}
          >
            <Ionicons name="add" size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Videos */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>URL de Video</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="https://ejemplo.com/video.mp4"
            value={newVideoUrl}
            onChangeText={setNewVideoUrl}
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => addUrl(newVideoUrl, videos, onVideosChange, setNewVideoUrl, "video")}
          >
            <Ionicons name="add" size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Audios */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>URL de Audio</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="https://ejemplo.com/audio.m4a"
            value={newAudioUrl}
            onChangeText={setNewAudioUrl}
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => addUrl(newAudioUrl, audios, onAudiosChange, setNewAudioUrl, "audio")}
          >
            <Ionicons name="add" size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.listsContainer} showsVerticalScrollIndicator={false}>
        {renderUrlList("Imágenes", images, onImagesChange, "image")}
        {renderUrlList("Videos", videos, onVideosChange, "videocam")}
        {renderUrlList("Audios", audios, onAudiosChange, "musical-note")}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  inputRow: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    fontSize: FONT_SIZES.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: "center",
    alignItems: "center",
    width: 40,
  },
  listsContainer: {
    maxHeight: 200,
    marginTop: SPACING.sm,
  },
  section: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  urlItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  urlText: {
    flex: 1,
    fontSize: FONT_SIZES.xs,
    color: COLORS.text,
  },
  removeButton: {
    padding: SPACING.xs,
  },
})