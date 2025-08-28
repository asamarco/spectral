// CIE 1931 Color Matching Functions and Spectral to RGB Conversion
// Based on the algorithm from https://scipython.com/blog/converting-a-spectrum-to-a-colour/

// CIE 1931 2-degree observer color matching functions (380-780nm, 5nm intervals)
const CIE_CMF_DATA = {
  wavelengths: Array.from({ length: 81 }, (_, i) => 380 + i * 5),
  x: [
    0.0014, 0.0022, 0.0042, 0.0076, 0.0143, 0.0232, 0.0435, 0.0776,
    0.1344, 0.2148, 0.2839, 0.3285, 0.3483, 0.3481, 0.3362, 0.3187,
    0.2908, 0.2511, 0.1954, 0.1421, 0.0956, 0.0580, 0.0320, 0.0147,
    0.0049, 0.0024, 0.0093, 0.0291, 0.0633, 0.1096, 0.1655, 0.2257,
    0.2904, 0.3597, 0.4334, 0.5121, 0.5945, 0.6784, 0.7621, 0.8425,
    0.9163, 0.9786, 1.0263, 1.0567, 1.0622, 1.0456, 1.0026, 0.9384,
    0.8544, 0.7514, 0.6424, 0.5419, 0.4479, 0.3608, 0.2835, 0.2187,
    0.1649, 0.1212, 0.0874, 0.0636, 0.0468, 0.0329, 0.0227, 0.0158,
    0.0114, 0.0081, 0.0058, 0.0041, 0.0029, 0.0020, 0.0014, 0.0010,
    0.0007, 0.0005, 0.0003, 0.0002, 0.0002, 0.0001, 0.0001, 0.0001, 0.0001
  ],
  y: [
    0.0000, 0.0001, 0.0001, 0.0002, 0.0004, 0.0006, 0.0012, 0.0022,
    0.0040, 0.0073, 0.0116, 0.0168, 0.0230, 0.0298, 0.0380, 0.0480,
    0.0600, 0.0739, 0.0910, 0.1126, 0.1390, 0.1693, 0.2080, 0.2586,
    0.3230, 0.4073, 0.5030, 0.6082, 0.7100, 0.7932, 0.8620, 0.9149,
    0.9540, 0.9803, 0.9949, 1.0000, 0.9950, 0.9786, 0.9520, 0.9154,
    0.8700, 0.8163, 0.7570, 0.6949, 0.6310, 0.5668, 0.5030, 0.4412,
    0.3810, 0.3210, 0.2650, 0.2170, 0.1750, 0.1382, 0.1070, 0.0816,
    0.0610, 0.0446, 0.0320, 0.0232, 0.0170, 0.0119, 0.0082, 0.0057,
    0.0041, 0.0029, 0.0021, 0.0015, 0.0010, 0.0007, 0.0005, 0.0004,
    0.0002, 0.0002, 0.0001, 0.0001, 0.0001, 0.0000, 0.0000, 0.0000, 0.0000
  ],
  z: [
    0.0065, 0.0105, 0.0201, 0.0362, 0.0679, 0.1102, 0.2074, 0.3713,
    0.6456, 1.0391, 1.3856, 1.6230, 1.7471, 1.7826, 1.7721, 1.7441,
    1.6692, 1.5281, 1.2876, 1.0419, 0.8130, 0.6162, 0.4652, 0.3533,
    0.2720, 0.2123, 0.1582, 0.1117, 0.0782, 0.0573, 0.0422, 0.0298,
    0.0203, 0.0134, 0.0087, 0.0057, 0.0039, 0.0027, 0.0021, 0.0018,
    0.0017, 0.0014, 0.0011, 0.0010, 0.0008, 0.0006, 0.0003, 0.0002,
    0.0002, 0.0001, 0.0001, 0.0001, 0.0000, 0.0000, 0.0000, 0.0000,
    0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000,
    0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000,
    0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000
  ]
};

export interface SpectralData {
  wavelength: number;
  intensity: number;
}

export interface ColorResult {
  rgb: [number, number, number];
  xyz: [number, number, number];
  chromaticity: [number, number];
  hex: string;
}

