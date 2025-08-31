import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, Palette, BarChart3, Info, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { convertSpectrumToColor, parseSpectralData, getGroups, type ColorResult, type SpectralData } from '@/lib/spectralConversion';
import { useToast } from '@/hooks/use-toast';

interface SpectralConverterProps {
  className?: string;
}

export function SpectralConverter({ className }: SpectralConverterProps) {
  const exampleData = `380 0.05
400 0.08
420 0.12
440 0.18
460 0.25
480 0.35
500 0.48
520 0.62
540 0.75
560 0.85
580 0.92
600 0.95
620 0.88
640 0.75
660 0.58
680 0.38
700 0.22
720 0.12
740 0.06
760 0.03`;

  // State management - preload with example data
  const [spectralInput, setSpectralInput] = useState(exampleData);
  const [colorResults, setColorResults] = useState<ColorResult[]>([]);
  const [spectralData, setSpectralData] = useState<SpectralData[]>(() => {
    try {
      return parseSpectralData(exampleData);
    } catch {
      return [];
    }
  });
  const [groups, setGroups] = useState<number[]>(() => {
    try {
      const parsed = parseSpectralData(exampleData);
      return getGroups(parsed);
    } catch {
      return [];
    }
  });
  const [currentGroup, setCurrentGroup] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showNormalized, setShowNormalized] = useState(false);
  const [applyGammaCorrection, setApplyGammaCorrection] = useState(true);
  const { toast } = useToast();

  const handleConvert = useCallback(() => {
    if (!spectralInput.trim()) {
      toast({
        title: "No data provided",
        description: "Please enter spectral data or use the example data.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const parsed = parseSpectralData(spectralInput);
      
      if (parsed.length === 0) {
        throw new Error('No valid spectral data found');
      }

      if (parsed.length < 2) {
        throw new Error('At least 2 data points are required');
      }

      setSpectralData(parsed);

      const uniqueGroups = getGroups(parsed);
      setGroups(uniqueGroups);
      
      if (uniqueGroups.length > 0) {
        // Convert each group separately
        const results: ColorResult[] = [];
        for (const group of uniqueGroups) {
          const result = convertSpectrumToColor(parsed, group, applyGammaCorrection);
          if (result) {
            results.push(result);
          }
        }
        
        if (results.length > 0) {
          setColorResults(results);
          setCurrentGroup(0);
          toast({
            title: "Conversion successful!",
            description: `Generated ${results.length} color(s) from ${uniqueGroups.length} group(s)`,
          });
        } else {
          throw new Error("No valid colors generated");
        }
      } else {
        // Single group (no group column)
        const result = convertSpectrumToColor(parsed, undefined, applyGammaCorrection);
        if (result) {
          setColorResults([result]);
          setGroups([]);
          setCurrentGroup(0);
          toast({
            title: "Conversion successful!",
            description: `Converted ${parsed.length} spectral data points to color.`,
          });
        } else {
          throw new Error('Unable to convert spectrum to color');
        }
      }
    } catch (error) {
      toast({
        title: "Conversion failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
      setColorResults([]);
      setSpectralData([]);
    } finally {
      setIsLoading(false);
    }
  }, [spectralInput, toast, applyGammaCorrection]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setSpectralInput(content);
      
      // Parse spectral data immediately for preview
      try {
        const parsed = parseSpectralData(content);
        if (parsed.length > 0) {
          setSpectralData(parsed);
          const uniqueGroups = getGroups(parsed);
          setGroups(uniqueGroups);
          setColorResults([]); // Clear color results
        }
      } catch (error) {
        // Ignore parsing errors for preview
      }
      
      toast({
        title: "File loaded",
        description: `Loaded ${file.name} successfully.`,
      });
    };
    reader.readAsText(file);
  }, [toast]);

  const handleInputChange = useCallback((value: string) => {
    setSpectralInput(value);
    
    // Parse spectral data immediately for preview
    try {
      const parsed = parseSpectralData(value);
      if (parsed.length > 0) {
        setSpectralData(parsed);
        const uniqueGroups = getGroups(parsed);
        setGroups(uniqueGroups);
        setColorResults([]); // Clear color results
      } else {
        setSpectralData([]);
        setGroups([]);
        setColorResults([]);
      }
    } catch (error) {
      // Ignore parsing errors for preview
      setSpectralData([]);
      setGroups([]);
      setColorResults([]);
    }
  }, []);

  const useExample = useCallback(() => {
    setSpectralInput(exampleData);
    handleInputChange(exampleData);
    toast({
      title: "Example loaded",
      description: "Loaded example spectral data for a typical reflection spectrum.",
    });
  }, [toast, handleInputChange]);

  // Prepare plot data
  const getPlotData = useCallback(() => {
    if (spectralData.length === 0) return [];
    
    if (groups.length === 0) {
      // Single group
      return spectralData.map(point => ({
        wavelength: point.wavelength,
        intensity: point.intensity,
      }));
    } else {
      // Multiple groups - create combined data structure
      const wavelengths = [...new Set(spectralData.map(p => p.wavelength))].sort((a, b) => a - b);
      return wavelengths.map(wavelength => {
        const dataPoint: any = { wavelength };
        groups.forEach(group => {
          const point = spectralData.find(p => p.wavelength === wavelength && p.group === group);
          dataPoint[`group_${group}`] = point ? point.intensity : null;
        });
        return dataPoint;
      });
    }
  }, [spectralData, groups]);

  const plotData = getPlotData();

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card className="data-input">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Spectral Data Input
          </CardTitle>
          <CardDescription>
            Enter wavelength and intensity pairs, or upload a data file. Each line should contain wavelength (nm) and intensity values.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="spectral-data">Spectral Data (wavelength intensity pairs)</Label>
            <Textarea
              id="spectral-data"
              placeholder="380 0.05
400 0.08
420 0.12
..."
              value={spectralInput}
              onChange={(e) => handleInputChange(e.target.value)}
              className="min-h-32 font-mono text-sm"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={handleConvert} 
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90"
            >
              <Palette className="h-4 w-4 mr-2" />
              {isLoading ? 'Converting...' : 'Convert to Color'}
            </Button>
            
            <Button variant="outline" onClick={useExample}>
              Use Example Data
            </Button>
            
            <div className="relative">
              <input
                type="file"
                accept=".txt,.dat,.csv"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Upload File
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

        {/* Plot Section */}
        <Card className="data-input">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Spectral Data Plot
              </CardTitle>
              <CardDescription>
                {colorResults.length === 0 
                  ? 'Spectral data preview - convert to see colors'
                  : groups.length > 1 
                    ? `Visualizing ${groups.length} groups of spectral data with their corresponding colors`
                    : 'Visualizing spectral data with converted color'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={plotData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="wavelength" 
                      stroke="hsl(var(--foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="hsl(var(--foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px'
                      }}
                    />
                    {groups.length > 1 ? (
                      groups.map((group, index) => {
                        const grayShades = ['hsl(218, 11%, 65%)', 'hsl(218, 11%, 55%)', 'hsl(218, 11%, 45%)', 'hsl(218, 11%, 35%)', 'hsl(218, 11%, 25%)'];
                        return (
                          <Line 
                            key={group}
                            type="monotone" 
                            dataKey={`group_${group}`}
                            stroke={colorResults[index]?.hex || grayShades[index % grayShades.length]}
                            strokeWidth={2}
                            dot={false}
                            name={`Group ${group}`}
                            connectNulls={false}
                          />
                        )
                      })
                    ) : (
                      <Line 
                        type="monotone" 
                        dataKey="intensity" 
                        stroke={colorResults[0]?.hex || 'hsl(218, 11%, 50%)'}
                        strokeWidth={2}
                        dot={false}
                        name="Intensity"
                      />
                    )}
                    {groups.length > 1 && <Legend />}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
      </div>

      {/* Results Section */}
      {colorResults.length > 0 && (
        <Card className="data-input">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Color Result
              {groups.length > 1 && (
                <Badge variant="secondary">
                  Group {groups[currentGroup]}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {groups.length > 1 
                ? `Showing color from group ${groups[currentGroup]} (${currentGroup + 1} of ${groups.length}). Use the slider to switch between groups.`
                : `Converted color from ${spectralData.length} spectral data points using CIE 1931 color matching functions.`
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {groups.length > 1 && (
              <div className="space-y-2">
                <Label>Group: {groups[currentGroup]} ({currentGroup + 1} of {groups.length})</Label>
                <Slider
                  value={[currentGroup]}
                  onValueChange={(value) => setCurrentGroup(value[0])}
                  max={groups.length - 1}
                  min={0}
                  step={1}
                  className="w-full"
                />
              </div>
            )}
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="normalize" 
                  checked={showNormalized}
                  onCheckedChange={(checked) => setShowNormalized(checked as boolean)}
                />
                <Label htmlFor="normalize" className="text-sm">
                  Show normalized color (divide by max(R,G,B) × 255)
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="gamma" 
                  checked={applyGammaCorrection}
                  onCheckedChange={(checked) => setApplyGammaCorrection(checked as boolean)}
                />
                <Label htmlFor="gamma" className="text-sm">
                  Apply gamma correction (sRGB standard)
                </Label>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Color Swatch */}
              <div className="space-y-4">
                <h3 className="font-semibold">Color Preview</h3>
                <div 
                  className="spectrum-swatch h-32 w-full rounded-lg"
                  style={{ backgroundColor: showNormalized ? colorResults[currentGroup]?.normalizedHex : colorResults[currentGroup]?.hex }}
                />
                <div className="text-center">
                  <div className="text-2xl font-mono font-bold">
                    {showNormalized ? colorResults[currentGroup]?.normalizedHex.toUpperCase() : colorResults[currentGroup]?.hex.toUpperCase()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {showNormalized ? 'Normalized Hex Color Code' : 'Hex Color Code'}
                  </div>
                </div>
              </div>
              
              {/* Color Values */}
              <div className="space-y-4">
                <h3 className="font-semibold">Color Values</h3>
                <div className="space-y-3">
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <div className="text-sm font-medium text-muted-foreground">
                      {showNormalized ? 'Normalized RGB' : 'RGB'}
                    </div>
                    <div className="font-mono">
                      R: {showNormalized ? colorResults[currentGroup]?.normalizedRgb[0] : colorResults[currentGroup]?.rgb[0]}, G: {showNormalized ? colorResults[currentGroup]?.normalizedRgb[1] : colorResults[currentGroup]?.rgb[1]}, B: {showNormalized ? colorResults[currentGroup]?.normalizedRgb[2] : colorResults[currentGroup]?.rgb[2]}
                    </div>
                  </div>
                  
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <div className="text-sm font-medium text-muted-foreground">CIE XYZ</div>
                    <div className="font-mono text-sm">
                      X: {colorResults[currentGroup]?.xyz[0].toFixed(4)}<br />
                      Y: {colorResults[currentGroup]?.xyz[1].toFixed(4)}<br />
                      Z: {colorResults[currentGroup]?.xyz[2].toFixed(4)}
                    </div>
                  </div>
                  
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <div className="text-sm font-medium text-muted-foreground">Chromaticity (x,y)</div>
                    <div className="font-mono">
                      x: {colorResults[currentGroup]?.chromaticity[0].toFixed(4)}<br />
                      y: {colorResults[currentGroup]?.chromaticity[1].toFixed(4)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Section */}
      <Card className="data-input">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            About Spectral Color Conversion
          </CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>
            This tool converts spectral reflection/transmission data to colors using the <strong>CIE 1931 color matching functions</strong>. 
            The conversion process:
          </p>
          <ol>
            <li>Integrates your spectral data with CIE color matching functions (x̄, ȳ, z̄)</li>
            <li>Calculates tristimulus values (X, Y, Z)</li>
            <li>Converts to sRGB color space with gamma correction</li>
            <li>Normalizes chromaticity coordinates</li>
          </ol>
          <p>
            <strong>Data Format:</strong> Each line should contain wavelength (in nm) and intensity values, 
            separated by spaces, tabs, or commas. Lines starting with # are treated as comments.
          </p>
          <div className="bg-muted p-3 rounded-md font-mono text-sm">
            <strong>Two columns:</strong><br/>
            380 0.05<br/>
            400 0.08<br/>
            420 0.12<br/>
            ...<br/><br/>
            <strong>Three or more columns (grouped data):</strong><br/>
            380 0 0.05<br/>
            400 0 0.08<br/>
            380 1 0.07<br/>
            400 1 0.09<br/>
            ...
          </div>
          <p className="text-sm text-muted-foreground">
            For grouped data: wavelength, group_number, [other_columns...], intensity (last column)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}