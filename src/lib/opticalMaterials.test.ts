// @ts-ignore bun test runner module
import { expect, test } from 'bun:test';
import { createOpticalMaterial, parseNKTable } from './opticalMaterials';
import { MATERIALS, reflectance, reflectanceSpectrum } from './tmm';

test('Cauchy evaluates wavelengths in micrometres and is transparent', () => {
  const m = createOpticalMaterial('Test', { model: 'cauchy', coefficients: [1.5, 0.004, 0.0001] });
  expect(m.nk(500)).toEqual({ re: 1.5176, im: 0 });
});
test('Sellmeier gives the BK7 refractive index at 587.6 nm', () => {
  const m = createOpticalMaterial('BK7', { model: 'sellmeier', coefficients: [1.03961212, 0.231792344, 1.01046945, 0.00600069867, 0.0200179144, 103.560653] });
  expect(m.nk(587.6).re).toBeCloseTo(1.516798, 6);
  expect(m.nk(587.6).im).toBe(0);
});
test('n,k tables accept mixed delimiters, headers, comments, and sort wavelengths', () => {
  expect(parseNKTable('wavelength,n,k\n780,2,0.4\n380\t1\t0.2 # comment\n580 1.5 0.3')).toEqual([[380, 1, 0.2], [580, 1.5, 0.3], [780, 2, 0.4]]);
});
test('micrometre tables are converted to nm and interpolate both n and k', () => {
  const m = createOpticalMaterial('Absorber', { model: 'table', rows: parseNKTable('0.38 1 0.2\n0.78 2 0.4', 'um') });
  expect(m.nk(580).re).toBeCloseTo(1.5, 10);
  expect(m.nk(580).im).toBeCloseTo(0.3, 10);
});
test('table rejects duplicate wavelengths', () => {
  expect(() => parseNKTable('380 1 0\n380 2 0')).toThrow('Duplicate');
});
test('table rejects negative absorption', () => {
  expect(() => parseNKTable('380 1 -0.1\n780 1 0')).toThrow('non-negative');
});
test('table rejects incomplete simulation coverage instead of extrapolating', () => {
  expect(() => createOpticalMaterial('Short', { model: 'table', rows: [[400, 1, 0], [700, 1, 0]] })).toThrow('380–780');
});
test('Sellmeier rejects resonances in the simulation range', () => {
  expect(() => createOpticalMaterial('Pole', { model: 'sellmeier', coefficients: [1, 0, 0, 0.25, 1, 2] })).toThrow('resonance');
});
test('invalid transparent model is rejected', () => {
  expect(() => createOpticalMaterial('Invalid', { model: 'cauchy', coefficients: [-1, 0, 0] })).toThrow('positive');
});
test('custom absorbing substrate reaches TMM and matches complex Fresnel result', () => {
  const material = createOpticalMaterial('Absorber', { model: 'table', rows: [[380, 2, 1], [780, 2, 1]] });
  const registry = { ...MATERIALS, custom: material };
  expect(reflectance('Air', [], 'custom', 550, 0, 'unpolarized', registry)).toBeCloseTo(0.2, 10);
  expect(reflectanceSpectrum('Air', [], 'custom', 0, 'unpolarized', 380, 780, 5, registry)).toHaveLength(81);
});
test('copper uses published Johnson and Christy n,k values', () => {
  expect(MATERIALS.Cu.nk(548.6)).toEqual({ re: 1.02, im: 2.577 });
});
test('titanium uses published Johnson and Christy n,k values', () => {
  expect(MATERIALS.Ti.nk(549)).toEqual({ re: 2.54, im: 3.43 });
});
test('both new metals produce finite spectra across 380–780 nm', () => {
  for (const metal of ['Cu', 'Ti']) {
    for (const { R } of reflectanceSpectrum('Air', [{ material: metal, thickness: 25 }], 'Glass', 75)) {
      expect(Number.isFinite(R) && R >= 0 && R <= 1).toBe(true);
    }
  }
});