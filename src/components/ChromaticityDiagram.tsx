import React from 'react';
import { ResponsiveContainer, ScatterChart, XAxis, YAxis, CartesianGrid, Scatter, Cell, Line, LineChart } from 'recharts';

interface ChromaticityDiagramProps {
  chromaticity?: {
    x: number;
    y: number;
  } | null;
  observer?: '2' | '10';
}

// CIE 1931 2° standard observer chromaticity coordinates for the spectral locus
const SPECTRAL_LOCUS_2DEG = [
  { x: 0.1741, y: 0.0050, wavelength: 380 },
  { x: 0.1738, y: 0.0050, wavelength: 390 },
  { x: 0.1736, y: 0.0049, wavelength: 400 },
  { x: 0.1733, y: 0.0048, wavelength: 410 },
  { x: 0.1730, y: 0.0048, wavelength: 420 },
  { x: 0.1726, y: 0.0048, wavelength: 430 },
  { x: 0.1721, y: 0.0048, wavelength: 440 },
  { x: 0.1714, y: 0.0051, wavelength: 450 },
  { x: 0.1703, y: 0.0058, wavelength: 460 },
  { x: 0.1689, y: 0.0069, wavelength: 470 },
  { x: 0.1669, y: 0.0086, wavelength: 480 },
  { x: 0.1644, y: 0.0109, wavelength: 490 },
  { x: 0.1611, y: 0.0138, wavelength: 500 },
  { x: 0.1566, y: 0.0177, wavelength: 510 },
  { x: 0.1510, y: 0.0227, wavelength: 520 },
  { x: 0.1440, y: 0.0297, wavelength: 530 },
  { x: 0.1355, y: 0.0399, wavelength: 540 },
  { x: 0.1241, y: 0.0578, wavelength: 550 },
  { x: 0.1096, y: 0.0868, wavelength: 560 },
  { x: 0.0913, y: 0.1327, wavelength: 570 },
  { x: 0.0687, y: 0.2007, wavelength: 580 },
  { x: 0.0454, y: 0.2950, wavelength: 590 },
  { x: 0.0235, y: 0.4127, wavelength: 600 },
  { x: 0.0082, y: 0.5384, wavelength: 610 },
  { x: 0.0039, y: 0.6548, wavelength: 620 },
  { x: 0.0139, y: 0.7502, wavelength: 630 },
  { x: 0.0389, y: 0.8120, wavelength: 640 },
  { x: 0.0743, y: 0.8338, wavelength: 650 },
  { x: 0.1142, y: 0.8262, wavelength: 660 },
  { x: 0.1547, y: 0.8059, wavelength: 670 },
  { x: 0.1929, y: 0.7816, wavelength: 680 },
  { x: 0.2296, y: 0.7543, wavelength: 690 },
  { x: 0.2658, y: 0.7243, wavelength: 700 },
  { x: 0.3016, y: 0.6923, wavelength: 710 },
  { x: 0.3373, y: 0.6589, wavelength: 720 },
  { x: 0.3731, y: 0.6245, wavelength: 730 },
  { x: 0.4087, y: 0.5896, wavelength: 740 },
  { x: 0.4441, y: 0.5547, wavelength: 750 },
  { x: 0.4788, y: 0.5202, wavelength: 760 },
  { x: 0.5125, y: 0.4866, wavelength: 770 },
  { x: 0.5448, y: 0.4544, wavelength: 780 }
];

// Purple boundary (line of purples) - connects 380nm to 780nm
const PURPLE_LINE = [
  { x: 0.1741, y: 0.0050 }, // 380nm
  { x: 0.5448, y: 0.4544 }  // 780nm
];

// Standard illuminant coordinates
const ILLUMINANTS = {
  A: { x: 0.44757, y: 0.40745 },
  C: { x: 0.31006, y: 0.31616 },
  D50: { x: 0.34567, y: 0.35850 },
  D55: { x: 0.33242, y: 0.34743 },
  D65: { x: 0.31271, y: 0.32902 },
  D75: { x: 0.29902, y: 0.31485 },
  F2: { x: 0.37208, y: 0.37529 },
  F7: { x: 0.31292, y: 0.32933 },
  F11: { x: 0.38052, y: 0.37713 }
};

const ChromaticityDiagram: React.FC<ChromaticityDiagramProps> = ({ 
  chromaticity, 
  observer = '2' 
}) => {
  // Create the spectral locus data for plotting
  const spectralLocusData = SPECTRAL_LOCUS_2DEG.map(point => ({
    x: point.x,
    y: point.y,
    wavelength: point.wavelength
  }));

  // Add the purple line closure
  const boundaryData = [...spectralLocusData, ...PURPLE_LINE];

  // Current color point
  const colorPoint = chromaticity ? [{ 
    x: chromaticity.x, 
    y: chromaticity.y, 
    type: 'color' 
  }] : [];

  // Illuminant points
  const illuminantPoints = Object.entries(ILLUMINANTS).map(([name, coords]) => ({
    x: coords.x,
    y: coords.y,
    name,
    type: 'illuminant'
  }));

  return (
    <div className="w-full h-96 bg-card rounded-lg border p-4">
      <h3 className="text-lg font-semibold mb-4 text-center">
        CIE 1931 Chromaticity Diagram ({observer}° Observer)
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart
          margin={{ top: 20, right: 30, bottom: 40, left: 40 }}
          data={boundaryData}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
          <XAxis 
            type="number"
            dataKey="x"
            domain={[0, 0.8]}
            tick={{ fontSize: 12 }}
            label={{ value: 'x', position: 'insideBottom', offset: -10 }}
          />
          <YAxis 
            type="number"
            dataKey="y"
            domain={[0, 0.9]}
            tick={{ fontSize: 12 }}
            label={{ value: 'y', angle: -90, position: 'insideLeft' }}
          />
          
          {/* Spectral locus boundary */}
          <Scatter 
            data={spectralLocusData} 
            fill="hsl(var(--primary))"
            line={{ stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
            shape="circle"
            r={0}
          />
          
          {/* Purple line */}
          <Scatter 
            data={PURPLE_LINE} 
            fill="transparent"
            line={{ stroke: 'hsl(var(--primary))', strokeWidth: 2, strokeDasharray: '5,5' }}
            shape="circle"
            r={0}
          />
          
          {/* Illuminant points */}
          <Scatter data={illuminantPoints}>
            {illuminantPoints.map((entry, index) => (
              <Cell key={`illuminant-${index}`} fill="hsl(var(--muted-foreground))" r={3} />
            ))}
          </Scatter>
          
          {/* Current color point */}
          {colorPoint.length > 0 && (
            <Scatter data={colorPoint}>
              <Cell fill="hsl(var(--destructive))" r={6} stroke="white" strokeWidth={2} />
            </Scatter>
          )}
        </ScatterChart>
      </ResponsiveContainer>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-primary"></div>
          <span>Spectral Locus</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 border-t-2 border-dashed border-primary"></div>
          <span>Purple Line</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-muted-foreground"></div>
          <span>Illuminants</span>
        </div>
        {chromaticity && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-destructive border border-white"></div>
            <span>Current Color ({chromaticity.x.toFixed(4)}, {chromaticity.y.toFixed(4)})</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChromaticityDiagram;