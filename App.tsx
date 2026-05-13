import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ChartScreen } from './src/screens/ChartScreen';
import { ConverterScreen } from './src/screens/ConverterScreen';
import { CurrencyPickerScreen } from './src/screens/CurrencyPickerScreen';
import type { RootStackParamList } from './src/types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Converter" component={ConverterScreen} />
          <Stack.Screen name="Chart" component={ChartScreen} />
          <Stack.Screen
            name="CurrencyPicker"
            component={CurrencyPickerScreen}
            options={{ presentation: 'modal' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
