import React, { useState, useMemo, useCallback } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 12px;

  .material-symbols-outlined {
    color: #6200ee;
  }
`;

const Description = styled.p`
  margin: 0;
  color: #666;
  font-size: 14px;
`;

const Card = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 24px;
`;

const FormRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const Label = styled.label`
  font-size: 14px;
  color: #666;
  min-width: 100px;
  text-align: right;

  @media (max-width: 600px) {
    text-align: left;
  }
`;

const ColorPickerWrapper = styled.div`
  flex: 1;
  position: relative;
`;

const ColorPreview = styled.div<{ $color: string }>`
  width: 100%;
  height: 48px;
  background: ${props => props.$color};
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 2px solid rgba(0, 0, 0, 0.1);
  transition: border-color 0.2s;

  &:hover {
    border-color: rgba(0, 0, 0, 0.2);
  }
`;

const ColorPreviewText = styled.span<{ $light: boolean }>`
  font-family: 'Courier New', monospace;
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.$light ? 'white' : 'rgba(0, 0, 0, 0.7)'};
  text-shadow: ${props => props.$light ? '0 1px 2px rgba(0,0,0,0.3)' : 'none'};
`;

const HiddenColorInput = styled.input`
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  cursor: pointer;
`;

const InputWrapper = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Input = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  background: white;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #6200ee;
  }
`;

const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  color: #666;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;

  &:hover {
    background: #e0e0e0;
    color: #333;
  }

  .material-symbols-outlined {
    font-size: 20px;
  }
`;

const CopyFeedback = styled.span`
  font-size: 12px;
  color: #2e7d32;
  position: absolute;
  right: 90px;
`;

// CSS Named Colors
const CSS_COLORS: Record<string, string> = {
  aliceblue: '#f0f8ff', antiquewhite: '#faebd7', aqua: '#00ffff', aquamarine: '#7fffd4',
  azure: '#f0ffff', beige: '#f5f5dc', bisque: '#ffe4c4', black: '#000000',
  blanchedalmond: '#ffebcd', blue: '#0000ff', blueviolet: '#8a2be2', brown: '#a52a2a',
  burlywood: '#deb887', cadetblue: '#5f9ea0', chartreuse: '#7fff00', chocolate: '#d2691e',
  coral: '#ff7f50', cornflowerblue: '#6495ed', cornsilk: '#fff8dc', crimson: '#dc143c',
  cyan: '#00ffff', darkblue: '#00008b', darkcyan: '#008b8b', darkgoldenrod: '#b8860b',
  darkgray: '#a9a9a9', darkgreen: '#006400', darkkhaki: '#bdb76b', darkmagenta: '#8b008b',
  darkolivegreen: '#556b2f', darkorange: '#ff8c00', darkorchid: '#9932cc', darkred: '#8b0000',
  darksalmon: '#e9967a', darkseagreen: '#8fbc8f', darkslateblue: '#483d8b', darkslategray: '#2f4f4f',
  darkturquoise: '#00ced1', darkviolet: '#9400d3', deeppink: '#ff1493', deepskyblue: '#00bfff',
  dimgray: '#696969', dodgerblue: '#1e90ff', firebrick: '#b22222', floralwhite: '#fffaf0',
  forestgreen: '#228b22', fuchsia: '#ff00ff', gainsboro: '#dcdcdc', ghostwhite: '#f8f8ff',
  gold: '#ffd700', goldenrod: '#daa520', gray: '#808080', green: '#008000',
  greenyellow: '#adff2f', honeydew: '#f0fff0', hotpink: '#ff69b4', indianred: '#cd5c5c',
  indigo: '#4b0082', ivory: '#fffff0', khaki: '#f0e68c', lavender: '#e6e6fa',
  lavenderblush: '#fff0f5', lawngreen: '#7cfc00', lemonchiffon: '#fffacd', lightblue: '#add8e6',
  lightcoral: '#f08080', lightcyan: '#e0ffff', lightgoldenrodyellow: '#fafad2', lightgray: '#d3d3d3',
  lightgreen: '#90ee90', lightpink: '#ffb6c1', lightsalmon: '#ffa07a', lightseagreen: '#20b2aa',
  lightskyblue: '#87cefa', lightslategray: '#778899', lightsteelblue: '#b0c4de', lightyellow: '#ffffe0',
  lime: '#00ff00', limegreen: '#32cd32', linen: '#faf0e6', magenta: '#ff00ff',
  maroon: '#800000', mediumaquamarine: '#66cdaa', mediumblue: '#0000cd', mediumorchid: '#ba55d3',
  mediumpurple: '#9370db', mediumseagreen: '#3cb371', mediumslateblue: '#7b68ee', mediumspringgreen: '#00fa9a',
  mediumturquoise: '#48d1cc', mediumvioletred: '#c71585', midnightblue: '#191970', mintcream: '#f5fffa',
  mistyrose: '#ffe4e1', moccasin: '#ffe4b5', navajowhite: '#ffdead', navy: '#000080',
  oldlace: '#fdf5e6', olive: '#808000', olivedrab: '#6b8e23', orange: '#ffa500',
  orangered: '#ff4500', orchid: '#da70d6', palegoldenrod: '#eee8aa', palegreen: '#98fb98',
  paleturquoise: '#afeeee', palevioletred: '#db7093', papayawhip: '#ffefd5', peachpuff: '#ffdab9',
  peru: '#cd853f', pink: '#ffc0cb', plum: '#dda0dd', powderblue: '#b0e0e6',
  purple: '#800080', rebeccapurple: '#663399', red: '#ff0000', rosybrown: '#bc8f8f',
  royalblue: '#4169e1', saddlebrown: '#8b4513', salmon: '#fa8072', sandybrown: '#f4a460',
  seagreen: '#2e8b57', seashell: '#fff5ee', sienna: '#a0522d', silver: '#c0c0c0',
  skyblue: '#87ceeb', slateblue: '#6a5acd', slategray: '#708090', snow: '#fffafa',
  springgreen: '#00ff7f', steelblue: '#4682b4', tan: '#d2b48c', teal: '#008080',
  thistle: '#d8bfd8', tomato: '#ff6347', turquoise: '#40e0d0', violet: '#ee82ee',
  wheat: '#f5deb3', white: '#ffffff', whitesmoke: '#f5f5f5', yellow: '#ffff00',
  yellowgreen: '#9acd32',
};

