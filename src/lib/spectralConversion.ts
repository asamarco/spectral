// CIE 1931 Color Matching Functions and Spectral to RGB Conversion
// Based on the algorithm from https://scipython.com/blog/converting-a-spectrum-to-a-colour/

// Standard illuminants spectral power distributions (380-780nm, 5nm intervals)
const ILLUMINANTS = {
  D65: { // Daylight illuminant (6500K)
    name: "D65 (Daylight 6500K)",
    spd: [
      49.98, 52.31, 54.65, 68.70, 82.75, 87.12, 91.49, 92.46, 93.43,
      90.06, 86.68, 95.77, 104.86, 110.94, 117.01, 117.41, 117.81, 116.34,
      114.86, 115.39, 115.92, 112.37, 108.81, 109.08, 109.35, 108.58, 107.80,
      106.30, 104.79, 106.24, 107.69, 106.05, 104.41, 104.22, 104.05, 102.02,
      100.00, 98.17, 96.33, 96.06, 95.79, 92.24, 88.69, 89.35, 90.01,
      89.80, 89.60, 88.65, 87.70, 85.49, 83.29, 83.49, 83.70, 81.86,
      80.03, 80.12, 80.21, 81.25, 82.28, 80.28, 78.28, 74.00, 69.72,
      70.67, 71.61, 72.98, 74.35, 67.98, 61.60, 65.74, 69.89, 72.49,
      75.09, 69.34, 63.59, 55.01, 46.42, 56.61, 66.81, 65.09, 63.38
    ]
  },
  A: { // Incandescent illuminant (2856K)
    name: "A (Incandescent 2856K)",
    spd: [
      9.80, 10.90, 12.09, 13.35, 14.71, 16.15, 17.68, 19.29, 21.00,
      22.79, 24.67, 26.64, 28.70, 30.85, 33.09, 35.41, 37.81, 40.30,
      42.87, 45.52, 48.24, 51.04, 53.91, 56.85, 59.86, 62.93, 66.06,
      69.25, 72.50, 75.79, 79.13, 82.52, 85.95, 89.41, 92.91, 96.44,
      100.00, 103.58, 107.18, 110.80, 114.44, 118.08, 121.73, 125.39, 129.04,
      132.70, 136.35, 139.99, 143.62, 147.24, 150.84, 154.42, 157.98, 161.52,
      165.03, 168.51, 171.96, 175.38, 178.77, 182.12, 185.43, 188.70, 191.93,
      195.12, 198.26, 201.36, 204.41, 207.41, 210.37, 213.27, 216.12, 218.92,
      221.67, 224.36, 227.00, 229.59, 232.12, 234.59, 237.01, 239.37, 241.67
    ]
  },
  C: { // Average daylight (6774K)
    name: "C (Average Daylight 6774K)",
    spd: [
      31.34, 37.91, 45.01, 52.39, 60.11, 68.20, 76.54, 85.02, 93.16,
      100.47, 106.74, 111.82, 115.38, 117.24, 117.76, 117.38, 116.90, 117.09,
      117.57, 117.84, 117.66, 116.73, 114.62, 111.02, 106.46, 101.60, 97.15,
      93.84, 92.02, 91.91, 93.07, 94.91, 96.96, 98.72, 99.91, 100.35,
      100.00, 98.87, 97.15, 95.11, 92.88, 90.63, 88.51, 86.63, 85.19,
      84.36, 83.95, 83.75, 83.67, 83.63, 83.57, 83.44, 83.38, 83.56,
      83.76, 83.76, 83.48, 82.83, 81.96, 81.01, 79.77, 78.07, 76.16,
      74.30, 72.46, 70.62, 68.76, 66.86, 64.86, 62.96, 61.16, 59.64,
      58.40, 57.17, 56.22, 55.56, 55.18, 55.08, 55.27, 55.56, 56.13
    ]
  },
  F2: { // Cool white fluorescent (4230K)
    name: "F2 (Cool White Fluorescent 4230K)",
    spd: [
      7.30, 9.16, 11.39, 13.30, 21.29, 97.09, 23.82, 23.14, 25.93,
      28.59, 31.31, 216.46, 73.08, 38.80, 41.03, 42.88, 44.49, 45.79,
      46.66, 47.15, 47.34, 47.15, 47.15, 46.10, 45.05, 44.25, 43.63,
      43.56, 44.31, 46.23, 49.75, 54.95, 61.94, 153.96, 102.97, 90.28,
      100.00, 108.66, 115.22, 132.86, 141.03, 119.37, 115.47, 109.72, 102.35,
      94.12, 85.40, 76.49, 67.76, 59.72, 51.98, 45.30, 39.05, 33.60,
      28.96, 24.88, 21.35, 18.32, 15.78, 13.55, 11.70, 10.15, 9.47,
      7.86, 6.81, 6.13, 5.45, 4.70, 4.21, 3.77, 3.47, 3.34,
      3.16, 2.91, 2.91, 2.66, 2.85, 2.91, 2.48, 2.04, 1.67
    ]
  },
  F11: { // Narrow-band tri-phosphor (4000K)
    name: "F11 (Tri-phosphor 4000K)",
    spd: [
      32.16, 22.26, 16.25, 13.07, 45.58, 448.06, 56.18, 63.25, 86.93,
      117.67, 158.66, 1199.29, 428.62, 245.58, 254.06, 251.59, 237.46, 216.61,
      192.93, 169.26, 200.00, 504.95, 528.62, 316.96, 166.78, 82.33, 51.94,
      38.87, 31.45, 29.33, 41.70, 173.14, 1398.94, 2573.85, 1152.30, 265.72,
      100.00, 69.26, 59.01, 156.54, 398.59, 521.55, 449.82, 344.17, 259.01,
      343.46, 1953.00, 1504.59, 465.72, 465.02, 433.22, 180.57, 73.14, 82.69,
      126.50, 106.36, 87.63, 75.62, 54.42, 47.00, 51.59, 68.55, 70.67,
      42.40, 47.70, 144.88, 197.17, 88.69, 20.14, 9.54, 8.13, 7.42,
      8.48, 8.48, 7.07, 8.48, 11.31, 9.19, 5.65, 4.24, 3.18
    ]
  }
};

