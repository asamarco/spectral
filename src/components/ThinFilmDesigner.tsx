import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowDown, ArrowUp, Plus, Save, Trash2 } from 'lucide-react';
import { buildAngleList } from '@/lib/angleSweep';
import { MATERIALS, reflectanceSpectrum, type Layer, type Polarization } from '@/lib/tmm';
import { MaterialEditor, type CustomMaterialEntry } from '@/components/MaterialEditor';
import type { MaterialRegistry } from '@/lib/opticalMaterials';

interface StackLayer extends Layer { id: number }
interface SavedPreset { label: string; ambient: string; substrate: string; layers: Layer[] }
const PRESET_STORAGE = 'thinfilm-user-presets';
interface Props { onSpectrum: (text: string) => void }

let nextId = 1;
const L = (material: string, thickness: number): StackLayer => ({ id: nextId++, material, thickness });

const PRESETS: Record<string, { label: string; ambient: string; substrate: string; layers: () => StackLayer[] }> = {
  alumina: { label: 'Al₂O₃ on Si', ambient: 'Air', substrate: 'Si', layers: () => [L('Al2O3', 100)] },
  oxide: { label: 'SiO₂ on Si', ambient: 'Air', substrate: 'Si', layers: () => [L('SiO2', 300)] },
  ar: { label: 'MgF₂ anti-reflection on glass', ambient: 'Air', substrate: 'Glass', layers: () => [L('MgF2', 100)] },
  bragg: { label: 'TiO₂/SiO₂ Bragg mirror', ambient: 'Air', substrate: 'Glass', layers: () =>
    Array.from({ length: 4 }).flatMap(() => [L('TiO2', 58), L('SiO2', 94)]) },
  mim: { label: 'Ag / SiO₂ / Ag absorber', ambient: 'Air', substrate: 'Glass', layers: () => [L('Ag', 20), L('SiO2', 150), L('Ag', 100)] },
};

