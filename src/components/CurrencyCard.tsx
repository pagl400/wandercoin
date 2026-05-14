import { forwardRef } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { useTheme } from '../theme/useTheme';
import { currencyToFlag } from '../utils/flags';

interface CurrencyCardProps {
  code: string;
  amount: string;
  displayValue: string;
  active: boolean;
  canClear?: boolean;
  onTap: () => void;
  onChangeText: (v: string) => void;
  onTapCurrency: () => void;
  onClear?: () => void;
}

const MAX_INT_DIGITS = 12;
const MAX_DECIMAL_DIGITS = 4;

function sanitize(input: string): string {
  const cleaned = input.replace(/[^\d.,]/g, '');
  const sepIdx = cleaned.search(/[.,]/);
  if (sepIdx === -1) return cleaned.slice(0, MAX_INT_DIGITS);
  const intPart = cleaned.slice(0, sepIdx).slice(0, MAX_INT_DIGITS);
  const decPart = cleaned
    .slice(sepIdx + 1)
    .replace(/[.,]/g, '')
    .slice(0, MAX_DECIMAL_DIGITS);
  return `${intPart}${cleaned[sepIdx]}${decPart}`;
}

export const CurrencyCard = forwardRef<TextInput, CurrencyCardProps>(function CurrencyCard(
  { code, amount, displayValue, active, canClear = false, onTap, onChangeText, onTapCurrency, onClear },
  ref,
) {
  const c = useTheme();
  const isAndroid = c.platform === 'android';
  const cardRadius = isAndroid ? 20 : 16;
  const innerRadius = isAndroid ? 14 : 12;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: c.surface,
          borderRadius: cardRadius,
          borderColor: active ? c.accent : 'transparent',
        },
      ]}
    >
      <Pressable
        onPress={onTapCurrency}
        accessibilityRole="button"
        accessibilityLabel={`Change ${code} currency`}
        style={({ pressed }) => [
          styles.currencyBtn,
          {
            backgroundColor: c.surfaceAlt,
            borderRadius: innerRadius,
            opacity: pressed ? 0.7 : 1,
          },
        ]}
      >
        <Text style={styles.flag}>{currencyToFlag(code)}</Text>
        <Text style={[styles.code, { color: c.text }]}>{code}</Text>
        <Svg width={10} height={10} viewBox="0 0 10 10" fill="none">
          <Path
            d="M2 4l3 3 3-3"
            stroke={c.textSec}
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </Pressable>

      <View style={styles.amountWrap}>
        {active ? (
          <TextInput
            ref={ref}
            value={amount}
            onChangeText={(t) => onChangeText(sanitize(t))}
            onFocus={onTap}
            keyboardType="decimal-pad"
            selectTextOnFocus
            maxLength={MAX_INT_DIGITS + 1 + MAX_DECIMAL_DIGITS}
            style={[styles.amountInput, { color: c.text }]}
            placeholder="0"
            placeholderTextColor={c.textTer}
            allowFontScaling={false}
          />
        ) : (
          <Pressable
            onPress={onTap}
            accessibilityRole="button"
            accessibilityLabel={`Edit ${code} amount`}
            style={styles.amountReadout}
          >
            <Text
              style={[styles.amountText, { color: c.text }]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.6}
              allowFontScaling={false}
            >
              {displayValue}
            </Text>
          </Pressable>
        )}
        {active && canClear ? (
          <Pressable
            onPress={onClear}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Clear amount"
            style={[styles.clearBtn, { backgroundColor: c.surfaceHi }]}
          >
            <Svg width={10} height={10} viewBox="0 0 10 10" fill="none">
              <Path
                d="M1 1l8 8M9 1l-8 8"
                stroke={c.textSec}
                strokeWidth={1.8}
                strokeLinecap="round"
              />
            </Svg>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 18,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    minHeight: 88,
  },
  currencyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingLeft: 8,
    paddingRight: 10,
  },
  flag: { fontSize: 26, lineHeight: 28 },
  code: { fontSize: 16, fontWeight: '600', letterSpacing: 0.2 },
  amountWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    minWidth: 0,
  },
  amountInput: {
    flex: 1,
    fontSize: 28,
    fontWeight: '600',
    letterSpacing: -0.5,
    textAlign: 'right',
    padding: 0,
    minWidth: 0,
  },
  amountReadout: { flex: 1, minWidth: 0 },
  amountText: {
    fontSize: 28,
    fontWeight: '600',
    letterSpacing: -0.5,
    textAlign: 'right',
  },
  clearBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});
