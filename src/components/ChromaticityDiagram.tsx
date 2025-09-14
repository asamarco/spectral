import React from 'react';

interface ChromaticityPoint {
  x: number;
  y: number;
  group: number;
  label?: string;
}

interface ChromaticityDiagramProps {
  chromaticity?: ChromaticityPoint[] | null;
  observer?: '2' | '10';
}

// Test point at origin
const ORIGIN_POINT = { x: 0, y: 0 };

// Coordinate conversion from CIE xy to SVG coordinates
// SVG canvas: x="47.8" y="32" width="409.6" height="460.8"
// CIE coordinate range: x (0-0.8), y (0-0.9)
const convertCIEToSVG = (cieX: number, cieY: number) => {
  const canvasLeft = 47.8;
  const canvasTop = 32;
  const canvasWidth = 409.6;
  const canvasHeight = 460.8;
  const canvasBottom = canvasTop + canvasHeight;
  
  // Map CIE coordinates to SVG canvas coordinates
  const svgX = canvasLeft + (cieX / 0.8) * canvasWidth;
  const svgY = canvasBottom - (cieY / 0.9) * canvasHeight; // Subtract because SVG y increases downward
  
  return { x: svgX, y: svgY };
};

const ChromaticityDiagram: React.FC<ChromaticityDiagramProps> = ({ 
  chromaticity, 
  observer = '2' 
}) => {
  return (
    <div className="w-full bg-card rounded-lg border p-4">
      <h3 className="text-lg font-semibold mb-4 text-center">
        CIE 1931 Chromaticity Diagram ({observer}° Observer)
      </h3>
      
      <div className="w-full flex justify-center">
        <svg
          width="100%"
          height="auto"
          viewBox="0 0 476 540"
          style={{ maxHeight: '400px' }}
          className="rounded-lg"
        >
          {/* Base SVG diagram */}
          <image
            href="/CIExy1931.svg"
            width="476"
            height="540"
            x="0"
            y="0"
          />
          
          {/* Origin point */}
          {(() => {
            const position = convertCIEToSVG(ORIGIN_POINT.x, ORIGIN_POINT.y);
            return (
              <g>
                <circle
                  cx={position.x}
                  cy={position.y}
                  r="6"
                  fill="white"
                  stroke="black"
                  strokeWidth="2"
                />
                <text
                  x={position.x}
                  y={position.y + 20}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="bold"
                  fill="black"
                >
                  (0,0)
                </text>
              </g>
            );
          })()}
          
          {/* Color points for all groups */}
          {chromaticity && chromaticity.map((point, index) => {
            const position = convertCIEToSVG(point.x, point.y);
            
            return (
              <g key={`pt-${index}`}>
                <circle
                  cx={position.x}
                  cy={position.y}
                  r="2"
                  fill="black"
                />
                <text
                  x={position.x + 8}
                  y={position.y - 4}
                  fontSize="8"
                  fontWeight="bold"
                  fill="black"
                >
                  {point.label ?? String(point.group)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-white border-2 border-black rounded-full"></div>
          <span>Origin Point (0,0)</span>
        </div>
        {chromaticity && chromaticity.map((point, index) => {
          return (
            <div key={`legend-${index}`} className="flex items-center gap-2">
              <div className="w-1 h-1 bg-black rounded-full"></div>
              <span>{point.label ?? String(point.group)} ({point.x.toFixed(4)}, {point.y.toFixed(4)})</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChromaticityDiagram;