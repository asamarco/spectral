import { SpectralConverter } from '@/components/SpectralConverter';

const Index = () => {
  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <h1 className="text-xl font-semibold">Reflectance spectrum to color conversion</h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <SpectralConverter />
      </div>
    </div>
  );
};

export default Index;