// Linear interpolation for color matching functions
function interpolate(wavelength: number, wavelengths: number[], values: number[]): number {
  if (wavelength <= wavelengths[0]) return values[0];
  if (wavelength >= wavelengths[wavelengths.length - 1]) return values[values.length - 1];
  
  for (let i = 0; i < wavelengths.length - 1; i++) {
    if (wavelength >= wavelengths[i] && wavelength <= wavelengths[i + 1]) {
      const t = (wavelength - wavelengths[i]) / (wavelengths[i + 1] - wavelengths[i]);
      return values[i] + t * (values[i + 1] - values[i]);
    }
  }
  return 0;
}

// Get CIE color matching function values for a given wavelength
function getCMF(wavelength: number): [number, number, number] {
  const x = interpolate(wavelength, CIE_CMF_DATA.wavelengths, CIE_CMF_DATA.x);
  const y = interpolate(wavelength, CIE_CMF_DATA.wavelengths, CIE_CMF_DATA.y);
  const z = interpolate(wavelength, CIE_CMF_DATA.wavelengths, CIE_CMF_DATA.z);
  return [x, y, z];
}

// Convert XYZ to sRGB
function xyzToRgb(X: number, Y: number, Z: number): [number, number, number] {
  // Normalize by Y (luminance)
  const x = X / (X + Y + Z);
  const y = Y / (X + Y + Z);
  
  // Convert to sRGB using standard matrix transformation
  let r = 3.2406 * X - 1.5372 * Y - 0.4986 * Z;
  let g = -0.9689 * X + 1.8758 * Y + 0.0415 * Z;
  let b = 0.0557 * X - 0.2040 * Y + 1.0570 * Z;
  
  // Gamma correction
  r = r > 0.0031308 ? 1.055 * Math.pow(r, 1 / 2.4) - 0.055 : 12.92 * r;
  g = g > 0.0031308 ? 1.055 * Math.pow(g, 1 / 2.4) - 0.055 : 12.92 * g;
  b = b > 0.0031308 ? 1.055 * Math.pow(b, 1 / 2.4) - 0.055 : 12.92 * b;
  
  // Clamp to valid range
  r = Math.max(0, Math.min(1, r));
  g = Math.max(0, Math.min(1, g));
  b = Math.max(0, Math.min(1, b));
  
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

// Convert RGB to hex
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = Math.round(x).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

// Main conversion function
export function convertSpectrumToColor(spectralData: SpectralData[]): ColorResult | null {
  if (!spectralData || spectralData.length === 0) return null;
  
  // Calculate tristimulus values by integrating over the spectrum
  let X = 0, Y = 0, Z = 0;
  
  for (let i = 0; i < spectralData.length - 1; i++) {
    const λ1 = spectralData[i].wavelength;
    const λ2 = spectralData[i + 1].wavelength;
    const I1 = spectralData[i].intensity;
    const I2 = spectralData[i + 1].intensity;
    
    if (λ1 >= 380 && λ2 <= 780) { // Visible spectrum range
      const dλ = λ2 - λ1;
      const avgIntensity = (I1 + I2) / 2;
      const avgWavelength = (λ1 + λ2) / 2;
      
      const [cmfX, cmfY, cmfZ] = getCMF(avgWavelength);
      
      X += avgIntensity * cmfX * dλ;
      Y += avgIntensity * cmfY * dλ;
      Z += avgIntensity * cmfZ * dλ;
    }
  }
  
  if (X + Y + Z === 0) return null;
  
  // Calculate chromaticity coordinates
  const total = X + Y + Z;
  const x = X / total;
  const y = Y / total;
  
  // Convert to RGB
  const [r, g, b] = xyzToRgb(X, Y, Z);
  const hex = rgbToHex(r, g, b);
  
  return {
    rgb: [r, g, b],
    xyz: [X, Y, Z],
    chromaticity: [x, y],
    hex
  };
}

// Parse spectral data from text input
export function parseSpectralData(text: string): SpectralData[] {
  const lines = text.trim().split('\n');
  const data: SpectralData[] = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue; // Skip empty lines and comments
    
    const parts = trimmed.split(/[\s,\t]+/);
    if (parts.length >= 2) {
      const wavelength = parseFloat(parts[0]);
      const intensity = parseFloat(parts[1]);
      
      if (!isNaN(wavelength) && !isNaN(intensity)) {
        data.push({ wavelength, intensity });
      }
    }
  }
  
  // Sort by wavelength
  return data.sort((a, b) => a.wavelength - b.wavelength);
}