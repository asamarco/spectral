import type { NKRow } from '../opticalMaterials';

// Johnson & Christy, room temperature. Wavelengths converted from µm to nm.
// Cu: Phys. Rev. B 6, 4370 (1972), doi:10.1103/PhysRevB.6.4370
// Ti: Phys. Rev. B 9, 5056 (1974), doi:10.1103/PhysRevB.9.5056
// Source: refractiveindex.info database (CC0), main/{Cu,Ti}/nk/Johnson.yml.
// Include bounding rows so interpolation covers the entire 380–780 nm range.
export const COPPER_NK: NKRow[] = [
  [367.9, 1.36, 1.975], [381.5, 1.33, 2.045], [397.4, 1.32, 2.116],
  [413.3, 1.28, 2.207], [430.5, 1.25, 2.305], [450.9, 1.24, 2.397],
  [471.4, 1.25, 2.483], [495.9, 1.22, 2.564], [520.9, 1.18, 2.608],
  [548.6, 1.02, 2.577], [582.1, 0.70, 2.704], [616.8, 0.30, 3.205],
  [659.5, 0.22, 3.747], [704.5, 0.21, 4.205], [756.0, 0.24, 4.665],
  [821.1, 0.26, 5.180],
];
export const TITANIUM_NK: NKRow[] = [
  [368, 1.90, 2.90], [381, 1.99, 2.93], [397, 2.08, 2.95],
  [413, 2.14, 2.98], [431, 2.21, 3.01], [451, 2.27, 3.04],
  [471, 2.32, 3.10], [496, 2.36, 3.19], [521, 2.44, 3.30],
  [549, 2.54, 3.43], [582, 2.60, 3.58], [617, 2.67, 3.72],
  [659, 2.76, 3.84], [704, 2.86, 3.96], [756, 3.00, 4.01],
  [821, 3.21, 4.01],
];