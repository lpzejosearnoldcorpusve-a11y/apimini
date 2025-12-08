import { Briefcase, Home, MapPin, Star, X } from 'lucide-react-native'
import React from 'react'
import {
    FlatList,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'

interface SavedLocation {
  id: string
  name: string
  address: string
  type: 'home' | 'work' | 'favorite' | 'other'
  lat: number
  lng: number
}

interface SavedLocationsModalProps {
  visible: boolean
  onClose: () => void
  onSelectLocation: (location: SavedLocation) => void
}

export function SavedLocationsModal({ 
  visible, 
  onClose, 
  onSelectLocation 
}: SavedLocationsModalProps) {
  
  const savedLocations: SavedLocation[] = [
    {
      id: '1',
      name: 'Casa',
      address: 'Av. Ballivián, Calacoto',
      type: 'home',
      lat: -16.532,
      lng: -68.079
    },
    {
      id: '2',
      name: 'Trabajo',
      address: 'Edificio Alianza, Sopocachi',
      type: 'work',
      lat: -16.510,
      lng: -68.125
    },
    {
      id: '3',
      name: 'Universidad UMSA',
      address: 'Calle 27, Cota Cota',
      type: 'favorite',
      lat: -16.530,
      lng: -68.080
    },
    {
      id: '4',
      name: 'Mercado Rodríguez',
      address: 'Mercado Rodríguez, Centro',
      type: 'other',
      lat: -16.496,
      lng: -68.138
    },
  ]

  const getIcon = (type: SavedLocation['type']) => {
    switch (type) {
      case 'home': return Home
      case 'work': return Briefcase
      case 'favorite': return Star
      default: return MapPin
    }
  }

  const getColor = (type: SavedLocation['type']) => {
    switch (type) {
      case 'home': return '#3B82F6'
      case 'work': return '#8B5CF6'
      case 'favorite': return '#F59E0B'
      default: return '#6B7280'
    }
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
            <Text style={styles.title}>Ubicaciones guardadas</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={savedLocations}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const Icon = getIcon(item.type)
              const color = getColor(item.type)
              return (
                <TouchableOpacity 
                  style={styles.locationItem}
                  onPress={() => onSelectLocation(item)}
                >
                  <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
                    <Icon size={20} color={color} />
                  </View>
                  <View style={styles.locationInfo}>
                    <Text style={styles.locationName}>{item.name}</Text>
                    <Text style={styles.locationAddress}>{item.address}</Text>
                  </View>
                  <TouchableOpacity>
                    <MapPin size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                </TouchableOpacity>
              )
            }}
            contentContainerStyle={styles.listContent}
          />

          <TouchableOpacity style={styles.addButton}>
            <Text style={styles.addButtonText}>+ Agregar ubicación</Text>
          </TouchableOpacity>
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
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
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
  listContent: {
    paddingBottom: 20,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 14,
    color: '#6B7280',
  },
  addButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
})