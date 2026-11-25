import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import { AuthNavigator } from './AuthNavigator';
import { MainTabs } from './MainTabs';
import { ProductDetailScreen } from '../../screens/ProductDetailScreen';
import { ProductFormScreen } from '../../screens/ProductFormScreen';
import { BatchFormScreen } from '../../screens/BatchFormScreen';
import { AboutScreen } from '../../screens/AboutScreen';
import { SyncCenterScreen } from '../../screens/SyncCenterScreen';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { theme } = useTheme();
  const phase = useAuthStore((s) => s.phase);
  const ready = phase === 'ready';

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      {ready ? (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
          <Stack.Screen name="ProductForm" component={ProductFormScreen} />
          <Stack.Screen name="BatchForm" component={BatchFormScreen} />
          <Stack.Screen name="About" component={AboutScreen} />
          <Stack.Screen name="SyncCenter" component={SyncCenterScreen} />
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
}
