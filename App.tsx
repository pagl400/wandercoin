import { DarkTheme as NavDark, DefaultTheme as NavLight, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ConverterScreen } from './src/screens/ConverterScreen';
import { CurrencyPickerScreen } from './src/screens/CurrencyPickerScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import type { Palette } from './src/theme/colors';
import { useTheme } from './src/theme/useTheme';
import type { RootStackParamList } from './src/types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

function makeNavTheme(palette: Palette) {
  const base = palette.scheme === 'dark' ? NavDark : NavLight;
  return {
    ...base,
    colors: {
      ...base.colors,
      background: palette.bg,
      card: palette.bg,
      text: palette.text,
      border: palette.border,
      primary: palette.accent,
    },
  };
}

function ThemedApp() {
  const c = useTheme();
  const navTheme = makeNavTheme(c);

  return (
    <NavigationContainer theme={navTheme}>
      <StatusBar style={c.scheme === 'dark' ? 'light' : 'dark'} />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: c.bg },
        }}
      >
        <Stack.Screen name="Converter" component={ConverterScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen
          name="CurrencyPicker"
          component={CurrencyPickerScreen}
          options={{ presentation: 'modal' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export function App() {
  return (
    <SafeAreaProvider>
      <ThemedApp />
    </SafeAreaProvider>
  );
}
