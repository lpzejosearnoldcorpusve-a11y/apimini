"use client"

import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from "@/constants/theme"
import { Ionicons } from "@expo/vector-icons"
import { Audio } from 'expo-av'
import * as FileSystem from 'expo-file-system'
import * as ImagePicker from 'expo-image-picker'
import { useRef, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"

interface EvidenceFile {
  uri: string
  name: string
  type: string
  size?: number
  url?: string // URL después de subir
  isUploaded?: boolean
}

interface EvidenceInputProps {
  images: string[]
  videos: string[]
  audios: string[]
  onImagesChange: (images: string[]) => void
  onVideosChange: (videos: string[]) => void
  onAudiosChange: (audios: string[]) => void
  onUploadFile?: (file: EvidenceFile, type: 'image' | 'video' | 'audio') => Promise<string>
}

export function EvidenceInput({
  images,
  videos,
  audios,
  onImagesChange,
  onVideosChange,
  onAudiosChange,
  onUploadFile,
}: EvidenceInputProps) {
  const [newImageUrl, setNewImageUrl] = useState("")
  const [newVideoUrl, setNewVideoUrl] = useState("")
  const [newAudioUrl, setNewAudioUrl] = useState("")
  const [recording, setRecording] = useState<Audio.Recording | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [uploadingIndex, setUploadingIndex] = useState<{type: string, index: number} | null>(null)
  const [isConverting, setIsConverting] = useState(false)

  // Local arrays para manejar archivos antes de subir
  const imageFilesRef = useRef<EvidenceFile[]>([])
  const videoFilesRef = useRef<EvidenceFile[]>([])
  const audioFilesRef = useRef<EvidenceFile[]>([])

  // Función para subir archivo
  const uploadFile = async (file: EvidenceFile, type: 'image' | 'video' | 'audio'): Promise<string> => {
    if (!onUploadFile) {
      throw new Error('Función de upload no proporcionada')
    }
    
    try {
      const url = await onUploadFile(file, type)
      return url
    } catch (error) {
      Alert.alert('Error', 'No se pudo subir el archivo')
      throw error
    }
  }

  // Agregar URL a la lista apropiada
  const addUrlToList = (url: string, list: string[], setList: (list: string[]) => void) => {
    if (!url.trim()) {
      Alert.alert("Error", "Por favor ingresa una URL válida")
      return
    }
    if (list.includes(url.trim())) {
      Alert.alert("Error", "Esta URL ya ha sido agregada")
      return
    }
    setList([...list, url.trim()])
  }

  // Solicitar permisos
  const requestPermissions = async () => {
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync()
    const { status: audioStatus } = await Audio.requestPermissionsAsync()
    
    if (mediaStatus !== 'granted' || cameraStatus !== 'granted') {
      Alert.alert('Permiso necesario', 'Se necesitan permisos para acceder a la galería y cámara')
      return false
    }
    
    if (audioStatus !== 'granted') {
      Alert.alert('Permiso necesario', 'Se necesita permiso para grabar audio')
      return false
    }
    
    return true
  }

  // Manejar selección de imagen
  const handleImageSelect = async (asset: any) => {
    const newImage: EvidenceFile = {
      uri: asset.uri,
      name: asset.fileName || `image_${Date.now()}.jpg`,
      type: asset.mimeType || 'image/jpeg',
      size: asset.fileSize,
    }
    
    // Agregar a referencia local
    const index = imageFilesRef.current.length
    imageFilesRef.current.push(newImage)
    
    // Si hay función de upload, subir y agregar URL a la lista
    if (onUploadFile) {
      setIsConverting(true)
      setUploadingIndex({type: 'image', index})
      try {
        const url = await uploadFile(newImage, 'image')
        onImagesChange([...images, url])
        newImage.url = url
        newImage.isUploaded = true
      } catch (error) {
        // Revertir si falla
        imageFilesRef.current.pop()
      } finally {
        setIsConverting(false)
        setUploadingIndex(null)
      }
    } else {
      // Si no hay upload, usar la URI local (solo para desarrollo)
      Alert.alert('Aviso', 'Sin función de upload, usando URI local')
      onImagesChange([...images, asset.uri])
    }
  }

  // Seleccionar imagen de galería
  const pickImage = async () => {
    const hasPermission = await requestPermissions()
    if (!hasPermission) return

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      base64: false,
    })

    if (!result.canceled && result.assets[0]) {
      await handleImageSelect(result.assets[0])
    }
  }

  // Tomar foto con cámara
  const takePhoto = async () => {
    const hasPermission = await requestPermissions()
    if (!hasPermission) return

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
      base64: false,
    })

    if (!result.canceled && result.assets[0]) {
      await handleImageSelect(result.assets[0])
    }
  }

  // Manejar selección de video
  const handleVideoSelect = async (asset: any) => {
    const newVideo: EvidenceFile = {
      uri: asset.uri,
      name: asset.fileName || `video_${Date.now()}.mp4`,
      type: asset.mimeType || 'video/mp4',
      size: asset.fileSize,
    }
    
    const index = videoFilesRef.current.length
    videoFilesRef.current.push(newVideo)
    
    if (onUploadFile) {
      setIsConverting(true)
      setUploadingIndex({type: 'video', index})
      try {
        const url = await uploadFile(newVideo, 'video')
        onVideosChange([...videos, url])
        newVideo.url = url
        newVideo.isUploaded = true
      } catch (error) {
        videoFilesRef.current.pop()
      } finally {
        setIsConverting(false)
        setUploadingIndex(null)
      }
    } else {
      Alert.alert('Aviso', 'Sin función de upload, usando URI local')
      onVideosChange([...videos, asset.uri])
    }
  }

  // Seleccionar video de galería
  const pickVideo = async () => {
    const hasPermission = await requestPermissions()
    if (!hasPermission) return

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 0.8,
      videoMaxDuration: 60,
    })

    if (!result.canceled && result.assets[0]) {
      await handleVideoSelect(result.assets[0])
    }
  }

  // Grabar video con cámara
  const recordVideo = async () => {
    const hasPermission = await requestPermissions()
    if (!hasPermission) return

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 0.8,
      videoMaxDuration: 60,
    })

    if (!result.canceled && result.assets[0]) {
      await handleVideoSelect(result.assets[0])
    }
  }

  // Grabar audio
  const startRecording = async () => {
    try {
      const hasPermission = await requestPermissions()
      if (!hasPermission) return

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      })

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      )
      setRecording(recording)
      setIsRecording(true)
    } catch (err) {
      console.error('Error al iniciar grabación:', err)
      Alert.alert('Error', 'No se pudo iniciar la grabación')
    }
  }

  const stopRecording = async () => {
    if (!recording) return

    setIsRecording(false)
    await recording.stopAndUnloadAsync()
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    })

    const uri = recording.getURI()
    if (uri) {
      const fileInfo = await FileSystem.getInfoAsync(uri)
      const newAudio: EvidenceFile = {
        uri,
        name: `audio_${Date.now()}.m4a`,
        type: 'audio/m4a',
        size: 'size' in fileInfo ? fileInfo.size : 0,
      }
      
      const index = audioFilesRef.current.length
      audioFilesRef.current.push(newAudio)
      
      if (onUploadFile) {
        setIsConverting(true)
        setUploadingIndex({type: 'audio', index})
        try {
          const url = await uploadFile(newAudio, 'audio')
          onAudiosChange([...audios, url])
          newAudio.url = url
          newAudio.isUploaded = true
        } catch (error) {
          audioFilesRef.current.pop()
        } finally {
          setIsConverting(false)
          setUploadingIndex(null)
        }
      } else {
        Alert.alert('Aviso', 'Sin función de upload, usando URI local')
        onAudiosChange([...audios, uri])
      }
    }

    setRecording(null)
  }

  // Eliminar archivo/URL
  const removeItem = (index: number, list: string[], setList: (list: string[]) => void, type: 'image' | 'video' | 'audio') => {
    const newList = list.filter((_, i) => i !== index)
    setList(newList)
    
    // También remover del array de referencia
    if (type === 'image' && index < imageFilesRef.current.length) {
      imageFilesRef.current.splice(index, 1)
    } else if (type === 'video' && index < videoFilesRef.current.length) {
      videoFilesRef.current.splice(index, 1)
    } else if (type === 'audio' && index < audioFilesRef.current.length) {
      audioFilesRef.current.splice(index, 1)
    }
  }

  // Renderizar lista de evidencias
  const renderEvidenceList = (
    title: string,
    list: string[],
    setList: (list: string[]) => void,
    icon: string,
    type: 'image' | 'video' | 'audio'
  ) => {
    // Obtener archivos correspondientes
    const files = type === 'image' ? imageFilesRef.current : 
                 type === 'video' ? videoFilesRef.current : 
                 audioFilesRef.current

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          <Ionicons name={icon as any} size={16} /> {title} ({list.length})
        </Text>
        {list.map((url, index) => {
          const file = files[index]
          const isUploading = uploadingIndex?.type === type && uploadingIndex?.index === index
          
          return (
            <View key={index} style={styles.fileItem}>
              <View style={styles.fileIconContainer}>
                {isUploading ? (
                  <ActivityIndicator size="small" color={COLORS.primary} />
                ) : (
                  <Ionicons 
                    name={icon as any} 
                    size={16} 
                    color={file?.isUploaded ? COLORS.success : COLORS.warning} 
                  />
                )}
              </View>
              <View style={styles.fileInfo}>
                <Text style={styles.fileName} numberOfLines={1}>
                  {file?.name || `Archivo ${index + 1}`}
                </Text>
                <Text style={styles.urlText} numberOfLines={1}>
                  {url}
                </Text>
                <Text style={styles.fileStatus}>
                  {file?.isUploaded ? '✓ Subido' : file ? 'Pendiente subir' : 'URL externa'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => removeItem(index, list, setList, type)}
                style={styles.removeButton}
              >
                <Ionicons name="close-circle" size={20} color={COLORS.error} />
              </TouchableOpacity>
            </View>
          )
        })}
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Evidencias (opcional)</Text>

      {/* Imágenes */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Imágenes</Text>
        <View style={styles.buttonGroup}>
          <TouchableOpacity style={styles.actionButton} onPress={pickImage}>
            <Ionicons name="images" size={16} color={COLORS.white} />
            <Text style={styles.buttonText}>Galería</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={takePhoto}>
            <Ionicons name="camera" size={16} color={COLORS.white} />
            <Text style={styles.buttonText}>Cámara</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="O ingresa URL de imagen"
            value={newImageUrl}
            onChangeText={setNewImageUrl}
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              addUrlToList(newImageUrl, images, onImagesChange)
              setNewImageUrl("")
            }}
          >
            <Ionicons name="add" size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Videos */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Videos</Text>
        <View style={styles.buttonGroup}>
          <TouchableOpacity style={styles.actionButton} onPress={pickVideo}>
            <Ionicons name="videocam" size={16} color={COLORS.white} />
            <Text style={styles.buttonText}>Galería</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={recordVideo}>
            <Ionicons name="videocam" size={16} color={COLORS.white} />
            <Text style={styles.buttonText}>Grabar</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="O ingresa URL de video"
            value={newVideoUrl}
            onChangeText={setNewVideoUrl}
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              addUrlToList(newVideoUrl, videos, onVideosChange)
              setNewVideoUrl("")
            }}
          >
            <Ionicons name="add" size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Audios */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Audios</Text>
        <View style={styles.buttonGroup}>
          <TouchableOpacity 
            style={[styles.actionButton, isRecording && styles.recordingButton]} 
            onPress={isRecording ? stopRecording : startRecording}
          >
            <Ionicons 
              name={isRecording ? "stop-circle" : "mic"} 
              size={16} 
              color={COLORS.white} 
            />
            <Text style={styles.buttonText}>
              {isRecording ? "Detener" : "Grabar"}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="O ingresa URL de audio"
            value={newAudioUrl}
            onChangeText={setNewAudioUrl}
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              addUrlToList(newAudioUrl, audios, onAudiosChange)
              setNewAudioUrl("")
            }}
          >
            <Ionicons name="add" size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.listsContainer} showsVerticalScrollIndicator={false}>
        {renderEvidenceList("Imágenes", images, onImagesChange, "image", "image")}
        {renderEvidenceList("Videos", videos, onVideosChange, "videocam", "video")}
        {renderEvidenceList("Audios", audios, onAudiosChange, "musical-note", "audio")}
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
  buttonGroup: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  actionButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: SPACING.xs,
  },
  recordingButton: {
    backgroundColor: COLORS.error,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.xs,
    fontWeight: "600",
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
    maxHeight: 250,
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
  fileItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  fileIconContainer: {
    width: 24,
    alignItems: "center",
    marginRight: SPACING.sm,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text,
    fontWeight: "500",
    marginBottom: 2,
  },
  urlText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
  },
  fileStatus: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.success,
    marginTop: 2,
  },
  removeButton: {
    padding: SPACING.xs,
  },
})