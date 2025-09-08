# Spectral Color Converter

A professional web application for converting spectral reflection data into accurate color representations using CIE 1931 color matching functions. This tool is designed for researchers, color scientists, designers, and anyone working with spectral data analysis.

## Features

### Core Functionality
- **Spectral to Color Conversion**: Transform wavelength-based reflection data (300-800nm) into precise color values
- **CIE 1931 Standard**: Uses scientifically accurate color matching functions for reliable results
- **Multi-Angle Support**: Process spectral data at different measurement angles (0°, 15°, 30°, 45°, 60°, 75°)
- **Real-time Processing**: Instant color preview as you input or modify spectral data

### Advanced Options
- **Multiple Illuminants**: Support for various standard illuminants (D65, A, C, etc.)
- **Observer Options**: 2° and 10° standard observer support
- **Gamma Correction**: Optional gamma correction for display optimization
- **Data Validation**: Automatic validation of spectral data format and ranges

### User Interface
- **Intuitive Design**: Clean, professional interface optimized for scientific work
- **Data Input Methods**: 
  - Manual text input with validation
  - File upload support
  - Copy-paste functionality
- **Visual Feedback**: Color swatches with RGB/Hex values
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## How It Works

The application implements the CIE 1931 color matching standard to convert spectral reflection data into XYZ color space, then transforms it to RGB for display. The process involves:

1. **Data Parsing**: Validates and processes spectral reflection data
2. **Color Matching**: Applies CIE 1931 color matching functions
3. **Illuminant Correction**: Adjusts for selected illuminant characteristics
4. **Color Space Conversion**: Transforms XYZ to RGB color space
5. **Display Optimization**: Optional gamma correction for accurate screen representation

## Input Format

The application accepts spectral data in tab-separated format:
```
wavelength(nm)  angle(degrees)  reflectance(0-1)
300             0.00           0.63596
310             0.00           0.55401
...
```

## Technologies Used

- **React 18**: Modern React with hooks and functional components
- **TypeScript**: Type-safe development and better code reliability
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **shadcn/ui**: High-quality, accessible UI components

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd spectral-color-converter
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:8080`

### Building for Production

```bash
npm run build
```

The built application will be available in the `dist` directory.

## Usage Examples

### Basic Spectral Data
Input reflectance values for wavelengths from 300-800nm at specific angles to see the resulting color.

### Multi-Angle Analysis
Compare how the same material appears at different viewing angles by inputting data for multiple angle measurements.

### Color Matching
Use different illuminants to see how colors appear under various lighting conditions.

## Scientific Accuracy

This tool implements industry-standard color science practices:
- CIE 1931 2° Standard Observer color matching functions
- Standard illuminant data (D65, A, C, etc.)
- Proper normalization and scaling
- Scientifically accurate color space transformations

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## License

This project is open source and available under the MIT License.

## Support

For questions, issues, or feature requests, please open an issue in the repository or contact the development team.

---

*Built with precision for color science professionals and enthusiasts.*