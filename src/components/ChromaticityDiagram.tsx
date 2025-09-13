import React, { useRef, useEffect } from 'react';

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

// Coordinate conversion from CIE xy to image pixels
// (0,1) = (195,86); (0,0) = (195,419); (1,0) = (534,419)
// Adding offset (0.18, 0.02) to correct positioning
const convertCIEToImage = (cieX: number, cieY: number) => {
  const correctedX = cieX + 0.18;
  const correctedY = cieY + 0.02;
  const x = 195 + correctedX * (534 - 195);
  const y = 419 - correctedY * (419 - 86);
  return { x, y };
};

const ChromaticityDiagram: React.FC<ChromaticityDiagramProps> = ({ 
  chromaticity, 
  observer = '2' 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate scaled coordinates based on container size and background-size: contain
  const getScaledCoordinates = (cieX: number, cieY: number) => {
    if (!containerRef.current) return { x: 0, y: 0 };

    const containerRect = containerRef.current.getBoundingClientRect();
    const imageWidth = 729; // Original image intrinsic width
    const imageHeight = 519; // Original image intrinsic height

    // background-size: contain => uniform scale to fit within container
    const scale = Math.min(
      containerRect.width / imageWidth,
      containerRect.height / imageHeight
    );

    const renderedWidth = imageWidth * scale;
    const renderedHeight = imageHeight * scale;

    // Centered background => compute offsets
    const offsetLeft = (containerRect.width - renderedWidth) / 2;
    const offsetTop = (containerRect.height - renderedHeight) / 2;

    const imageCoords = convertCIEToImage(cieX, cieY);

    return {
      x: offsetLeft + imageCoords.x * scale,
      y: offsetTop + imageCoords.y * scale
    };
  };

  return (
    <div className="w-full bg-card rounded-lg border p-4">
      <h3 className="text-lg font-semibold mb-4 text-center">
        CIE 1931 Chromaticity Diagram ({observer}° Observer)
      </h3>
      
      <div 
        ref={containerRef}
        className="relative w-full h-96 bg-center bg-contain bg-no-repeat rounded-lg overflow-hidden"
        style={{
          backgroundImage: 'url(/lovable-uploads/81327187-1358-4d9c-82e4-efd751de9672.png)',
          backgroundSize: 'contain',
          backgroundPosition: 'center'
        }}
      >
        {/* Origin point */}
        {(() => {
          const position = getScaledCoordinates(ORIGIN_POINT.x, ORIGIN_POINT.y);
          return (
            <div
              className="absolute w-3 h-3 bg-white border-2 border-black rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-lg"
              style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
              }}
              title={`Origin: (${ORIGIN_POINT.x.toFixed(4)}, ${ORIGIN_POINT.y.toFixed(4)})`}
            >
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-foreground bg-background px-1 rounded shadow-sm">
                (0,0)
              </div>
            </div>
          );
        })()}
        
        {/* Color points for all groups */}
        {chromaticity && chromaticity.map((point, index) => {
          const position = getScaledCoordinates(point.x, point.y);
          
          return (
            <div key={`pt-${index}`}>
              <div
                className="absolute w-1 h-1 bg-black rounded-full transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${position.x}px`,
                  top: `${position.y}px`,
                }}
                title={`${point.label ?? point.group}: (${point.x.toFixed(4)}, ${point.y.toFixed(4)})`}
              />
              <div
                className="absolute font-semibold text-foreground pointer-events-none"
                style={{
                  left: `${position.x + 6}px`,
                  top: `${position.y - 6}px`,
                  fontSize: '8px'
                }}
              >
                {point.label ?? String(point.group)}
              </div>
            </div>
          );
        })}
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