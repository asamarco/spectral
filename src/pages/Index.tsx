import { SpectralConverter } from '@/components/SpectralConverter';
import { Atom, Zap, Palette } from 'lucide-react';

const Index = () => {
  console.log('Index component is rendering');
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-background via-background to-accent/20">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="flex items-center gap-2 text-4xl">
                <Atom className="h-12 w-12 text-primary animate-pulse" />
                <span className="gradient-text font-bold">Spectral</span>
                <Palette className="h-8 w-8 text-accent" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Spectrum to <span className="gradient-text">Color</span> Converter
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Transform spectral reflection data into precise colors using CIE 1931 color matching functions. 
              A scientific tool for researchers, designers, and color enthusiasts.
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-spectrum-blue" />
                Real-time conversion
              </div>
              <div className="flex items-center gap-2">
                <Atom className="h-4 w-4 text-spectrum-violet" />
                CIE 1931 standard
              </div>
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-spectrum-green" />
                Precise color matching
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <SpectralConverter />
      </div>
    </div>
  );
};

export default Index;
