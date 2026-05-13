import { StyleSheet, TextInput } from 'react-native';

interface AmountInputProps {
  value: string;
  onChangeText: (v: string) => void;
}

function sanitize(input: string): string {
  const cleaned = input.replace(/[^\d.,]/g, '');
  const firstSep = cleaned.search(/[.,]/);
  if (firstSep === -1) return cleaned;
  return cleaned.slice(0, firstSep + 1) + cleaned.slice(firstSep + 1).replace(/[.,]/g, '');
}

export function AmountInput({ value, onChangeText }: AmountInputProps) {
  return (
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={(t) => onChangeText(sanitize(t))}
      keyboardType="decimal-pad"
      placeholder="0"
      selectTextOnFocus
    />
  );
}

const styles = StyleSheet.create({
  input: {
    fontSize: 48,
    fontWeight: '300',
    textAlign: 'center',
    paddingVertical: 16,
    color: '#111',
  },
});
