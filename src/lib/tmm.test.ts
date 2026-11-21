// @ts-ignore bun test runner module
import { describe, it, expect } from 'bun:test';
import { reflectance } from './tmm';

describe('tmm', () => {
  it('bare glass at normal incidence matches Fresnel', () => {
    const n = 1.5046 + 0.0042 / 0.55 ** 2;
    expect(reflectance('Air', [], 'Glass', 550)).toBeCloseTo(((n - 1) / (n + 1)) ** 2, 6);
  });
  it('quarter-wave MgF2 on glass reduces reflectance', () => {
    const d = 550 / (4 * (1.37 + 0.0026 / 0.55 ** 2));
    expect(reflectance('Air', [{ material: 'MgF2', thickness: d }], 'Glass', 550))
      .toBeLessThan(reflectance('Air', [], 'Glass', 550));
  });
  it('zero-thickness layer has no effect', () => {
    expect(reflectance('Air', [{ material: 'TiO2', thickness: 0 }], 'Si', 500)).toBeCloseTo(reflectance('Air', [], 'Si', 500), 10);
  });
});
