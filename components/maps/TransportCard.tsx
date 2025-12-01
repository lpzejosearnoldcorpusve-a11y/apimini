import { LinearGradient } from 'expo-linear-gradient';
import { Bus, Cable, ChevronRight, Clock, MapPin } from 'lucide-react-native';
import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

interface TransportCardProps {
  type: 'minibus' | 'teleferico';
  title: string;
  subtitle: string;
  color: string;
  info?: string;
  selected?: boolean;
  onClick?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function TransportCard({ 
  type, 
  title, 
  subtitle, 
  color, 
  info, 
  selected = false, 
  onClick,
  style 
}: TransportCardProps) {
  const Icon = type === 'minibus' ? Bus : Cable;

  return (
    <TouchableOpacity
      onPress={onClick}
      activeOpacity={0.7}
      style={[
        styles.container,
        selected ? styles.selectedContainer : styles.defaultContainer,
        selected && { borderColor: color },
        style,
      ]}
    >
      {/* Icon container with gradient effect */}
      <LinearGradient
        colors={[`${color}15`, `${color}08`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.iconContainer,
          { borderColor: selected ? color : 'transparent' },
        ]}
      >
        <View style={[styles.iconBackground, { backgroundColor: `${color}20` }]}>
          <Icon size={24} color={color} />
        </View>
        
        {/* Selected indicator */}
        {selected && (
          <View style={[styles.selectedIndicator, { backgroundColor: color }]} />
        )}
      </LinearGradient>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={2}>
          {subtitle}
        </Text>
        
        {info && (
          <View style={styles.infoContainer}>
            {type === 'minibus' ? (
              <Clock size={12} color="#9ca3af" />
            ) : (
              <MapPin size={12} color="#9ca3af" />
            )}
            <Text style={styles.infoText} numberOfLines={1}>
              {info}
            </Text>
          </View>
        )}
      </View>

      {/* Chevron icon with animation effect */}
      <LinearGradient
        colors={['#f9fafb', '#f3f4f6']}
        style={styles.chevronContainer}
      >
        <ChevronRight 
          size={18} 
          color={selected ? color : '#d1d5db'} 
        />
      </LinearGradient>

      {/* Glow effect when selected */}
      {selected && (
        <LinearGradient
          colors={[`${color}10`, `${color}05`, 'transparent']}
          style={styles.glowEffect}
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    marginVertical: 4,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  defaultContainer: {
    backgroundColor: '#ffffff',
    borderColor: '#f3f4f6',
  },
  selectedContainer: {
    backgroundColor: '#f0f9ff',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    overflow: 'hidden',
  },
  iconBackground: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  content: {
    flex: 1,
    marginHorizontal: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#9ca3af',
    flex: 1,
  },
  chevronContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  glowEffect: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    zIndex: -1,
  },
});