import Svg, { Circle, Defs, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';

import { useTheme } from '../theme/useTheme';

interface LogoProps {
  size?: number;
}

export function Logo({ size = 30 }: LogoProps) {
  const c = useTheme();
  const id = 'wc-logo-grad';
  return (
    <Svg width={size} height={size} viewBox="0 0 30 30">
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor={c.accent} stopOpacity={1} />
          <Stop offset="100%" stopColor={c.accent} stopOpacity={0.7} />
        </LinearGradient>
      </Defs>
      <Circle cx="15" cy="15" r="14" fill={`url(#${id})`} />
      <Circle cx="15" cy="15" r="11.5" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={1} />
      <SvgText
        x="15"
        y="15"
        dy="0.36em"
        textAnchor="middle"
        fontWeight="700"
        fontSize="14"
        fill="#ffffff"
      >
        W
      </SvgText>
    </Svg>
  );
}
