import { Button } from '@/components/ui/Button';
import { AlertCircle, RefreshCw } from 'lucide-react-native';
import React from 'react';
import {
    StyleProp,
    StyleSheet,
    Text,
    View,
    ViewStyle,
} from 'react-native';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  style?: StyleProp<ViewStyle>;
  showIcon?: boolean;
}

export function ErrorState({ 
  title = "Error de conexión", 
  message, 
  onRetry, 
  style,
  showIcon = true 
}: ErrorStateProps) {
  return (
    <View style={[styles.container, style]}>
      {showIcon && (
        <View style={styles.iconContainer}>
          <AlertCircle size={32} color="#ef4444" />
        </View>
      )}
      
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      
      {onRetry && (
        <Button
          title="Reintentar"
          onPress={onRetry}
          variant="outline"
          icon={<RefreshCw size={16} color="#2563eb" />}
          style={styles.button}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fef2f2',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    maxWidth: 300,
    lineHeight: 20,
  },
  button: {
    minWidth: 120,
  },
});