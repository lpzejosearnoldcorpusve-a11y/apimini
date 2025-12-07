"use client"

import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from "@/constants/theme"
import { Ionicons } from "@expo/vector-icons"
import { ResizeMode, Video } from "expo-av"
import { useState } from "react"
import {
    Dimensions,
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native"

const { width: screenWidth } = Dimensions.get("window")

interface EvidenceViewerProps {
  images: string[]
  videos: string[]
  audios: string[]
}

export function EvidenceViewer({ images, videos, audios }: EvidenceViewerProps) {
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null)
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null)

  const openMedia = (url: string, type: "image" | "video") => {
    setSelectedMedia(url)
    setMediaType(type)
  }

  const closeMedia = () => {
    setSelectedMedia(null)
    setMediaType(null)
  }

  const renderMediaItem = (url: string, type: "image" | "video", icon: string) => (
    <TouchableOpacity
      key={url}
      style={styles.mediaItem}
      onPress={() => openMedia(url, type)}
    >
      <Ionicons name={icon as any} size={24} color={COLORS.primary} />
      <Text style={styles.mediaText} numberOfLines={1}>
        {type === "image" ? "Imagen" : "Video"} {url.split("/").pop()}
      </Text>
      <Ionicons name="eye" size={16} color={COLORS.textLight} />
    </TouchableOpacity>
  )

  const renderAudioItem = (url: string) => (
    <View key={url} style={styles.mediaItem}>
      <Ionicons name="musical-note" size={24} color={COLORS.primary} />
      <Text style={styles.mediaText} numberOfLines={1}>
        Audio {url.split("/").pop()}
      </Text>
      <TouchableOpacity
        onPress={() => {
          // TODO: Implement audio playback
          console.log("Play audio:", url)
        }}
      >
        <Ionicons name="play" size={16} color={COLORS.primary} />
      </TouchableOpacity>
    </View>
  )

  if (images.length === 0 && videos.length === 0 && audios.length === 0) {
    return null
  }

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.title}>Evidencias</Text>

        {images.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="image" size={16} /> Imágenes ({images.length})
            </Text>
            {images.map((url) => renderMediaItem(url, "image", "image"))}
          </View>
        )}

        {videos.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="videocam" size={16} /> Videos ({videos.length})
            </Text>
            {videos.map((url) => renderMediaItem(url, "video", "videocam"))}
          </View>
        )}

        {audios.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="musical-note" size={16} /> Audios ({audios.length})
            </Text>
            {audios.map((url) => renderAudioItem(url))}
          </View>
        )}
      </View>

      {/* Media Modal */}
      <Modal visible={!!selectedMedia} animationType="fade" onRequestClose={closeMedia}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={closeMedia}>
            <Ionicons name="close" size={30} color={COLORS.white} />
          </TouchableOpacity>

          {selectedMedia && mediaType === "image" && (
            <Image source={{ uri: selectedMedia }} style={styles.fullMedia} resizeMode="contain" />
          )}

          {selectedMedia && mediaType === "video" && (
            <Video
              source={{ uri: selectedMedia }}
              style={styles.fullMedia}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay={false}
            />
          )}
        </View>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.md,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.sm,
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
  mediaItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  mediaText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.black,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: SPACING.xl,
    right: SPACING.lg,
    zIndex: 1,
    backgroundColor: COLORS.black + "80",
    borderRadius: BORDER_RADIUS.full,
    padding: SPACING.xs,
  },
  fullMedia: {
    width: screenWidth,
    height: screenWidth,
  },
})