function MaterialSelect({ value, onChange, id, materials }: { value: string; onChange: (v: string) => void; id?: string; materials: MaterialRegistry }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger id={id} className="h-9"><SelectValue /></SelectTrigger>
      <SelectContent className="z-50">
        {Object.entries(materials).map(([k, material]) => <SelectItem key={k} value={k}>{material.name}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

export function ThinFilmDesigner({ onSpectrum }: Props) {
  const [ambient, setAmbient] = useState('Air');
  const [substrate, setSubstrate] = useState('Si');
  const [layers, setLayers] = useState<StackLayer[]>(() => PRESETS.alumina.layers());
  const [angle, setAngle] = useState(0);
  const [angleMode, setAngleMode] = useState<'single' | 'sweep'>('single');
  const [sweepStart, setSweepStart] = useState(0);
  const [sweepEnd, setSweepEnd] = useState(75);
  const [sweepStep, setSweepStep] = useState(15);
  const [pol, setPol] = useState<Polarization>('unpolarized');
  const [maxThickness, setMaxThickness] = useState(500);
  const [customMaterials, setCustomMaterials] = useState<Record<string, CustomMaterialEntry>>({});
  const [userPresets, setUserPresets] = useState<Record<string, SavedPreset>>(() => {
    try { return JSON.parse(localStorage.getItem(PRESET_STORAGE) || '{}'); } catch { return {}; }
  });
  const [presetValue, setPresetValue] = useState('');
  useEffect(() => { localStorage.setItem(PRESET_STORAGE, JSON.stringify(userPresets)); }, [userPresets]);
  const materials = useMemo(() => ({ ...MATERIALS, ...Object.fromEntries(Object.entries(customMaterials).map(([key, entry]) => [key, entry.material])) }), [customMaterials]);

  useEffect(() => {
    if (angleMode === 'sweep') {
      const lines: string[] = [];
      for (const a of buildAngleList(sweepStart, sweepEnd, sweepStep)) {
        for (const p of reflectanceSpectrum(ambient, layers, substrate, a, pol, 380, 780, 5, materials)) lines.push(`${p.wavelength}\t${a}\t${p.R.toFixed(5)}`);
      }
      onSpectrum(lines.join('\n'));
      return;
    }
    const spec = reflectanceSpectrum(ambient, layers, substrate, angle, pol, 380, 780, 5, materials);
    onSpectrum(spec.map((p) => `${p.wavelength}\t${p.R.toFixed(5)}`).join('\n'));
  }, [ambient, substrate, layers, angle, pol, onSpectrum, angleMode, sweepStart, sweepEnd, sweepStep, materials]);

  const update = (id: number, patch: Partial<StackLayer>) =>
    setLayers((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  const move = (i: number, dir: -1 | 1) =>
    setLayers((ls) => {
      const j = i + dir;
      if (j < 0 || j >= ls.length) return ls;
      const copy = [...ls];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });
  const applyPreset = (key: string) => {
    setPresetValue(key);
    if (key.startsWith('user-')) {
      const p = userPresets[key];
      if (!p) return;
      const missing = [p.ambient, p.substrate, ...p.layers.map((l) => l.material)].filter((m) => !materials[m]);
      if (missing.length) { alert('This preset uses custom materials that are no longer defined.'); return; }
      setAmbient(p.ambient); setSubstrate(p.substrate); setLayers(p.layers.map((l) => L(l.material, l.thickness)));
      return;
    }
    const p = PRESETS[key];
    setAmbient(p.ambient); setSubstrate(p.substrate); setLayers(p.layers());
  };
  const savePreset = () => {
    const label = prompt('Name for this stack preset:')?.trim();
    if (!label) return;
    const key = `user-${crypto.randomUUID()}`;
    setUserPresets((old) => ({ ...old, [key]: { label, ambient, substrate, layers: layers.map(({ material, thickness }) => ({ material, thickness })) } }));
    setPresetValue(key);
  };
  const deletePreset = () => {
    if (!presetValue.startsWith('user-')) return;
    setUserPresets((old) => { const c = { ...old }; delete c[presetValue]; return c; });
    setPresetValue('');
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Preset</Label>
          <div className="flex gap-1">
            <Select value={presetValue} onValueChange={applyPreset}>
              <SelectTrigger className="h-9 min-w-0"><SelectValue placeholder="Load a preset…" /></SelectTrigger>
              <SelectContent className="z-50">
                {Object.entries(PRESETS).map(([k, p]) => <SelectItem key={k} value={k}>{p.label}</SelectItem>)}
                {Object.entries(userPresets).map(([k, p]) => <SelectItem key={k} value={k}>★ {p.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" onClick={savePreset} aria-label="Save current stack as preset" title="Save current stack as preset"><Save className="h-4 w-4" /></Button>
            <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" onClick={deletePreset} disabled={!presetValue.startsWith('user-')} aria-label="Delete selected preset" title="Delete selected preset"><Trash2 className="h-4 w-4" /></Button>
          </div>
        </div>
        <div className="space-y-1">
          <Label htmlFor="ambient" className="text-xs text-muted-foreground">Ambient (top)</Label>
          <MaterialSelect id="ambient" value={ambient} onChange={setAmbient} materials={materials} />
        </div>
      </div>

      <MaterialEditor entries={customMaterials} onSave={(key, entry) => setCustomMaterials((old) => ({ ...old, [key ?? `custom-${crypto.randomUUID()}`]: entry }))} />

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Layers (top to bottom)</Label>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Slider max</span>
            <Select value={String(maxThickness)} onValueChange={(v) => setMaxThickness(Number(v))}>
              <SelectTrigger className="h-7 w-24 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent className="z-50">
                {[100, 250, 500, 1000, 2000].map((v) => <SelectItem key={v} value={String(v)}>{v} nm</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {layers.length === 0 && (
          <p className="text-sm text-muted-foreground">No layers: bare substrate.</p>
        )}

        {layers.map((layer, i) => (
          <div key={layer.id} className="rounded-md border bg-muted/30 p-3 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-5 text-xs font-mono text-muted-foreground">{i + 1}</span>
              <div className="flex-1 min-w-0"><MaterialSelect value={layer.material} onChange={(v) => update(layer.id, { material: v })} materials={materials} /></div>
              <Input
                type="number" min={0} step={1}
                value={layer.thickness}
                onChange={(e) => update(layer.id, { thickness: Math.max(0, Number(e.target.value) || 0) })}
                className="h-9 w-24 font-mono"
                aria-label={`Layer ${i + 1} thickness in nm`}
              />
              <span className="text-xs text-muted-foreground">nm</span>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move layer up"><ArrowUp className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => move(i, 1)} disabled={i === layers.length - 1} aria-label="Move layer down"><ArrowDown className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setLayers((ls) => ls.filter((l) => l.id !== layer.id))} aria-label="Remove layer"><Trash2 className="h-4 w-4" /></Button>
            </div>
            <Slider
              value={[Math.min(layer.thickness, maxThickness)]}
              min={0} max={maxThickness} step={1}
              onValueChange={(v) => update(layer.id, { thickness: v[0] })}
              aria-label={`Layer ${i + 1} thickness`}
            />
          </div>
        ))}

        <Button variant="outline" size="sm" onClick={() => setLayers((ls) => [...ls, L('SiO2', 100)])}>
          <Plus className="h-4 w-4 mr-1" /> Add layer
        </Button>
      </div>

      <div className="space-y-1">
        <Label htmlFor="substrate" className="text-xs text-muted-foreground">Substrate (bottom)</Label>
        <MaterialSelect id="substrate" value={substrate} onChange={setSubstrate} materials={materials} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Select value={angleMode} onValueChange={(v) => setAngleMode(v as 'single' | 'sweep')}>
            <SelectTrigger className="h-8 text-xs" aria-label="Angle mode"><SelectValue /></SelectTrigger>
            <SelectContent className="z-50">
              <SelectItem value="single">Single angle</SelectItem>
              <SelectItem value="sweep">Angle range</SelectItem>
            </SelectContent>
          </Select>
          {angleMode === 'single' ? (
            <>
              <Label className="text-xs text-muted-foreground">Incidence angle: {angle}°</Label>
              <Slider value={[angle]} min={0} max={85} step={1} onValueChange={(v) => setAngle(v[0])} aria-label="Incidence angle" />
            </>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {([['Start °', sweepStart, setSweepStart], ['End °', sweepEnd, setSweepEnd], ['Step °', sweepStep, setSweepStep]] as const).map(([lbl, val, set]) => (
                <div key={lbl} className="space-y-1">
                  <Label className="text-xs text-muted-foreground">{lbl}</Label>
                  <Input type="number" className="h-8" value={val} min={0} max={89} aria-label={lbl}
                    onChange={(e) => set(Number(e.target.value))} />
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Polarization</Label>
          <Select value={pol} onValueChange={(v) => setPol(v as Polarization)}>
            <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
            <SelectContent className="z-50">
              <SelectItem value="unpolarized">Unpolarized</SelectItem>
              <SelectItem value="s">s (TE)</SelectItem>
              <SelectItem value="p">p (TM)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">Optical constants are approximate literature values; layers are treated as coherent.</p>
    </div>
  );
}
