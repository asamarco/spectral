import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Palette, BarChart3, Info } from 'lucide-react';
import { convertSpectrumToColor, parseSpectralData, type ColorResult, type SpectralData } from '@/lib/spectralConversion';
import { useToast } from '@/hooks/use-toast';

interface SpectralConverterProps {
  className?: string;
}

export function SpectralConverter({ className }: SpectralConverterProps) {
  const [spectralInput, setSpectralInput] = useState('');
  const [colorResult, setColorResult] = useState<ColorResult | null>(null);
  const [spectralData, setSpectralData] = useState<SpectralData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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

      const result = convertSpectrumToColor(parsed);
      
      if (!result) {
        throw new Error('Unable to convert spectrum to color');
      }

      setSpectralData(parsed);
      setColorResult(result);
      
      toast({
        title: "Conversion successful!",
        description: `Converted ${parsed.length} spectral data points to color.`,
      });
    } catch (error) {
      toast({
        title: "Conversion failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
      setColorResult(null);
      setSpectralData([]);
    } finally {
      setIsLoading(false);
    }
  }, [spectralInput, toast]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setSpectralInput(content);
      toast({
        title: "File loaded",
        description: `Loaded ${file.name} successfully.`,
      });
    };
    reader.readAsText(file);
  }, [toast]);

  const useExample = useCallback(() => {
    setSpectralInput(exampleData);
    toast({
      title: "Example loaded",
      description: "Loaded example spectral data for a typical reflection spectrum.",
    });
  }, [toast]);

  return (
    <div className={`space-y-6 ${className}`}>
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
              onChange={(e) => setSpectralInput(e.target.value)}
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

      {/* Results Section */}
      {colorResult && (
        <Card className="data-input">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Color Result
            </CardTitle>
            <CardDescription>
              Converted color from {spectralData.length} spectral data points using CIE 1931 color matching functions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Color Swatch */}
              <div className="space-y-4">
                <h3 className="font-semibold">Color Preview</h3>
                <div 
                  className="spectrum-swatch h-32 w-full rounded-lg"
                  style={{ backgroundColor: colorResult.hex }}
                />
                <div className="text-center">
                  <div className="text-2xl font-mono font-bold">{colorResult.hex.toUpperCase()}</div>
                  <div className="text-sm text-muted-foreground">Hex Color Code</div>
                </div>
              </div>
              
              {/* Color Values */}
              <div className="space-y-4">
                <h3 className="font-semibold">Color Values</h3>
                <div className="space-y-3">
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <div className="text-sm font-medium text-muted-foreground">RGB</div>
                    <div className="font-mono">
                      R: {colorResult.rgb[0]}, G: {colorResult.rgb[1]}, B: {colorResult.rgb[2]}
                    </div>
                  </div>
                  
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <div className="text-sm font-medium text-muted-foreground">CIE XYZ</div>
                    <div className="font-mono text-sm">
                      X: {colorResult.xyz[0].toFixed(4)}<br />
                      Y: {colorResult.xyz[1].toFixed(4)}<br />
                      Z: {colorResult.xyz[2].toFixed(4)}
                    </div>
                  </div>
                  
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <div className="text-sm font-medium text-muted-foreground">Chromaticity (x,y)</div>
                    <div className="font-mono">
                      x: {colorResult.chromaticity[0].toFixed(4)}<br />
                      y: {colorResult.chromaticity[1].toFixed(4)}
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
        </CardContent>
      </Card>
    </div>
  );
}