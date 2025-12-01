import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

interface LegendItem {
  color: string;
  label: string;
  type?: 'line' | 'dashed' | 'circle';
}

interface MapLegendProps {
  items: LegendItem[];
  title?: string;
}

export function MapLegend({ items, title = 'Leyenda' }: MapLegendProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <ScrollView style={styles.itemsContainer}>
        {items.map((item, index) => (
          <View key={index} style={styles.item}>
            {item.type === 'dashed' ? (
              <View style={[styles.dashedLine, { borderColor: item.color }]} />
            ) : item.type === 'circle' ? (
              <View style={[styles.circle, { backgroundColor: item.color }]} />
            ) : (
              <View style={[styles.line, { backgroundColor: item.color }]} />
            )}
            <Text style={styles.label} numberOfLines={1}>
              {item.label}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 12,
    maxWidth: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  itemsContainer: {
    maxHeight: 200,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  line: {
    width: 24,
    height: 4,
    borderRadius: 2,
  },
  dashedLine: {
    width: 24,
    height: 2,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 0,
  },
  circle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  label: {
    fontSize: 12,
    color: '#4b5563',
    flex: 1,
  },
});