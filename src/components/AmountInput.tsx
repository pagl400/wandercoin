import { StyleSheet, TextInput } from 'react-native';

import { useTheme } from '../theme/useTheme';

interface AmountInputProps {
  value: string;
  onChangeText: (v: string) => void;
}

const MAX_INT_DIGITS = 12;
const MAX_DECIMAL_DIGITS = 4;

function sanitize(input: string): string {
  const cleaned = input.replace(/[^\d.,]/g, '');
  const sepIdx = cleaned.search(/[.,]/);
  if (sepIdx === -1) {
    return cleaned.slice(0, MAX_INT_DIGITS);
  }
  const intPart = cleaned.slice(0, sepIdx).slice(0, MAX_INT_DIGITS);
  const decPart = cleaned
    .slice(sepIdx + 1)
    .replace(/[.,]/g, '')
    .slice(0, MAX_DECIMAL_DIGITS);
  return `${intPart}${cleaned[sepIdx]}${decPart}`;
}

export function AmountInput({ value, onChangeText }: AmountInputProps) {
  const c = useTheme();
  return (
    <TextInput
      style={[styles.input, { color: c.inputText }]}
      value={value}
      onChangeText={(t) => onChangeText(sanitize(t))}
      keyboardType="decimal-pad"
      placeholder="0"
      placeholderTextColor={c.inputPlaceholder}
      selectTextOnFocus
      maxLength={MAX_INT_DIGITS + 1 + MAX_DECIMAL_DIGITS}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    fontSize: 48,
    fontWeight: '300',
    textAlign: 'center',
    paddingVertical: 16,
  },
});
