import { ChevronRight, Clock, DollarSign, TrendingUp, Users, X } from 'lucide-react-native'
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

interface PopularRoute {
  id: string
  name: string
  from: string
  to: string
  frequency: string
  travelTime: string
  fare: string
  peakHours: string[]
  rating: number
}

interface PopularRoutesModalProps {
  visible: boolean
  onClose: () => void
  onSelectRoute: (route: PopularRoute) => void
}

export function PopularRoutesModal({ 
  visible, 
  onClose, 
  onSelectRoute 
}: PopularRoutesModalProps) {
  
  const popularRoutes: PopularRoute[] = [
    {
      id: '1',
      name: 'Ruta 10',
      from: 'Villa Fátima',
      to: 'San Miguel',
      frequency: '5-8 min',
      travelTime: '45 min',
      fare: '3 Bs',
      peakHours: ['07:00-09:00', '17:00-19:00'],
      rating: 4.5
    },
    {
      id: '2',
      name: 'Teleférico Línea Roja',
      from: 'El Alto (16 de Julio)',
      to: 'Centro (Estación Central)',
      frequency: '12 seg',
      travelTime: '17 min',
      fare: '3 Bs',
      peakHours: ['06:30-08:30', '16:00-18:30'],
      rating: 4.8
    },
    {
      id: '3',
      name: 'Micro 252',
      from: 'Miraflores',
      to: 'Obrajes',
      frequency: '10-15 min',
      travelTime: '25 min',
      fare: '2.40 Bs',
      peakHours: ['08:00-10:00', '18:00-20:00'],
      rating: 4.2
    },
    {
      id: '4',
      name: 'Trufi 137',
      from: 'Sopocachi',
      to: 'Calacoto',
      frequency: '7-10 min',
      travelTime: '30 min',
      fare: '3 Bs',
      peakHours: ['07:30-09:30', '17:30-19:30'],
      rating: 4.6
    },
    {
      id: '5',
      name: 'Ruta Chasquipampa',
      from: 'Cota Cota',
      to: 'Plaza del Estudiante',
      frequency: '15-20 min',
      travelTime: '40 min',
      fare: '2.40 Bs',
      peakHours: ['07:00-09:00', '16:00-18:00'],
      rating: 4.0
    },
    {
      id: '6',
      name: 'PumaKatari B20',
      from: 'Villa Salomé',
      to: 'San Pedro',
      frequency: '20-25 min',
      travelTime: '55 min',
      fare: '2 Bs',
      peakHours: ['06:00-08:00', '15:00-17:00'],
      rating: 4.3
    },
  ]

  const getPeakHoursDisplay = (hours: string[]) => {
    return hours.join(' y ')
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
              <TrendingUp size={24} color="#10B981" />
              <Text style={styles.title}>Rutas populares</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={popularRoutes}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.routeCard}
                onPress={() => onSelectRoute(item)}
              >
                <View style={styles.routeHeader}>
                  <View style={styles.routeNameContainer}>
                    <View style={styles.routeBadge}>
                      <Text style={styles.routeBadgeText}>{item.name}</Text>
                    </View>
                    <View style={styles.ratingContainer}>
                      <Text style={styles.ratingText}>★ {item.rating}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.routePath}>
                    <Text style={styles.routeFrom}>{item.from}</Text>
                    <View style={styles.pathLine} />
                    <Text style={styles.routeTo}>{item.to}</Text>
                  </View>
                </View>

                <View style={styles.routeDetails}>
                  <View style={styles.detailItem}>
                    <Clock size={16} color="#6B7280" />
                    <Text style={styles.detailText}>{item.travelTime}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Users size={16} color="#6B7280" />
                    <Text style={styles.detailText}>{item.frequency}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <DollarSign size={16} color="#6B7280" />
                    <Text style={styles.detailText}>{item.fare}</Text>
                  </View>
                </View>

                <View style={styles.peakHoursContainer}>
                  <Text style={styles.peakHoursLabel}>Horas pico:</Text>
                  <Text style={styles.peakHoursText}>
                    {getPeakHoursDisplay(item.peakHours)}
                  </Text>
                </View>

                <TouchableOpacity style={styles.selectButton}>
                  <Text style={styles.selectButtonText}>Ver ruta</Text>
                  <ChevronRight size={16} color="#3B82F6" />
                </TouchableOpacity>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.listContent}
          />
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
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
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
  listContent: {
    paddingBottom: 20,
  },
  routeCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  routeHeader: {
    marginBottom: 12,
  },
  routeNameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  routeBadge: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  routeBadgeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D97706',
  },
  routePath: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeFrom: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  pathLine: {
    width: 20,
    height: 1,
    backgroundColor: '#9CA3AF',
    marginHorizontal: 8,
  },
  routeTo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  routeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#4B5563',
  },
  peakHoursContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  peakHoursLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginRight: 6,
  },
  peakHoursText: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  selectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
})