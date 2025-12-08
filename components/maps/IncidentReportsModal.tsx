import { AlertTriangle, ChevronDown, Clock, MapPin, X } from 'lucide-react-native'
import React, { useState } from 'react'
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native'

interface IncidentReportModalProps {
  visible: boolean
  onClose: () => void
  onReportIncident: (report: any) => void
}

export function IncidentReportsModal({ 
  visible, 
  onClose, 
  onReportIncident 
}: IncidentReportModalProps) {
  
  const [incidentType, setIncidentType] = useState('traffic')
  const [severity, setSeverity] = useState('medium')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')

  const incidentTypes = [
    { id: 'traffic', label: 'Tráfico pesado', icon: '🚗' },
    { id: 'accident', label: 'Accidente', icon: '🚨' },
    { id: 'roadwork', label: 'Obras viales', icon: '🚧' },
    { id: 'closure', label: 'Cierre de ruta', icon: '⛔' },
    { id: 'protest', label: 'Manifestación', icon: '👥' },
    { id: 'other', label: 'Otro', icon: '⚠️' },
  ]

  const severityLevels = [
    { id: 'low', label: 'Leve', color: '#10B981' },
    { id: 'medium', label: 'Moderado', color: '#F59E0B' },
    { id: 'high', label: 'Alto', color: '#EF4444' },
  ]

  const handleSubmit = () => {
    if (!description.trim() || !location.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos')
      return
    }

    const report = {
      type: incidentType,
      severity,
      description,
      location,
      timestamp: new Date().toISOString(),
    }

    onReportIncident(report)
    // Reset form
    setDescription('')
    setLocation('')
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <AlertTriangle size={24} color="#EF4444" />
              <Text style={styles.title}>Reportar incidente</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.sectionTitle}>Tipo de incidente</Text>
            <View style={styles.typesGrid}>
              {incidentTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.typeButton,
                    incidentType === type.id && styles.typeButtonSelected
                  ]}
                  onPress={() => setIncidentType(type.id)}
                >
                  <Text style={styles.typeEmoji}>{type.icon}</Text>
                  <Text style={[
                    styles.typeLabel,
                    incidentType === type.id && styles.typeLabelSelected
                  ]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Gravedad</Text>
            <View style={styles.severityContainer}>
              {severityLevels.map((level) => (
                <TouchableOpacity
                  key={level.id}
                  style={[
                    styles.severityButton,
                    severity === level.id && { backgroundColor: level.color + '20' }
                  ]}
                  onPress={() => setSeverity(level.id)}
                >
                  <View style={[styles.severityDot, { backgroundColor: level.color }]} />
                  <Text style={styles.severityLabel}>{level.label}</Text>
                  {severity === level.id && <ChevronDown size={16} color={level.color} />}
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Ubicación</Text>
            <View style={styles.inputContainer}>
              <MapPin size={20} color="#9CA3AF" />
              <TextInput
                style={styles.input}
                placeholder="Ej: Av. 6 de Agosto esq. Sánchez Lima"
                value={location}
                onChangeText={setLocation}
              />
            </View>

            <Text style={styles.sectionTitle}>Descripción</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe el incidente..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <View style={styles.infoCard}>
              <Clock size={20} color="#6B7280" />
              <Text style={styles.infoText}>
                Tu reporte será verificado y aparecerá en el mapa para ayudar a otros usuarios
              </Text>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.submitButton}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>Enviar reporte</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  typesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  typeButton: {
    flex: 1,
    minWidth: '30%',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  typeButtonSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  typeEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  typeLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  typeLabelSelected: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  severityContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  severityButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  severityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  severityLabel: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#111827',
  },
  textArea: {
    height: 100,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 24,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#F0F9FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#0369A1',
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  submitButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
})