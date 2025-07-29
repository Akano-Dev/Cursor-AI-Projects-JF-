# Face Rater - AI Beauty Analysis

A modern, responsive web application that uses AI to analyze facial features and provide a beauty rating out of 10. Built with HTML, CSS, and JavaScript using the face-api.js library for facial analysis.

## Features

- **Real-time Face Detection**: Uses your webcam to detect and analyze faces in real-time
- **AI-Powered Analysis**: Leverages face-api.js for accurate facial landmark detection
- **Beauty Scoring Algorithm**: Calculates ratings based on:
  - Facial Symmetry (30% weight)
  - Golden Ratio Proportions (40% weight)
  - Landmark Positioning (30% weight)
- **Modern UI/UX**: Clean, responsive design with smooth animations
- **Client-Side Processing**: All analysis is done locally in your browser
- **Detailed Breakdown**: Shows individual scores for each analysis component

## How It Works

### Facial Analysis Algorithm

The application analyzes three key aspects of facial beauty:

1. **Facial Symmetry**: Measures how balanced your facial features are by comparing distances from the nose to left and right features (eyes and mouth corners)

2. **Golden Ratio Proportions**: Evaluates how well your face proportions align with the golden ratio (1.618), which is considered aesthetically pleasing

3. **Landmark Positioning**: Assesses the positioning of key facial features like eyes, nose, and mouth relative to ideal proportions

### Technical Implementation

- **face-api.js**: Used for facial landmark detection with 68 key points
- **WebRTC**: Handles webcam access and video streaming
- **Canvas API**: Captures video frames for analysis
- **CSS Animations**: Provides smooth transitions and loading states

## Getting Started

### Prerequisites

- Modern web browser with camera access
- HTTPS connection (required for camera access in most browsers)

### Installation

1. Clone or download this repository
2. Open `index.html` in your web browser
3. Allow camera permissions when prompted
4. Click "Start Camera" to begin

### Usage

1. **Start Camera**: Click the "Start Camera" button to activate your webcam
2. **Position Your Face**: Ensure your face is clearly visible in the camera view
3. **Scan Face**: Click "Scan My Face" to analyze your facial features
4. **View Results**: See your beauty rating and detailed breakdown

## File Structure

```
Face Rater/
├── index.html          # Main HTML file
├── styles.css          # CSS styling and animations
├── script.js           # JavaScript logic and face analysis
└── README.md           # This documentation
```

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## Privacy & Security

- **No Data Storage**: All analysis is performed locally in your browser
- **No Server Communication**: No facial data is sent to external servers
- **Camera Access**: Only used for real-time analysis, not recorded or stored

## Technical Details

### Face Detection
- Uses TinyFaceDetector for fast, efficient face detection
- Detects 68 facial landmarks for detailed analysis
- Real-time detection with visual feedback

### Scoring Algorithm
The final score is calculated using a weighted average:
```
Total Score = (Symmetry × 0.3) + (Proportions × 0.4) + (Landmarks × 0.3)
```

### Performance
- Optimized for real-time processing
- Efficient canvas operations for frame capture
- Smooth animations using requestAnimationFrame

## Customization

### Modifying the Algorithm
You can adjust the scoring weights in `script.js`:
```javascript
const totalScore = (symmetryScore * 0.3) + (proportionsScore * 0.4) + (landmarksScore * 0.3);
```

### Styling
The application uses CSS custom properties and can be easily customized by modifying `styles.css`.

## Troubleshooting

### Common Issues

1. **Camera Not Working**
   - Ensure you're using HTTPS
   - Check camera permissions in browser settings
   - Try refreshing the page

2. **No Face Detected**
   - Ensure good lighting
   - Position face clearly in camera view
   - Remove glasses or accessories that might interfere

3. **Slow Performance**
   - Close other applications using the camera
   - Ensure stable internet connection for model loading
   - Try on a different browser

### Error Messages

- **"Failed to load AI models"**: Check internet connection and refresh
- **"Failed to access camera"**: Check camera permissions and browser settings
- **"No face detected"**: Adjust lighting and positioning

## Contributing

Feel free to contribute to this project by:
- Reporting bugs
- Suggesting new features
- Improving the algorithm
- Enhancing the UI/UX

## License

This project is open source and available under the MIT License.

## Disclaimer

This application is for entertainment purposes only. Beauty is subjective and varies across cultures and individuals. The ratings provided are based on mathematical analysis of facial proportions and should not be taken as objective truth.

## Acknowledgments

- [face-api.js](https://github.com/justadudewhohacks/face-api.js) - Facial recognition library
- [Inter Font](https://rsms.me/inter/) - Typography
- Modern CSS techniques and animations 