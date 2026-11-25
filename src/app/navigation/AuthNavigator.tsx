import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import { InstallScreen } from '../../screens/InstallScreen';
import { PatternScreen } from '../../screens/PatternScreen';
import { LicenseScreen } from '../../screens/LicenseScreen';
import type { AuthStackParamList } from './types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthNavigator() {
  const { theme } = useTheme();
  const phase = useAuthStore((s) => s.phase);

  // كل الشاشات مسجّلة دائماً؛ الانتقال بينها يتم صراحةً داخل الشاشات،
  // بينما يحدد الـ phase الشاشة الابتدائية عند الإقلاع فقط.
  return (
    <Stack.Navigator
      initialRouteName={phase === 'install' ? 'Install' : 'Pattern'}
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="Install" component={InstallScreen} />
      <Stack.Screen
        name="Pattern"
        component={PatternScreen}
        initialParams={{ mode: phase === 'pattern-setup' ? 'setup' : 'login' }}
      />
      <Stack.Screen name="License" component={LicenseScreen} />
    </Stack.Navigator>
  );
}
