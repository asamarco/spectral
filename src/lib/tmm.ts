// Coherent thin-film transfer-matrix (Airy recursion) solver for planar isotropic stacks.
// Refractive index convention: N = n + i k, fields ~ exp(i(kz - wt)).
import { COPPER_NK, TITANIUM_NK } from './data/metalOpticalConstants';
import { interpolateNK, type MaterialRegistry, type OpticalMaterial } from './opticalMaterials';

export type Complex = { re: number; im: number };
const c = (re: number, im = 0): Complex => ({ re, im });
const add = (a: Complex, b: Complex): Complex => c(a.re + b.re, a.im + b.im);
const sub = (a: Complex, b: Complex): Complex => c(a.re - b.re, a.im - b.im);
const mul = (a: Complex, b: Complex): Complex => c(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
const div = (a: Complex, b: Complex): Complex => {
  const d = b.re * b.re + b.im * b.im;
  return c((a.re * b.re + a.im * b.im) / d, (a.im * b.re - a.re * b.im) / d);
};
const csqrt = (a: Complex): Complex => {
  const r = Math.hypot(a.re, a.im);
  const re = Math.sqrt((r + a.re) / 2);
  const im = Math.sign(a.im || 1) * Math.sqrt(Math.max(0, (r - a.re) / 2));
  return c(re, im);
};
const cexp = (a: Complex): Complex => {
  const e = Math.exp(a.re);
  return c(e * Math.cos(a.im), e * Math.sin(a.im));
};
const abs2 = (a: Complex) => a.re * a.re + a.im * a.im;

export type MaterialKey = string;
type Material = OpticalMaterial;

const cauchy = (A: number, B: number, C = 0) => (l: number) => {
  const um = l / 1000;
  return c(A + B / (um * um) + C / (um ** 4), 0);
};
// Table: [lambda nm, n, k]
const table = (rows: [number, number, number][]) => (l: number): Complex => {
  if (l <= rows[0][0]) return c(rows[0][1], rows[0][2]);
  const last = rows[rows.length - 1];
  if (l >= last[0]) return c(last[1], last[2]);
  for (let i = 0; i < rows.length - 1; i++) {
    const [l1, n1, k1] = rows[i];
    const [l2, n2, k2] = rows[i + 1];
    if (l >= l1 && l <= l2) {
      const t = (l - l1) / (l2 - l1);
      return c(n1 + t * (n2 - n1), k1 + t * (k2 - k1));
    }
  }
  return c(last[1], last[2]);
};

// Approximate literature values (visible range) — suitable for colour design, not metrology.
export const MATERIALS: Record<MaterialKey, Material> = {
  Air: { name: 'Air', nk: () => c(1, 0) },
  Water: { name: 'Water', nk: cauchy(1.324, 0.00306) },
  MgF2: { name: 'MgF₂', nk: cauchy(1.370, 0.0026) },
  SiO2: { name: 'SiO₂', nk: cauchy(1.4485, 0.00354) },
  Glass: { name: 'Glass (BK7)', nk: cauchy(1.5046, 0.0042) },
  Al2O3: { name: 'Al₂O₃', nk: cauchy(1.7546, 0.0059) },
  HfO2: { name: 'HfO₂', nk: cauchy(1.875, 0.0175) },
  ZnO: { name: 'ZnO', nk: cauchy(1.92, 0.03) },
  Si3N4: { name: 'Si₃N₄', nk: cauchy(1.98, 0.0161) },
  Ta2O5: { name: 'Ta₂O₅', nk: cauchy(2.05, 0.0228) },
  TiO2: { name: 'TiO₂', nk: cauchy(2.24, 0.0436) },
  Si: {
    name: 'Si (crystalline)', nk: table([
      [380, 5.98, 0.60], [400, 5.57, 0.387], [450, 4.67, 0.145], [500, 4.30, 0.073], [550, 4.08, 0.041],
      [600, 3.95, 0.025], [650, 3.85, 0.016], [700, 3.78, 0.011], [750, 3.73, 0.008], [800, 3.69, 0.006],
    ])
  },
  Al: {
    name: 'Al', nk: table([
      [380, 0.45, 4.60], [400, 0.49, 4.86], [450, 0.62, 5.47], [500, 0.77, 6.08], [550, 0.96, 6.69],
      [600, 1.20, 7.26], [650, 1.47, 7.79], [700, 1.83, 8.31], [800, 2.80, 8.45],
    ])
  },
  Ag: {
    name: 'Ag', nk: table([
      [380, 0.07, 1.80], [400, 0.05, 2.10], [450, 0.04, 2.65], [500, 0.05, 3.10], [550, 0.06, 3.60],
      [600, 0.06, 4.00], [650, 0.05, 4.40], [700, 0.04, 4.80], [800, 0.04, 5.50],
    ])
  },
  Au: {
    name: 'Au', nk: table([
      [380, 1.50, 1.90], [400, 1.47, 1.95], [450, 1.38, 1.80], [500, 0.97, 1.87], [550, 0.43, 2.45],
      [600, 0.25, 3.00], [650, 0.17, 3.50], [700, 0.16, 3.95], [800, 0.16, 4.80],
    ])
  },
  Cu: { name: 'Cu', nk: (l) => interpolateNK(COPPER_NK, l) },
  Ti: { name: 'Ti', nk: (l) => interpolateNK(TITANIUM_NK, l) },
};

export type Polarization = 's' | 'p' | 'unpolarized';
export interface Layer { material: MaterialKey; thickness: number } // nm

function cosTheta(N: Complex, n0sin: Complex): Complex {
  const s = div(n0sin, N);
  let cs = csqrt(sub(c(1), mul(s, s)));
  // forward-propagating branch: Im(N cos) > 0, or Re > 0 when lossless
  const nc = mul(N, cs);
  if (nc.im < -1e-12 || (Math.abs(nc.im) < 1e-12 && nc.re < 0)) cs = c(-cs.re, -cs.im);
  return cs;
}

function reflectancePol(pol: 's' | 'p', Ns: Complex[], ds: number[], angleRad: number, lambda: number): number {
  const n0sin = mul(Ns[0], c(Math.sin(angleRad)));
  const cos = Ns.map((N) => cosTheta(N, n0sin));
  const fresnel = (i: number, j: number): Complex => {
    if (pol === 's') {
      const a = mul(Ns[i], cos[i]); const b = mul(Ns[j], cos[j]);
      return div(sub(a, b), add(a, b));
    }
    const a = mul(Ns[j], cos[i]); const b = mul(Ns[i], cos[j]);
    return div(sub(a, b), add(a, b));
  };
  const last = Ns.length - 1;
  let r = fresnel(last - 1, last);
  for (let j = last - 1; j >= 1; j--) {
    const delta = mul(c((2 * Math.PI * ds[j]) / lambda), mul(Ns[j], cos[j]));
    const ph = cexp(mul(c(0, 2), delta));
    const rij = fresnel(j - 1, j);
    const rp = mul(r, ph);
    r = div(add(rij, rp), add(c(1), mul(rij, rp)));
  }
  return abs2(r);
}

/** Reflectance (0..1) of ambient | layers | substrate. */
export function reflectance(
  ambient: MaterialKey, layers: Layer[], substrate: MaterialKey,
  lambdaNm: number, angleDeg = 0, pol: Polarization = 'unpolarized',
  materials: MaterialRegistry = MATERIALS,
): number {
  const keys = [ambient, ...layers.map((l) => l.material), substrate];
  const Ns = keys.map((k) => {
    const material = materials[k];
    if (!material) throw new Error(`Unknown optical material: ${k}`);
    return material.nk(lambdaNm);
  });
  const ds = [0, ...layers.map((l) => Math.max(0, l.thickness)), 0];
  const a = (angleDeg * Math.PI) / 180;
  if (pol === 'unpolarized') {
    return (reflectancePol('s', Ns, ds, a, lambdaNm) + reflectancePol('p', Ns, ds, a, lambdaNm)) / 2;
  }
  return reflectancePol(pol, Ns, ds, a, lambdaNm);
}

export function reflectanceSpectrum(
  ambient: MaterialKey, layers: Layer[], substrate: MaterialKey,
  angleDeg = 0, pol: Polarization = 'unpolarized', min = 380, max = 780, step = 5,
  materials: MaterialRegistry = MATERIALS,
): { wavelength: number; R: number }[] {
  const out: { wavelength: number; R: number }[] = [];
  for (let l = min; l <= max + 1e-9; l += step) out.push({ wavelength: l, R: reflectance(ambient, layers, substrate, l, angleDeg, pol, materials) });
  return out;
}