export type IlluminantType = keyof typeof ILLUMINANTS;

// Observer types
export type ObserverType = '2' | '10';

// CIE 1931 2-degree observer color matching functions (380-780nm, 5nm intervals)
const CIE_CMF_DATA_2DEG = {
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

// CIE 1964 10-degree observer color matching functions (loaded from official CIE CSV, sampled to 5nm)
import cmf10Csv from './data/cie_xyz_1964_10deg.csv?raw';

interface CMFRow { wavelength: number; x: number; y: number; z: number }
function parseCIE1964CSV(csv: string): CMFRow[] {
  return csv
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('#'))
    .map(line => line.split(/[;,\t]/).map(s => s.trim()))
    .filter(cols => cols.length >= 4 && !isNaN(Number(cols[0])))
    .map(cols => ({
      wavelength: Number(cols[0]),
      x: Number(cols[1]),
      y: Number(cols[2]),
      z: Number(cols[3]),
    }))
    .filter(r => !Number.isNaN(r.wavelength) && !Number.isNaN(r.x) && !Number.isNaN(r.y) && !Number.isNaN(r.z));
}

const CMF10_ALL = parseCIE1964CSV(cmf10Csv);
const CMF10_5NM = CMF10_ALL.filter(r => r.wavelength >= 380 && r.wavelength <= 780 && r.wavelength % 5 === 0);

const CIE_CMF_DATA_10DEG = {
  wavelengths: CMF10_5NM.map(r => r.wavelength),
  x: CMF10_5NM.map(r => r.x),
  y: CMF10_5NM.map(r => r.y),
  z: CMF10_5NM.map(r => r.z),
};

export interface SpectralData {
  wavelength: number;
  intensity: number;
  group?: number;
}

