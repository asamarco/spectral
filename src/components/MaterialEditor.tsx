import { useMemo, useRef, useState } from 'react';
import { DispersionView } from '@/components/DispersionView';
import { Plus, Save, Trash2, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createOpticalMaterial, parseNKTable, type MaterialDefinition, type OpticalMaterial } from '@/lib/opticalMaterials';

export interface CustomMaterialEntry { material: OpticalMaterial; definition: MaterialDefinition }
interface Props {
  entries: Record<string, CustomMaterialEntry>;
  onSave: (key: string | undefined, entry: CustomMaterialEntry) => void;
  onDelete: (key: string) => void;
}
const CAUCHY = ['1.5', '0.004', '0'];
const SELLMEIER = ['1.03961212', '0.231792344', '1.01046945', '0.00600069867', '0.0200179144', '103.560653'];

export function MaterialEditor({ entries, onSave, onDelete }: Props) {
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState('new');
  const [name, setName] = useState('');
  const [model, setModel] = useState<MaterialDefinition['model']>('cauchy');
  const [coefficients, setCoefficients] = useState(CAUCHY);
  const [text, setText] = useState('');
  const [unit, setUnit] = useState<'nm' | 'um'>('nm');
  const [error, setError] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);

  const load = (id: string) => {
    setKey(id); setError('');
    const entry = entries[id];
    if (!entry) {
      setName(''); setModel('cauchy'); setCoefficients(CAUCHY); setText(''); setUnit('nm');
      return;
    }
    setName(entry.material.name); setModel(entry.definition.model);
    if (entry.definition.model === 'table') {
      setText(entry.definition.rows.map((r) => r.join('\t')).join('\n')); setUnit('nm');
    } else setCoefficients(entry.definition.coefficients.map(String));
  };
  const preview = useMemo(() => {
    try {
      if (model === 'table') return createOpticalMaterial(name.trim() || 'Preview', { model, rows: parseNKTable(text, unit) });
      if (coefficients.some((v) => !v.trim())) return null;
      const v = coefficients.map(Number);
      return createOpticalMaterial(name.trim() || 'Preview', model === 'cauchy'
        ? { model, coefficients: [v[0], v[1], v[2]] }
        : { model, coefficients: [v[0], v[1], v[2], v[3], v[4], v[5]] });
    } catch { return null; }
  }, [model, coefficients, text, unit, name]);
  const save = () => {
    try {
      if (coefficients.some((v) => !v.trim()) && model !== 'table') throw new Error('Fill in every coefficient.');
      if (Object.entries(entries).some(([id, entry]) => id !== key && entry.material.name.toLowerCase() === name.trim().toLowerCase())) {
        throw new Error('A custom material already has this name.');
      }
      const values = coefficients.map(Number);
      const definition: MaterialDefinition = model === 'table'
        ? { model, rows: parseNKTable(text, unit) }
        : model === 'cauchy'
          ? { model, coefficients: [values[0], values[1], values[2]] }
          : { model, coefficients: [values[0], values[1], values[2], values[3], values[4], values[5]] };
      const material = createOpticalMaterial(name, definition);
      onSave(key === 'new' ? undefined : key, { material, definition });
      setError(''); setOpen(false);
    } catch (e) { setError(e instanceof Error ? e.message : 'Invalid material.'); }
  };

  return (
    <div className="space-y-3">
      <Button variant="outline" size="sm" onClick={() => setOpen(!open)} aria-expanded={open}>
        <Plus className="mr-1 h-4 w-4" /> Custom materials
      </Button>
      {open && <section aria-label="Custom material editor" className="space-y-3 rounded-md border p-3">
        <div className="flex items-center justify-between gap-2">
          <Label className="font-medium">Material definition</Label>
          <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Close material editor" onClick={() => setOpen(false)}><X className="h-4 w-4" /></Button>
        </div>
        {Object.keys(entries).length > 0 && <Select value={key} onValueChange={load}>
          <SelectTrigger aria-label="Edit custom material"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="new">New material</SelectItem>{Object.entries(entries).map(([id, entry]) => <SelectItem key={id} value={id}>{entry.material.name}</SelectItem>)}</SelectContent>
        </Select>}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1"><Label htmlFor="custom-material-name">Name</Label><Input id="custom-material-name" value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="space-y-1"><Label htmlFor="custom-material-model">Optical model</Label>
            <Select value={model} onValueChange={(v) => { setModel(v as MaterialDefinition['model']); setCoefficients(v === 'sellmeier' ? SELLMEIER : CAUCHY); setError(''); }}>
              <SelectTrigger id="custom-material-model"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="cauchy">Cauchy</SelectItem><SelectItem value="sellmeier">Sellmeier</SelectItem><SelectItem value="table">Tabulated n,k</SelectItem></SelectContent>
            </Select>
          </div>
        </div>
        {model !== 'table' ? <>
          <p className="text-xs text-muted-foreground break-words">{model === 'cauchy' ? 'n(λ) = A + B/λ² + C/λ⁴' : 'n²(λ) = 1 + Σ Bᵢλ²/(λ² − Cᵢ)'} · λ in µm · k = 0</p>
          <div className="grid grid-cols-3 gap-2">
            {(model === 'cauchy' ? ['A', 'B (µm²)', 'C (µm⁴)'] : ['B₁', 'B₂', 'B₃', 'C₁ (µm²)', 'C₂ (µm²)', 'C₃ (µm²)']).map((label, i) => <div key={label} className="min-w-0 space-y-1">
              <Label htmlFor={`coefficient-${i}`} className="text-xs">{label}</Label>
              <Input id={`coefficient-${i}`} type="number" step="any" className="min-w-0 font-mono text-xs" value={coefficients[i]} onChange={(e) => setCoefficients((old) => old.map((v, j) => j === i ? e.target.value : v))} />
            </div>)}
          </div>
        </> : <>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => fileInput.current?.click()}><Upload className="mr-1 h-4 w-4" /> Upload n,k table</Button>
            <input ref={fileInput} type="file" accept=".txt,.csv,.tsv,.dat" className="hidden" aria-label="Upload optical constants" onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              try { setText(await file.text()); setError(''); } catch { setError('Could not read this file.'); }
              e.target.value = '';
            }} />
            <Select value={unit} onValueChange={(v) => setUnit(v as 'nm' | 'um')}>
              <SelectTrigger className="w-32" aria-label="Table wavelength unit"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="nm">λ in nm</SelectItem><SelectItem value="um">λ in µm</SelectItem></SelectContent>
            </Select>
          </div>
          <Label htmlFor="nk-table" className="text-xs text-muted-foreground">Wavelength, n, k · 380–780 nm coverage · comma, tab or space separated</Label>
          <Textarea id="nk-table" className="h-32 font-mono text-xs" value={text} onChange={(e) => setText(e.target.value)} placeholder={'380 1.5 0.1\n780 1.4 0.2'} />
        </>}
        {preview ? <DispersionView material={preview} /> : <p className="text-xs text-muted-foreground">Dispersion preview appears once the definition is valid for 380–780 nm.</p>}
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <Button size="sm" onClick={save}><Save className="mr-1 h-4 w-4" /> {key === 'new' ? 'Add material' : 'Save material'}</Button>
        {key !== 'new' && <Button size="sm" variant="outline" className="ml-2" onClick={() => {
          if (!confirm(`Delete material "${entries[key]?.material.name}"? Layers using it will switch to a built-in material.`)) return;
          onDelete(key); load('new');
        }}><Trash2 className="mr-1 h-4 w-4" /> Delete material</Button>}
      </section>}
    </div>
  );
}