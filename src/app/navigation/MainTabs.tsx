import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LayoutDashboard, Package, Layers3, Settings2 } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { DashboardScreen } from '../../screens/DashboardScreen';
import { ProductsScreen } from '../../screens/ProductsScreen';
import { BatchesScreen } from '../../screens/BatchesScreen';
import { SettingsScreen } from '../../screens/SettingsScreen';
import type { TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();

const ICONS = {
  Dashboard: LayoutDashboard,
  Products: Package,
  Batches: Layers3,
  Settings: Settings2,
};

const LABELS = {
  Dashboard: 'الرئيسية',
  Products: 'المنتجات',
  Batches: 'التشغيلات',
  Settings: 'الإعدادات',
};

export function MainTabs() {
  const { theme } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          const Icon = ICONS[route.name];
          return <Icon size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          height: 62,
          paddingBottom: 6,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ tabBarLabel: LABELS.Dashboard }} />
      <Tab.Screen name="Products" component={ProductsScreen} options={{ tabBarLabel: LABELS.Products }} />
      <Tab.Screen name="Batches" component={BatchesScreen} options={{ tabBarLabel: LABELS.Batches }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarLabel: LABELS.Settings }} />
    </Tab.Navigator>
  );
}