export interface ColorResult {
  rgb: [number, number, number];
  xyz: [number, number, number];
  chromaticity: [number, number];
  lab: [number, number, number];  // CIE L*, a*, b* (relative to the selected illuminant white)
  lch: [number, number, number];  // CIE L*, C*ab, h°ab (h in degrees, 0-360)
  hex: string;
  normalizedRgb: [number, number, number];
  normalizedHex: string;
  illuminant: IlluminantType;
  observer: ObserverType;
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
function getCMF(wavelength: number, observer: ObserverType = '2'): [number, number, number] {
  const cmfData = observer === '10' ? CIE_CMF_DATA_10DEG : CIE_CMF_DATA_2DEG;
  const x = interpolate(wavelength, cmfData.wavelengths, cmfData.x);
  const y = interpolate(wavelength, cmfData.wavelengths, cmfData.y);
  const z = interpolate(wavelength, cmfData.wavelengths, cmfData.z);
  return [x, y, z];
}

// Get illuminant SPD for a given wavelength
function getIlluminantSPD(wavelength: number, illuminant: IlluminantType): number {
  const illuminantData = ILLUMINANTS[illuminant];
  return interpolate(wavelength, CIE_CMF_DATA_2DEG.wavelengths, illuminantData.spd);
}

// Tristimulus values of the perfect white (reflectance = 1) for an illuminant/observer pair,
// integrated at 1 nm exactly like the sample spectrum (units: SPD x CMF x nm)
function getWhitePoint(illuminant: IlluminantType, observer: ObserverType): [number, number, number] {
  let whiteX = 0, whiteY = 0, whiteZ = 0;
  for (let λ = 380; λ <= 780; λ += 1) {
    const spd = getIlluminantSPD(λ, illuminant);
    const [cmfX, cmfY, cmfZ] = getCMF(λ, observer);
    whiteX += spd * cmfX;
    whiteY += spd * cmfY;
    whiteZ += spd * cmfZ;
  }
  return [whiteX, whiteY, whiteZ];
}

// CIE 1976 L*a*b* and its cylindrical form L*C*h° from XYZ and the white point of the same
// illuminant/observer (so L* = 100 for a perfect reflector, whichever illuminant is selected)
function xyzToLabLch(
  X: number, Y: number, Z: number,
  white: [number, number, number]
): { lab: [number, number, number]; lch: [number, number, number] } {
  const delta = 6 / 29;
  const f = (t: number) => (t > delta ** 3 ? Math.cbrt(t) : t / (3 * delta ** 2) + 4 / 29);
  const fx = f(X / white[0]);
  const fy = f(Y / white[1]);
  const fz = f(Z / white[2]);
  const L = 116 * fy - 16;
  const a = 500 * (fx - fy);
  const b = 200 * (fy - fz);
  const C = Math.hypot(a, b);
  let h = (Math.atan2(b, a) * 180) / Math.PI;
  if (h < 0) h += 360;
  return { lab: [L, a, b], lch: [L, C, h] };
}

// Convert XYZ to sRGB (with illuminant-specific white point normalization)
function xyzToRgb(X: number, Y: number, Z: number, illuminant: IlluminantType, observer: ObserverType = '2', applyGammaCorrection: boolean = true): [number, number, number] {
  console.log('XYZ input values:', { X, Y, Z });
  
  // Illuminant white point for normalization
  const [whiteX, whiteY, whiteZ] = getWhitePoint(illuminant, observer);
  
  // Normalize by the white point to get relative XYZ (0..1)
  const normalizedX = X / whiteX;
  const normalizedY = Y / whiteY;
  const normalizedZ = Z / whiteZ;
  
  console.log('Normalized XYZ:', { normalizedX, normalizedY, normalizedZ });
  
  // The sRGB matrix expects XYZ whose white is D65 (0.95047, 1, 1.08883). Relative XYZ above has
  // white = (1, 1, 1) for whatever illuminant is selected, so scale it to the sRGB white first
  // (XYZ-scaling adaptation): a perfect reflector then maps to RGB (255, 255, 255) and greys stay neutral.
  const sx = normalizedX * 0.95047;
  const sy = normalizedY;
  const sz = normalizedZ * 1.08883;
  
  // Convert to linear sRGB using the standard matrix (D65)
  let r = 3.2406 * sx - 1.5372 * sy - 0.4986 * sz;
  let g = -0.9689 * sx + 1.8758 * sy + 0.0415 * sz;
  let b = 0.0557 * sx - 0.2040 * sy + 1.0570 * sz;
  
  console.log('Linear RGB before gamma:', { r, g, b });
  
  // Gamma correction (sRGB standard) - optional
  if (applyGammaCorrection) {
    function gammaCorrect(c: number): number {
      if (c <= 0.0031308) {
        return 12.92 * c;
      } else {
        return 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
      }
    }
    
    r = gammaCorrect(r);
    g = gammaCorrect(g);
    b = gammaCorrect(b);
    
    console.log('Gamma corrected RGB:', { r, g, b });
  } else {
    console.log('Skipping gamma correction');
  }
  
  // Clamp to valid range and scale to 0-255
  r = Math.max(0, Math.min(1, r)) * 255;
  g = Math.max(0, Math.min(1, g)) * 255;
  b = Math.max(0, Math.min(1, b)) * 255;
  
  const result = [Math.round(r), Math.round(g), Math.round(b)] as [number, number, number];
  console.log('Final RGB:', result);
  
  return result;
}

// Convert RGB to hex
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = Math.round(x).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

// Main conversion function for a specific group
export function convertSpectrumToColor(
  spectralData: SpectralData[], 
  group?: number, 
  illuminant: IlluminantType = 'D65',
  observer: ObserverType = '2',
  applyGammaCorrection: boolean = true
): ColorResult | null {
  if (!spectralData || spectralData.length === 0) return null;
  
  // Filter data for specific group if provided
  const filteredData = group !== undefined 
    ? spectralData.filter(d => d.group === group)
    : spectralData;
  
  if (filteredData.length === 0) return null;
  
  console.log('Input spectral data:', filteredData.slice(0, 5)); // Log first 5 points
  
  // Calculate tristimulus values by integrating over the spectrum
  let X = 0, Y = 0, Z = 0;
  let totalPoints = 0;
  
  for (let i = 0; i < filteredData.length - 1; i++) {
    const λ1 = filteredData[i].wavelength;
    const λ2 = filteredData[i + 1].wavelength;
    const I1 = filteredData[i].intensity;
    const I2 = filteredData[i + 1].intensity;
    
    if (λ1 >= 380 && λ2 <= 780) { // Visible spectrum range
      const dλ = λ2 - λ1;
      const avgIntensity = (I1 + I2) / 2;
      const avgWavelength = (λ1 + λ2) / 2;
      
      const [cmfX, cmfY, cmfZ] = getCMF(avgWavelength, observer);
      const illuminantSPD = getIlluminantSPD(avgWavelength, illuminant);
      
      const contributionX = avgIntensity * cmfX * illuminantSPD * dλ;
      const contributionY = avgIntensity * cmfY * illuminantSPD * dλ;
      const contributionZ = avgIntensity * cmfZ * illuminantSPD * dλ;
      
      X += contributionX;
      Y += contributionY;
      Z += contributionZ;
      
      totalPoints++;
      
      if (i < 3) { // Debug first few calculations
        console.log(`Point ${i}: λ=${avgWavelength.toFixed(1)}, I=${avgIntensity.toFixed(3)}, CMF=[${cmfX.toFixed(4)}, ${cmfY.toFixed(4)}, ${cmfZ.toFixed(4)}], Contrib=[${contributionX.toFixed(4)}, ${contributionY.toFixed(4)}, ${contributionZ.toFixed(4)}]`);
      }
    }
  }
  
  console.log(`Processed ${totalPoints} spectral intervals`);
  console.log('Raw XYZ totals:', { X, Y, Z });
  
  if (X + Y + Z === 0) {
    console.log('No XYZ values calculated - likely no data in visible range');
    return null;
  }
  
  // Normalize the XYZ values by the Y component (luminance normalization)
  const maxY = Math.max(Y, 1); // Avoid division by zero
  const normalizedX = X;
  const normalizedY = Y; 
  const normalizedZ = Z;
  
  console.log('Using XYZ values:', { X: normalizedX, Y: normalizedY, Z: normalizedZ });
  
  // Calculate chromaticity coordinates
  const total = normalizedX + normalizedY + normalizedZ;
  const x = normalizedX / total;
  const y = normalizedY / total;
  
  // CIELAB / LCh (relative to the white of the selected illuminant and observer)
  const { lab, lch } = xyzToLabLch(normalizedX, normalizedY, normalizedZ, getWhitePoint(illuminant, observer));
  
  // Convert to RGB
  const [r, g, b] = xyzToRgb(normalizedX, normalizedY, normalizedZ, illuminant, observer, applyGammaCorrection);
  const hex = rgbToHex(r, g, b);
  
  // Calculate normalized RGB (divide by max(R,G,B) and multiply by 255)
  const maxRgb = Math.max(r, g, b);
  const normalizedRgb: [number, number, number] = maxRgb > 0 
    ? [Math.round((r / maxRgb) * 255), Math.round((g / maxRgb) * 255), Math.round((b / maxRgb) * 255)]
    : [r, g, b];
  const normalizedHex = rgbToHex(normalizedRgb[0], normalizedRgb[1], normalizedRgb[2]);
  
  console.log('Final result:', { rgb: [r, g, b], hex, normalizedRgb, normalizedHex });
  
  return {
    rgb: [r, g, b],
    xyz: [normalizedX, normalizedY, normalizedZ],
    chromaticity: [x, y],
    lab,
    lch,
    hex,
    normalizedRgb,
    normalizedHex,
    illuminant,
    observer
  };
}

// Parse spectral data from text input
export function parseSpectralData(text: string): SpectralData[] {
  const lines = text.trim().split('\n');
  const data: SpectralData[] = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue; // Skip empty lines and comments
    
    // Handle various separators: tabs, spaces, commas, or any combination
    const parts = trimmed.split(/[\t\s,]+/).filter(part => part.length > 0);
    
    if (parts.length >= 2) {
      const wavelength = parseFloat(parts[0]);
      let intensity: number;
      let group: number | undefined;
      
      if (parts.length === 2) {
        // Two columns: wavelength, intensity
        intensity = parseFloat(parts[1]);
      } else {
        // Three or more columns: wavelength, group, ..., intensity (last column)
        group = parseInt(parts[1]);
        intensity = parseFloat(parts[parts.length - 1]);
      }
      
      if (!isNaN(wavelength) && !isNaN(intensity)) {
        const spectralPoint: SpectralData = { wavelength, intensity };
        if (group !== undefined && !isNaN(group)) {
          spectralPoint.group = group;
        }
        data.push(spectralPoint);
      }
    }
  }
  
