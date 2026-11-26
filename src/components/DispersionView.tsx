import { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import type { OpticalMaterial } from '@/lib/opticalMaterials';

export function DispersionView({ material }: { material: OpticalMaterial }) {
  const [view, setView] = useState('plot');
  const data = useMemo(() => {
    const rows = [];
    for (let l = 380; l <= 780; l += 10) {
      const { re, im } = material.nk(l);
      rows.push({ wavelength: l, n: +re.toFixed(4), k: +im.toFixed(4) });
    }
    return rows;
  }, [material]);
  return (
    <Tabs value={view} onValueChange={setView} className="space-y-2" aria-label="Material dispersion">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium">Dispersion: {material.name}</span>
        <TabsList className="h-7"><TabsTrigger value="plot" className="text-xs">Plot</TabsTrigger><TabsTrigger value="table" className="text-xs">Table</TabsTrigger></TabsList>
      </div>
      <TabsContent value="plot" className="mt-0">
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="wavelength" type="number" domain={[380, 780]} tick={{ fontSize: 10 }} unit=" nm" />
              <YAxis yAxisId="n" tick={{ fontSize: 10 }} domain={['auto', 'auto']} width={40} />
              <YAxis yAxisId="k" orientation="right" tick={{ fontSize: 10 }} domain={[0, 'auto']} width={40} />
              <Tooltip contentStyle={{ fontSize: 11 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line yAxisId="n" dataKey="n" stroke="hsl(var(--primary))" dot={false} isAnimationActive={false} />
              <Line yAxisId="k" dataKey="k" stroke="hsl(var(--muted-foreground))" strokeDasharray="4 2" dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </TabsContent>
      <TabsContent value="table" className="mt-0">
        <div className="max-h-48 overflow-auto rounded border">
          <table className="w-full font-mono text-xs">
            <thead className="sticky top-0 bg-muted"><tr><th className="px-2 py-1 text-left">λ (nm)</th><th className="px-2 py-1 text-right">n</th><th className="px-2 py-1 text-right">k</th></tr></thead>
            <tbody>{data.map((r) => <tr key={r.wavelength} className="border-t"><td className="px-2 py-0.5">{r.wavelength}</td><td className="px-2 py-0.5 text-right">{r.n.toFixed(4)}</td><td className="px-2 py-0.5 text-right">{r.k.toFixed(4)}</td></tr>)}</tbody>
          </table>
        </div>
      </TabsContent>
    </Tabs>
  );
}
