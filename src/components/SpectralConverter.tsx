import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, Palette, BarChart3, Info, TrendingUp, ExternalLink } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { convertSpectrumToColor, parseSpectralData, getGroups, getAvailableIlluminants, getAvailableObservers, type ColorResult, type SpectralData, type IlluminantType, type ObserverType } from '@/lib/spectralConversion';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ChromaticityDiagram from './ChromaticityDiagram';

interface SpectralConverterProps {
  className?: string;
}

export function SpectralConverter({ className }: SpectralConverterProps) {
  const exampleData = `300	0.00	0.63596
310	0.00	0.55401
320	0.00	0.40733
330	0.00	0.2228
340	0.00	0.14268
350	0.00	0.24313
360	0.00	0.41208
370	0.00	0.52575
380	0.00	0.54025
390	0.00	0.51545
400	0.00	0.47024
410	0.00	0.406
420	0.00	0.3238
430	0.00	0.23024
440	0.00	0.13908
450	0.00	0.06952
460	0.00	0.035421
470	0.00	0.040045
480	0.00	0.07485
490	0.00	0.12554
500	0.00	0.17986
510	0.00	0.23011
520	0.00	0.27266
530	0.00	0.30631
540	0.00	0.33123
550	0.00	0.34787
560	0.00	0.35745
570	0.00	0.36073
580	0.00	0.35828
590	0.00	0.35067
600	0.00	0.33859
610	0.00	0.3225
620	0.00	0.30288
630	0.00	0.28002
640	0.00	0.25462
650	0.00	0.22728
660	0.00	0.19895
670	0.00	0.17024
680	0.00	0.14184
690	0.00	0.11454
700	0.00	0.088975
710	0.00	0.066086
720	0.00	0.046507
730	0.00	0.030732
740	0.00	0.019126
750	0.00	0.011643
760	0.00	0.0082159
770	0.00	0.0086219
780	0.00	0.012545
790	0.00	0.019584
800	0.00	0.029235
300	15.00	0.62104
310	15.00	0.51511
320	15.00	0.34915
330	15.00	0.18224
340	15.00	0.16226
350	15.00	0.28965
360	15.00	0.44504
370	15.00	0.53803
380	15.00	0.53709
390	15.00	0.4999
400	15.00	0.44374
410	15.00	0.36991
420	15.00	0.28144
430	15.00	0.18792
440	15.00	0.10565
450	15.00	0.052657
460	15.00	0.037339
470	15.00	0.05684
480	15.00	0.099173
490	15.00	0.15078
500	15.00	0.20186
510	15.00	0.24692
520	15.00	0.28376
530	15.00	0.31187
540	15.00	0.3317
550	15.00	0.34382
560	15.00	0.34935
570	15.00	0.34898
580	15.00	0.34324
590	15.00	0.33269
600	15.00	0.31805
610	15.00	0.29976
620	15.00	0.27833
630	15.00	0.25407
640	15.00	0.22778
650	15.00	0.20013
660	15.00	0.17212
670	15.00	0.14437
680	15.00	0.11759
690	15.00	0.092527
700	15.00	0.069783
710	15.00	0.050166
720	15.00	0.034164
730	15.00	0.022103
740	15.00	0.01414
750	15.00	0.010115
760	15.00	0.0098292
770	15.00	0.012966
780	15.00	0.019159
790	15.00	0.027977
800	15.00	0.038912
300	30.00	0.54249
310	30.00	0.37713
320	30.00	0.21507
330	30.00	0.17432
340	30.00	0.26793
350	30.00	0.39204
360	30.00	0.49604
370	30.00	0.53936
380	30.00	0.49956
390	30.00	0.43009
400	30.00	0.34775
410	30.00	0.25732
420	30.00	0.16957
430	30.00	0.099504
440	30.00	0.060398
450	30.00	0.055902
460	30.00	0.078813
470	30.00	0.11843
480	30.00	0.16337
490	30.00	0.20614
500	30.00	0.24284
510	30.00	0.27191
520	30.00	0.29316
530	30.00	0.30695
540	30.00	0.31395
550	30.00	0.31483
560	30.00	0.31041
570	30.00	0.30123
580	30.00	0.28782
590	30.00	0.27076
600	30.00	0.25091
610	30.00	0.22872
620	30.00	0.20482
630	30.00	0.17964
640	30.00	0.15415
650	30.00	0.1291
660	30.00	0.10543
670	30.00	0.083675
680	30.00	0.064351
690	30.00	0.047929
700	30.00	0.034709
710	30.00	0.02501
720	30.00	0.018876
730	30.00	0.016206
740	30.00	0.016713
750	30.00	0.020077
760	30.00	0.025932
770	30.00	0.033879
780	30.00	0.043568
790	30.00	0.054624
800	30.00	0.06663
300	45.00	0.37543
310	45.00	0.24757
320	45.00	0.23291
330	45.00	0.29755
340	45.00	0.37312
350	45.00	0.43079
360	45.00	0.47243
370	45.00	0.46336
380	45.00	0.3819
390	45.00	0.28907
400	45.00	0.20716
410	45.00	0.14445
420	45.00	0.1071
430	45.00	0.09553
440	45.00	0.10487
450	45.00	0.12676
460	45.00	0.15389
470	45.00	0.1816
480	45.00	0.20593
490	45.00	0.22516
500	45.00	0.23874
510	45.00	0.24671
520	45.00	0.2494
530	45.00	0.24731
540	45.00	0.24099
550	45.00	0.23116
560	45.00	0.21839
570	45.00	0.20314
580	45.00	0.18603
590	45.00	0.16775
600	45.00	0.14915
610	45.00	0.13063
620	45.00	0.11272
630	45.00	0.095816
640	45.00	0.080519
650	45.00	0.067201
660	45.00	0.056192
670	45.00	0.047548
680	45.00	0.041295
690	45.00	0.037397
700	45.00	0.035773
710	45.00	0.036254
720	45.00	0.038612
730	45.00	0.042588
740	45.00	0.047806
750	45.00	0.054097
760	45.00	0.06122
770	45.00	0.068952
780	45.00	0.077139
790	45.00	0.085605
800	45.00	0.094148
300	60.00	0.37706
310	60.00	0.33651
320	60.00	0.32287
330	60.00	0.31873
340	60.00	0.31843
350	60.00	0.32327
360	60.00	0.34119
370	60.00	0.33736
380	60.00	0.28853
390	60.00	0.24554
400	60.00	0.21663
410	60.00	0.19833
420	60.00	0.18552
430	60.00	0.17589
440	60.00	0.16835
450	60.00	0.16209
460	60.00	0.15674
470	60.00	0.15203
480	60.00	0.14768
490	60.00	0.14353
500	60.00	0.13953
510	60.00	0.13565
520	60.00	0.13189
530	60.00	0.12826
540	60.00	0.12479
550	60.00	0.12148
560	60.00	0.11834
570	60.00	0.11542
580	60.00	0.11273
590	60.00	0.11027
600	60.00	0.108
610	60.00	0.10593
620	60.00	0.10408
630	60.00	0.10248
640	60.00	0.10108
650	60.00	0.099857
660	60.00	0.098744
670	60.00	0.097758
680	60.00	0.096903
690	60.00	0.096167
700	60.00	0.095575
710	60.00	0.095069
720	60.00	0.094635
730	60.00	0.094257
740	60.00	0.093883
750	60.00	0.093552
760	60.00	0.093258
770	60.00	0.092993
780	60.00	0.092764
790	60.00	0.092561
800	60.00	0.092367
300	75.00	0.562
310	75.00	0.43206
320	75.00	0.26532
330	75.00	0.12136
340	75.00	0.10315
350	75.00	0.2079
360	75.00	0.35736
370	75.00	0.46593
380	75.00	0.48214
390	75.00	0.46388
400	75.00	0.43182
410	75.00	0.38822
420	75.00	0.33263
430	75.00	0.26742
440	75.00	0.19722
450	75.00	0.12979
460	75.00	0.072182
470	75.00	0.030145
480	75.00	0.0086691
490	75.00	0.0076929
500	75.00	0.02369
510	75.00	0.051388
520	75.00	0.085498
530	75.00	0.12163
540	75.00	0.15676
550	75.00	0.18837
560	75.00	0.21627
570	75.00	0.24037
580	75.00	0.26041
590	75.00	0.27638
600	75.00	0.28823
610	75.00	0.29665
620	75.00	0.30197
630	75.00	0.30458
640	75.00	0.30457
650	75.00	0.30219
660	75.00	0.29766
670	75.00	0.29126
680	75.00	0.28321
690	75.00	0.27367
700	75.00	0.26277
710	75.00	0.2507
720	75.00	0.23764
730	75.00	0.22377
740	75.00	0.20942
750	75.00	0.19461
760	75.00	0.17951
770	75.00	0.16428
780	75.00	0.14901
790	75.00	0.13386
800	75.00	0.11902`;

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
  const [applyGammaCorrection, setApplyGammaCorrection] = useState(false);
  const [selectedIlluminant, setSelectedIlluminant] = useState<IlluminantType>('D65');
  const [selectedObserver, setSelectedObserver] = useState<ObserverType>('2');
  const [showGloss, setShowGloss] = useState(false);
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
          const result = convertSpectrumToColor(parsed, group, selectedIlluminant, selectedObserver, applyGammaCorrection);
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
        const result = convertSpectrumToColor(parsed, undefined, selectedIlluminant, selectedObserver, applyGammaCorrection);
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
  }, [spectralInput, toast, selectedIlluminant, selectedObserver, applyGammaCorrection]);

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
          
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="illuminant-select" className="text-sm font-medium">
                Standard Illuminant
              </Label>
              <Select value={selectedIlluminant} onValueChange={(value) => setSelectedIlluminant(value as IlluminantType)}>
                <SelectTrigger id="illuminant-select" className="bg-card/50 backdrop-blur-sm border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card/95 backdrop-blur-md border-border/50 z-50">
                  {getAvailableIlluminants().map((illuminant) => (
                    <SelectItem key={illuminant.key} value={illuminant.key}>
                      {illuminant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="observer-select" className="text-sm font-medium">
                Standard Observer
              </Label>
              <Select value={selectedObserver} onValueChange={(value) => setSelectedObserver(value as ObserverType)}>
                <SelectTrigger id="observer-select" className="bg-card/50 backdrop-blur-sm border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card/95 backdrop-blur-md border-border/50 z-50">
                  {getAvailableObservers().map((observer) => (
                    <SelectItem key={observer.key} value={observer.key}>
                      {observer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="gamma-input" 
                checked={applyGammaCorrection}
                onCheckedChange={(checked) => setApplyGammaCorrection(checked as boolean)}
              />
              <Label htmlFor="gamma-input" className="text-sm">
                Apply gamma correction (sRGB standard)
              </Label>
            </div>
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
            
            <Button 
              variant="outline" 
              asChild
              className="bg-card/50 hover:bg-card/70"
            >
              <a 
                href="https://www.kla.com/products/instruments/reflectance-calculator?wmin=380&wmax=780&wstep=5&angle=0&pol=mixed&units=nm&mat%5B%5D=Air&d%5B%5D=0&mat%5B%5D=Al2O3&d%5B%5D=100&mat%5B%5D=Si&d%5B%5D=0&sptype=r" 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Simulate Spectrum (KLA)
              </a>
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
                : `Converted color from ${spectralData.length} spectral data points using CIE color matching functions.`
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
                  id="gloss" 
                  checked={showGloss}
                  onCheckedChange={(checked) => setShowGloss(checked as boolean)}
                />
                <Label htmlFor="gloss" className="text-sm">
                  Show gloss effect
                </Label>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Color Swatch */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Color Preview</h3>
                  <div 
                    className={`spectrum-swatch h-32 w-full rounded-lg ${showGloss ? 'spectrum-swatch-gloss' : ''}`}
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
                    
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <div className="text-sm font-medium text-muted-foreground">Standard Illuminant</div>
                      <div className="font-mono text-sm">
                        {getAvailableIlluminants().find(ill => ill.key === colorResults[currentGroup]?.illuminant)?.name}
                      </div>
                    </div>
                    
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <div className="text-sm font-medium text-muted-foreground">Standard Observer</div>
                      <div className="font-mono text-sm">
                        {getAvailableObservers().find(obs => obs.key === colorResults[currentGroup]?.observer)?.name}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Chromaticity Diagram */}
              <ChromaticityDiagram 
                chromaticity={groups.length > 0 ? groups.map(group => ({
                  x: colorResults[group]?.chromaticity[0] || 0,
                  y: colorResults[group]?.chromaticity[1] || 0,
                  group: group,
                  label: `Group ${group}`
                })).filter(point => colorResults[point.group]) : null}
                observer={colorResults[currentGroup]?.observer}
              />
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
            This tool converts spectral reflection/transmission data to colors using <strong>CIE standard color matching functions</strong> with support for both 2° (CIE 1931) and 10° (CIE 1964) standard observers. 
            The conversion process:
          </p>
          <ol>
            <li>Integrates your spectral data with CIE color matching functions (x̄, ȳ, z̄) for the selected observer</li>
            <li>Calculates tristimulus values (X, Y, Z) weighted by the selected illuminant</li>
            <li>Converts to sRGB color space with optional gamma correction</li>
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