// Reverse lookup: hex to name
const HEX_TO_NAME: Record<string, string> = Object.fromEntries(
  Object.entries(CSS_COLORS).map(([name, hex]) => [hex.toLowerCase(), name])
);

// Color conversion utilities
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : null;
};

const rgbToHex = (r: number, g: number, b: number): string => {
  return '#' + [r, g, b].map(x => {
    const hex = Math.round(Math.max(0, Math.min(255, x))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
};

const rgbToHsl = (r: number, g: number, b: number): { h: number; s: number; l: number } => {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
};

const hslToRgb = (h: number, s: number, l: number): { r: number; g: number; b: number } => {
  h /= 360; s /= 100; l /= 100;
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
};

const rgbToHwb = (r: number, g: number, b: number): { h: number; w: number; b: number } => {
  const hsl = rgbToHsl(r, g, b);
  const w = Math.min(r, g, b) / 255 * 100;
  const bl = (1 - Math.max(r, g, b) / 255) * 100;
  return { h: hsl.h, w: Math.round(w), b: Math.round(bl) };
};

const rgbToLch = (r: number, g: number, b: number): { l: number; c: number; h: number } => {
  // RGB to XYZ
  let rr = r / 255, gg = g / 255, bb = b / 255;
  rr = rr > 0.04045 ? Math.pow((rr + 0.055) / 1.055, 2.4) : rr / 12.92;
  gg = gg > 0.04045 ? Math.pow((gg + 0.055) / 1.055, 2.4) : gg / 12.92;
  bb = bb > 0.04045 ? Math.pow((bb + 0.055) / 1.055, 2.4) : bb / 12.92;
  rr *= 100; gg *= 100; bb *= 100;

  const x = rr * 0.4124564 + gg * 0.3575761 + bb * 0.1804375;
  const y = rr * 0.2126729 + gg * 0.7151522 + bb * 0.0721750;
  const z = rr * 0.0193339 + gg * 0.1191920 + bb * 0.9503041;

  // XYZ to Lab
  const xn = 95.047, yn = 100.000, zn = 108.883;
  const f = (t: number) => t > 0.008856 ? Math.pow(t, 1/3) : (7.787 * t) + (16 / 116);

  const fx = f(x / xn);
  const fy = f(y / yn);
  const fz = f(z / zn);

  const L = (116 * fy) - 16;
  const a = 500 * (fx - fy);
  const bVal = 200 * (fy - fz);

  // Lab to LCH
  const C = Math.sqrt(a * a + bVal * bVal);
  let H = Math.atan2(bVal, a) * (180 / Math.PI);
  if (H < 0) H += 360;

  return { l: parseFloat(L.toFixed(2)), c: parseFloat(C.toFixed(2)), h: parseFloat(H.toFixed(2)) };
};

const rgbToCmyk = (r: number, g: number, b: number): { c: number; m: number; y: number; k: number } => {
  const rr = r / 255, gg = g / 255, bb = b / 255;
  const k = 1 - Math.max(rr, gg, bb);
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };

  const c = (1 - rr - k) / (1 - k);
  const m = (1 - gg - k) / (1 - k);
  const y = (1 - bb - k) / (1 - k);

  return {
    c: Math.round(c * 100),
    m: Math.round(m * 100),
    y: Math.round(y * 100),
    k: Math.round(k * 100),
  };
};

// Check if color is light (for text contrast)
const isLightColor = (r: number, g: number, b: number): boolean => {
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
};

// Parse any color format to RGB
const parseColor = (input: string): { r: number; g: number; b: number } | null => {
  const trimmed = input.trim().toLowerCase();

  // Check CSS color name
  if (CSS_COLORS[trimmed]) {
    return hexToRgb(CSS_COLORS[trimmed]);
  }

  // Check hex
  if (/^#?[a-f0-9]{6}$/i.test(trimmed)) {
    return hexToRgb(trimmed);
  }
  if (/^#?[a-f0-9]{3}$/i.test(trimmed)) {
    const hex = trimmed.replace('#', '');
    const full = hex.split('').map(c => c + c).join('');
    return hexToRgb(full);
  }

  // Check rgb()
  const rgbMatch = trimmed.match(/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/);
  if (rgbMatch) {
    return { r: parseInt(rgbMatch[1]), g: parseInt(rgbMatch[2]), b: parseInt(rgbMatch[3]) };
  }

  // Check hsl()
  const hslMatch = trimmed.match(/^hsl\s*\(\s*(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?\s*\)$/);
  if (hslMatch) {
    return hslToRgb(parseInt(hslMatch[1]), parseInt(hslMatch[2]), parseInt(hslMatch[3]));
  }

  return null;
};

export const ColorConverterTool: React.FC = () => {
  const [hex, setHex] = useState('#1ea54c');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const rgb = useMemo(() => hexToRgb(hex), [hex]);

  const formats = useMemo(() => {
    if (!rgb) return null;
    const { r, g, b } = rgb;
    const hsl = rgbToHsl(r, g, b);
    const hwb = rgbToHwb(r, g, b);
    const lch = rgbToLch(r, g, b);
    const cmyk = rgbToCmyk(r, g, b);
    const name = HEX_TO_NAME[hex.toLowerCase()] || '';

    return {
      hex: hex.toLowerCase(),
      rgb: `rgb(${r}, ${g}, ${b})`,
      hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
      hwb: `hwb(${hwb.h} ${hwb.w}% ${hwb.b}%)`,
      lch: `lch(${lch.l}% ${lch.c} ${lch.h})`,
      cmyk: `device-cmyk(${cmyk.c}% ${cmyk.m}% ${cmyk.y}% ${cmyk.k}%)`,
      name,
    };
  }, [rgb, hex]);

  const isLight = useMemo(() => {
    if (!rgb) return false;
    return isLightColor(rgb.r, rgb.g, rgb.b);
  }, [rgb]);

  const handleColorPickerChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setHex(e.target.value);
  }, []);

  const handleInputChange = useCallback((field: string, value: string) => {
    if (field === 'hex') {
      if (/^#[a-f0-9]{6}$/i.test(value)) {
        setHex(value);
      }
    } else {
      const parsed = parseColor(value);
      if (parsed) {
        setHex(rgbToHex(parsed.r, parsed.g, parsed.b));
      }
    }
  }, []);

  const handleClear = useCallback(() => {
    // Reset to default color
    setHex('#1ea54c');
  }, []);

  const handleCopy = useCallback(async (field: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1500);
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = value;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1500);
    }
  }, []);

  const fields = [
    { key: 'hex', label: 'hex' },
    { key: 'rgb', label: 'rgb' },
    { key: 'hsl', label: 'hsl' },
    { key: 'hwb', label: 'hwb' },
    { key: 'lch', label: 'lch' },
    { key: 'cmyk', label: 'cmyk' },
    { key: 'name', label: 'name' },
  ];

  return (
    <Container>
      <div>
        <Title>
          <span className="material-symbols-outlined">palette</span>
          Color Converter
        </Title>
        <Description>
          Convert colors between different formats (hex, rgb, hsl and css name)
        </Description>
      </div>

      <Card>
        <FormRow>
          <Label>color picker:</Label>
          <ColorPickerWrapper>
            <ColorPreview $color={hex}>
              <ColorPreviewText $light={isLight}>{hex}</ColorPreviewText>
            </ColorPreview>
            <HiddenColorInput
              type="color"
              value={hex}
              onChange={handleColorPickerChange}
            />
          </ColorPickerWrapper>
        </FormRow>

        {formats && fields.map(({ key, label }) => (
          <FormRow key={key}>
            <Label>{label}:</Label>
            <InputWrapper style={{ position: 'relative' }}>
              <Input
                value={formats[key as keyof typeof formats]}
                onChange={(e) => handleInputChange(key, e.target.value)}
                placeholder={key === 'name' ? 'No matching CSS color name' : ''}
              />
              {copiedField === key && <CopyFeedback>Copied!</CopyFeedback>}
              <IconButton onClick={() => handleClear()} title="Clear">
                <span className="material-symbols-outlined">close</span>
              </IconButton>
              <IconButton
                onClick={() => handleCopy(key, formats[key as keyof typeof formats])}
                title="Copy"
              >
                <span className="material-symbols-outlined">content_copy</span>
              </IconButton>
            </InputWrapper>
          </FormRow>
        ))}
      </Card>
    </Container>
  );
};
