export type NKRow = [number, number, number];
export interface OpticalMaterial {
  name: string;
  nk: (lambdaNm: number) => { re: number; im: number };
}
export type MaterialRegistry = Record<string, OpticalMaterial>;
export type MaterialDefinition =
  | { model: 'cauchy'; coefficients: [number, number, number] }
  | { model: 'sellmeier'; coefficients: [number, number, number, number, number, number] }
  | { model: 'table'; rows: NKRow[] };

/** Input wavelengths may be nm or µm; internal wavelengths are always nm. */
export function parseNKTable(text: string, unit: 'nm' | 'um' = 'nm'): NKRow[] {
  const rows: NKRow[] = [];
  for (const [index, raw] of text.split(/\r?\n/).entries()) {
    const line = raw.split('#')[0].trim();
    if (!line) continue;
    const fields = line.split(/[\s,;]+/);
    if (rows.length === 0 && /^(wavelength|lambda|λ)\b/i.test(line)) continue;
    const values = fields.map(Number);
    if (values.length !== 3 || values.some((v) => !Number.isFinite(v))) {
      throw new Error(`Line ${index + 1}: expected wavelength, n, k.`);
    }
    const [wavelength, n, k] = values;
    if (wavelength <= 0 || n <= 0 || k < 0) {
      throw new Error(`Line ${index + 1}: wavelength and n must be positive; k must be non-negative.`);
    }
    rows.push([wavelength * (unit === 'um' ? 1000 : 1), n, k]);
  }
  rows.sort((a, b) => a[0] - b[0]);
  if (rows.length < 2) throw new Error('Provide at least two wavelength rows.');
  if (rows.some((row, i) => i > 0 && row[0] === rows[i - 1][0])) {
    throw new Error('Duplicate wavelengths are not allowed.');
  }
  return rows;
}

export function interpolateNK(rows: NKRow[], wavelength: number) {
  const first = rows[0];
  const last = rows[rows.length - 1];
  if (!first || !last) throw new Error('Empty optical constants table.');
  if (wavelength < first[0] || wavelength > last[0]) {
    throw new Error(`Optical constants do not cover ${wavelength} nm.`);
  }
  for (let i = 1; i < rows.length; i++) {
    if (wavelength <= rows[i][0]) {
      const [l1, n1, k1] = rows[i - 1];
      const [l2, n2, k2] = rows[i];
      const t = (wavelength - l1) / (l2 - l1);
      return { re: n1 + t * (n2 - n1), im: k1 + t * (k2 - k1) };
    }
  }
  return { re: last[1], im: last[2] };
}

export function createOpticalMaterial(name: string, definition: MaterialDefinition): OpticalMaterial {
  if (!name.trim()) throw new Error('Enter a material name.');
  let nk: OpticalMaterial['nk'];
  if (definition.model === 'table') {
    const rows = parseNKTable(definition.rows.map((r) => r.join('\t')).join('\n'));
    if (rows[0][0] > 380 || rows[rows.length - 1][0] < 780) {
      throw new Error('The n,k table must cover the full simulation range, 380–780 nm.');
    }
    nk = (l) => interpolateNK(rows, l);
  } else {
    const coefficients = definition.coefficients;
    if (coefficients.some((v) => !Number.isFinite(v))) throw new Error('Enter finite values for all coefficients.');
    if (definition.model === 'cauchy') {
      const [A, B, C] = coefficients;
      nk = (l) => ({ re: A + B / (l / 1000) ** 2 + C / (l / 1000) ** 4, im: 0 });
    } else {
      const [B1, B2, B3, C1, C2, C3] = definition.coefficients;
      if ([C1, C2, C3].some((v) => v >= 0.38 ** 2 && v <= 0.78 ** 2)) {
        throw new Error('A Sellmeier resonance lies inside 380–780 nm.');
      }
      nk = (l) => {
        const squared = (l / 1000) ** 2;
        return { re: Math.sqrt(1 + B1 * squared / (squared - C1) + B2 * squared / (squared - C2) + B3 * squared / (squared - C3)), im: 0 };
      };
    }
    for (let l = 380; l <= 780; l++) {
      const n = nk(l).re;
      if (!Number.isFinite(n) || n <= 0) throw new Error('The model must give a finite, positive n throughout 380–780 nm.');
    }
  }
  return { name: name.trim(), nk };
}