  // Sort by group first, then by wavelength
  return data.sort((a, b) => {
    if (a.group !== b.group) {
      return (a.group || 0) - (b.group || 0);
    }
    return a.wavelength - b.wavelength;
  });
}

// A 0-1 fraction should not exceed 2, so larger values indicate percent
export function detectPercentReflectance(spectralData: SpectralData[]): boolean {
  return spectralData.some(d => d.intensity > 2);
}

export function toFractionalReflectance(spectralData: SpectralData[], isPercent: boolean): SpectralData[] {
  if (!isPercent) return spectralData;
  return spectralData.map(d => ({ ...d, intensity: d.intensity / 100 }));
}

// Get unique groups from spectral data
export function getGroups(spectralData: SpectralData[]): number[] {
  const groups = new Set<number>();
  spectralData.forEach(d => {
    if (d.group !== undefined) {
      groups.add(d.group);
    }
  });
  return Array.from(groups).sort((a, b) => a - b);
}

// Get available illuminants
export function getAvailableIlluminants(): { key: IlluminantType; name: string }[] {
  return Object.entries(ILLUMINANTS).map(([key, data]) => ({
    key: key as IlluminantType,
    name: data.name
  }));
}

// Get available observers
export function getAvailableObservers(): { key: ObserverType; name: string }[] {
  return [
    { key: '2', name: '2° Standard Observer (CIE 1931)' },
    { key: '10', name: '10° Standard Observer (CIE 1964)' }
  ];
}
