import type { CompositeNavigationProp, RouteProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type AuthStackParamList = {
  Install: undefined;
  Pattern: { mode: 'setup' | 'login' };
  License: undefined;
};

export type TabParamList = {
  Dashboard: undefined;
  Products: undefined;
  Batches: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  ProductDetail: { id: number };
  ProductForm: { id?: number };
  BatchForm: { id?: number; productId?: number };
  About: undefined;
  SyncCenter: undefined;
};

export type TabScreenProps<T extends keyof TabParamList> = {
  navigation: CompositeNavigationProp<
    BottomTabNavigationProp<TabParamList, T>,
    NativeStackNavigationProp<RootStackParamList>
  >;
  route: RouteProp<TabParamList, T>;
};
