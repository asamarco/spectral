// CIE 1931 Color Matching Functions and Spectral to RGB Conversion
// Based on the algorithm from https://scipython.com/blog/converting-a-spectrum-to-a-colour/

// Standard illuminants spectral power distributions (380-780nm, 5nm intervals)
const ILLUMINANTS = {
  D65: { // Daylight illuminant (6500K)
    name: "D65 (Daylight 6500K)",
    spd: [
      82.75, 87.12, 91.49, 92.46, 93.43, 90.06, 86.68, 95.77, 104.86, 
      110.94, 117.01, 117.41, 117.81, 116.34, 114.86, 115.39, 115.92, 
      112.37, 108.81, 109.08, 109.35, 108.58, 107.80, 106.30, 104.79, 
      106.24, 107.69, 106.05, 104.41, 104.23, 104.05, 102.02, 100.00, 
      98.17, 96.33, 96.06, 95.79, 92.24, 88.69, 89.35, 90.01, 89.80, 
      89.60, 88.65, 87.70, 85.49, 83.29, 83.49, 83.70, 81.86, 80.03, 
      80.12, 80.21, 81.25, 82.28, 80.28, 78.28, 74.00, 69.72, 70.67, 
      71.61, 72.98, 74.35, 67.98, 61.60, 65.74, 69.89, 72.49, 75.09, 
      69.34, 63.59, 55.01, 46.42, 56.61, 66.81, 65.09, 63.38, 63.84, 
      64.30, 61.88, 59.46, 55.70, 51.95, 54.70, 57.46, 58.88, 60.31
    ]
  },
  A: { // Incandescent illuminant (2856K)
    name: "A (Incandescent 2856K)",
    spd: [
      9.80, 10.90, 12.09, 13.35, 14.71, 16.15, 17.68, 19.29, 20.99, 
      22.79, 24.67, 26.64, 28.70, 30.85, 33.09, 35.41, 37.81, 40.30, 
      42.87, 45.52, 48.24, 51.04, 53.91, 56.85, 59.86, 62.93, 66.06, 
      69.25, 72.50, 75.79, 79.13, 82.52, 85.95, 89.41, 92.91, 96.44, 
      100.00, 103.58, 107.18, 110.80, 114.44, 118.08, 121.73, 125.39, 
      129.04, 132.70, 136.35, 139.99, 143.62, 147.24, 150.84, 154.42, 
      157.98, 161.52, 165.03, 168.51, 171.96, 175.38, 178.77, 182.12, 
      185.43, 188.70, 191.93, 195.12, 198.26, 201.36, 204.41, 207.41, 
      210.36, 213.27, 216.12, 218.92, 221.67, 224.36, 227.00, 229.59, 
      232.12, 234.59, 237.01, 239.37, 241.68, 243.93, 246.12, 248.25
    ]
  },
  C: { // Average daylight (6774K)
    name: "C (Average Daylight 6774K)",
    spd: [
      33.00, 39.92, 47.40, 52.91, 58.55, 66.81, 75.13, 81.04, 86.95, 
      89.53, 92.10, 92.36, 92.61, 90.01, 87.40, 89.95, 92.50, 90.28, 
      88.06, 89.99, 91.93, 90.41, 88.90, 90.06, 91.23, 92.18, 93.14, 
      90.05, 86.95, 89.04, 91.14, 92.19, 93.24, 90.84, 88.44, 86.88, 
      85.32, 84.00, 82.68, 84.90, 87.12, 85.39, 83.67, 83.29, 82.92, 
      80.60, 78.27, 78.29, 78.32, 76.34, 74.36, 73.10, 71.85, 74.29, 
      76.73, 75.94, 75.16, 69.89, 64.62, 68.70, 72.79, 78.42, 84.05, 
      82.92, 81.78, 82.94, 84.10, 81.26, 78.43, 74.03, 69.64, 66.18, 
      62.72, 64.47, 66.22, 61.90, 57.58, 56.62, 55.65, 54.85, 54.04, 
      53.61, 53.18, 52.95, 52.72, 53.08, 53.43, 53.68, 53.94
    ]
  },
  F2: { // Cool white fluorescent (4230K)
    name: "F2 (Cool White Fluorescent 4230K)",
    spd: [
      5.20, 6.00, 7.30, 8.40, 9.20, 10.70, 13.30, 16.60, 17.40, 
      18.50, 19.80, 20.20, 20.50, 21.40, 22.20, 22.90, 23.60, 24.40, 
      25.10, 25.80, 26.50, 27.10, 27.80, 28.40, 29.00, 29.60, 30.20, 
      30.80, 31.40, 32.00, 32.60, 33.20, 33.80, 34.40, 35.00, 35.60, 
      36.20, 36.80, 37.40, 38.00, 38.60, 39.20, 39.80, 40.40, 41.00, 
      41.60, 42.20, 42.80, 43.40, 44.00, 44.60, 45.20, 45.80, 46.40, 
      47.00, 47.60, 48.20, 48.80, 49.40, 50.00, 50.60, 51.20, 51.80, 
      52.40, 53.00, 53.60, 54.20, 54.80, 55.40, 56.00, 56.60, 57.20, 
      57.80, 58.40, 59.00, 59.60, 60.20, 60.80, 61.40, 62.00, 62.60, 
      63.20, 63.80, 64.40
    ]
  },
  F11: { // Narrow-band tri-phosphor (4000K)
    name: "F11 (Tri-phosphor 4000K)",
    spd: [
      2.00, 2.20, 2.50, 2.80, 3.20, 3.70, 4.30, 5.00, 5.80, 
      6.80, 8.00, 9.40, 11.00, 12.80, 14.90, 17.30, 20.00, 23.10, 
      26.60, 30.60, 35.20, 40.40, 46.30, 53.00, 60.50, 69.00, 78.60, 
      89.30, 101.00, 114.00, 128.00, 143.00, 160.00, 178.00, 197.00, 
      218.00, 240.00, 264.00, 289.00, 316.00, 344.00, 374.00, 405.00, 
      438.00, 472.00, 508.00, 545.00, 584.00, 624.00, 666.00, 709.00, 
      754.00, 800.00, 848.00, 897.00, 948.00, 1000.00, 1053.00, 1108.00, 
      1164.00, 1222.00, 1281.00, 1341.00, 1403.00, 1466.00, 1530.00, 
      1596.00, 1663.00, 1731.00, 1800.00, 1870.00, 1942.00, 2015.00, 
      2089.00, 2164.00, 2241.00, 2319.00, 2398.00, 2478.00, 2560.00, 
      2643.00, 2727.00, 2812.00, 2899.00
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

// CIE 1964 10-degree observer color matching functions (380-780nm, 5nm intervals)
const CIE_CMF_DATA_10DEG = {
  wavelengths: Array.from({ length: 81 }, (_, i) => 380 + i * 5),
  x: [
    0.0002, 0.0007, 0.0024, 0.0072, 0.0191, 0.0434, 0.0847, 0.1406,
    0.2045, 0.2647, 0.3147, 0.3577, 0.3837, 0.3867, 0.3707, 0.3430,
    0.3023, 0.2541, 0.1956, 0.1323, 0.0805, 0.0411, 0.0162, 0.0051,
    0.0038, 0.0154, 0.0375, 0.0714, 0.1177, 0.1730, 0.2365, 0.3042,
    0.3738, 0.4334, 0.4788, 0.5085, 0.5182, 0.5115, 0.4888, 0.4511,
    0.4014, 0.3451, 0.2835, 0.2187, 0.1540, 0.0955, 0.0580, 0.0320,
    0.0147, 0.0049, 0.0024, 0.0093, 0.0291, 0.0633, 0.1096, 0.1655,
    0.2257, 0.2904, 0.3597, 0.4334, 0.5121, 0.5945, 0.6784, 0.7621,
    0.8425, 0.9163, 0.9786, 1.0263, 1.0567, 1.0622, 1.0456, 1.0026,
    0.9384, 0.8544, 0.7514, 0.6424, 0.5419, 0.4479, 0.3608, 0.2835, 0.2187
  ],
  y: [
    0.0000, 0.0001, 0.0003, 0.0008, 0.0020, 0.0045, 0.0088, 0.0145,
    0.0214, 0.0295, 0.0387, 0.0496, 0.0621, 0.0747, 0.0895, 0.1063,
    0.1282, 0.1528, 0.1852, 0.2199, 0.2536, 0.2977, 0.3391, 0.3954,
    0.4608, 0.5314, 0.6067, 0.6857, 0.7618, 0.8233, 0.8752, 0.9238,
    0.9620, 0.9822, 0.9918, 0.9991, 0.9973, 0.9824, 0.9556, 0.9152,
    0.8689, 0.8256, 0.7774, 0.7204, 0.6583, 0.5939, 0.5280, 0.4618,
    0.3981, 0.3396, 0.2835, 0.2187, 0.1649, 0.1212, 0.0874, 0.0636,
    0.0468, 0.0329, 0.0227, 0.0158, 0.0114, 0.0081, 0.0058, 0.0041,
    0.0029, 0.0020, 0.0014, 0.0010, 0.0007, 0.0005, 0.0003, 0.0002,
    0.0002, 0.0001, 0.0001, 0.0001, 0.0001, 0.0000, 0.0000, 0.0000, 0.0000
  ],
  z: [
    0.0007, 0.0029, 0.0105, 0.0323, 0.0860, 0.1971, 0.3894, 0.6568,
    0.9725, 1.2825, 1.5535, 1.7985, 1.9673, 2.0273, 1.9948, 1.9007,
    1.7454, 1.5549, 1.3176, 1.0302, 0.7721, 0.5701, 0.4153, 0.3024,
    0.2185, 0.1592, 0.1120, 0.0822, 0.0607, 0.0431, 0.0305, 0.0206,
    0.0137, 0.0079, 0.0040, 0.0016, 0.0007, 0.0003, 0.0001, 0.0000,
    0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000,
    0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000,
    0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000,
    0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000,
    0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000
  ]
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

// Convert XYZ to sRGB (with illuminant-specific white point normalization)
function xyzToRgb(X: number, Y: number, Z: number, illuminant: IlluminantType, observer: ObserverType = '2', applyGammaCorrection: boolean = true): [number, number, number] {
  console.log('XYZ input values:', { X, Y, Z });
  
  // Calculate illuminant white point for normalization
  let whiteX = 0, whiteY = 0, whiteZ = 0;
  
  // Integrate illuminant SPD with CMF to get white point
  for (let λ = 380; λ <= 780; λ += 1) {
    const spd = getIlluminantSPD(λ, illuminant);
    const [cmfX, cmfY, cmfZ] = getCMF(λ, observer);
    whiteX += spd * cmfX;
    whiteY += spd * cmfY;
    whiteZ += spd * cmfZ;
  }
  
  // Normalize by the white point to get relative XYZ (0..1)
  const normalizedX = X / whiteX;
  const normalizedY = Y / whiteY;
  const normalizedZ = Z / whiteZ;
  
  console.log('Normalized XYZ:', { normalizedX, normalizedY, normalizedZ });
  
  // Convert to sRGB using standard matrix transformation (D65 illuminant)
  let r = 3.2406 * normalizedX - 1.5372 * normalizedY - 0.4986 * normalizedZ;
  let g = -0.9689 * normalizedX + 1.8758 * normalizedY + 0.0415 * normalizedZ;
  let b = 0.0557 * normalizedX - 0.2040 * normalizedY + 1.0570 * normalizedZ;
  
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