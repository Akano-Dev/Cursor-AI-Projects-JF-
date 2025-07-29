// Global variables
let video;
let canvas;
let isModelLoaded = false;
let isCameraActive = false;
let faceDetectionInterval;

// DOM elements
let startButton, scanButton, resultsSection, scoreNumber, symmetryBar, proportionsBar, landmarksBar;
let symmetryValue, proportionsValue, landmarksValue, faceFrame;

// Function to get DOM elements
function getDOMElements() {
    startButton = document.getElementById('startButton');
    scanButton = document.getElementById('scanButton');
    resultsSection = document.getElementById('resultsSection');
    scoreNumber = document.getElementById('scoreNumber');
    symmetryBar = document.getElementById('symmetryBar');
    proportionsBar = document.getElementById('proportionsBar');
    landmarksBar = document.getElementById('landmarksBar');
    symmetryValue = document.getElementById('symmetryValue');
    proportionsValue = document.getElementById('proportionsValue');
    landmarksValue = document.getElementById('landmarksValue');
    faceFrame = document.querySelector('.face-frame');
    
    // Check if all elements are found
    const elements = {
        startButton, scanButton, resultsSection, scoreNumber, 
        symmetryBar, proportionsBar, landmarksBar, symmetryValue, 
        proportionsValue, landmarksValue, faceFrame
    };
    
    for (const [name, element] of Object.entries(elements)) {
        if (!element) {
            console.error(`Element not found: ${name}`);
        } else {
            console.log(`Element found: ${name}`, element);
        }
    }
}

// Initialize the application
async function init() {
    console.log('Initializing application...');
    
    // Get DOM elements
    getDOMElements();
    
    video = document.getElementById('video');
    canvas = document.getElementById('canvas');
    
    console.log('Video element:', video);
    console.log('Canvas element:', canvas);
    
    // Load face-api.js models
    await loadModels();
    
    // Set up event listeners
    if (startButton) {
        startButton.addEventListener('click', () => {
            console.log('Start button clicked!');
            startCamera();
        });
    }
    
    if (scanButton) {
        scanButton.addEventListener('click', () => {
            console.log('Scan button clicked!');
            analyzeFace();
        });
    }
    
    console.log('Event listeners attached');
}

// Load face-api.js models
async function loadModels() {
    try {
        showLoading(startButton);
        
        // Load models from CDN
        await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri('https://justadudewhohacks.github.io/face-api.js/models'),
            faceapi.nets.faceLandmark68Net.loadFromUri('https://justadudewhohacks.github.io/face-api.js/models'),
            faceapi.nets.faceRecognitionNet.loadFromUri('https://justadudewhohacks.github.io/face-api.js/models')
        ]);
        
        isModelLoaded = true;
        hideLoading(startButton);
        startButton.querySelector('.btn-text').textContent = 'Start Camera';
        
        console.log('Models loaded successfully');
    } catch (error) {
        console.error('Error loading models:', error);
        hideLoading(startButton);
        startButton.querySelector('.btn-text').textContent = 'Error Loading Models';
        alert('Failed to load AI models. Please refresh the page and try again.');
    }
}

// Start camera
async function startCamera() {
    if (!isModelLoaded) {
        alert('Please wait for the AI models to load.');
        return;
    }
    
    try {
        showLoading(startButton);
        
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 640 },
                height: { ideal: 480 },
                facingMode: 'user'
            }
        });
        
        video.srcObject = stream;
        isCameraActive = true;
        
        // Wait for video to be ready
        video.addEventListener('loadedmetadata', () => {
            console.log('Video ready:', video.videoWidth, 'x', video.videoHeight);
            hideLoading(startButton);
            startButton.querySelector('.btn-text').textContent = 'Camera Active';
            startButton.disabled = true;
            scanButton.disabled = false;
            
            // Start face detection
            startFaceDetection();
        });
        
    } catch (error) {
        console.error('Error accessing camera:', error);
        hideLoading(startButton);
        startButton.querySelector('.btn-text').textContent = 'Camera Error';
        alert('Failed to access camera. Please check your camera permissions and try again.');
    }
}

// Start continuous face detection
function startFaceDetection() {
    faceDetectionInterval = setInterval(async () => {
        if (video.paused || video.ended || !video.videoWidth) return;
        
        try {
            const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks();
            
            if (detections.length > 0) {
                faceFrame.classList.add('active');
            } else {
                faceFrame.classList.remove('active');
            }
        } catch (error) {
            console.log('Face detection error:', error);
        }
    }, 200);
}

// Analyze face and calculate rating
async function analyzeFace() {
    console.log('analyzeFace function called');
    console.log('isCameraActive:', isCameraActive);
    
    if (!isCameraActive) {
        alert('Please start the camera first.');
        return;
    }
    
    if (!video.videoWidth || !video.videoHeight) {
        alert('Video is not ready. Please wait a moment and try again.');
        return;
    }
    
    try {
        showLoading(scanButton);
        scanButton.disabled = true;
        
        // Set canvas size to match video dimensions
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Capture frame from video
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        console.log('Canvas size:', canvas.width, 'x', canvas.height);
        console.log('Video size:', video.videoWidth, 'x', video.videoHeight);
        
        // Detect face and landmarks
        const detections = await faceapi.detectAllFaces(canvas, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks();
        
        console.log('Detections found:', detections.length);
        
        if (detections.length === 0) {
            alert('No face detected. Please position your face in the camera view and ensure good lighting.');
            hideLoading(scanButton);
            scanButton.disabled = false;
            return;
        }
        
        if (detections.length > 1) {
            alert('Multiple faces detected. Please ensure only one face is visible.');
            hideLoading(scanButton);
            scanButton.disabled = false;
            return;
        }
        
        const face = detections[0];
        const landmarks = face.landmarks;
        
        console.log('Landmarks detected:', landmarks.positions.length);
        
        // Calculate face rating
        const rating = calculateFaceRating(landmarks);
        
        console.log('Rating calculated:', rating);
        
        // Display results
        displayResults(rating);
        
        hideLoading(scanButton);
        scanButton.disabled = false;
        
    } catch (error) {
        console.error('Error analyzing face:', error);
        hideLoading(scanButton);
        scanButton.disabled = false;
        alert('Error analyzing face: ' + error.message + '. Please try again.');
    }
}

// Calculate face rating based on facial features
function calculateFaceRating(landmarks) {
    const points = landmarks.positions;
    
    // 1. Facial Symmetry (30% of total score)
    const symmetryScore = calculateSymmetry(points);
    
    // 2. Golden Ratio Proportions (40% of total score)
    const proportionsScore = calculateProportions(points);
    
    // 3. Landmark Positioning (30% of total score)
    const landmarksScore = calculateLandmarkPositioning(points);
    
    // Calculate weighted average
    const totalScore = (symmetryScore * 0.3) + (proportionsScore * 0.4) + (landmarksScore * 0.3);
    
    return {
        total: Math.round(totalScore * 10) / 10,
        symmetry: Math.round(symmetryScore * 100),
        proportions: Math.round(proportionsScore * 100),
        landmarks: Math.round(landmarksScore * 100)
    };
}

// Calculate facial symmetry
function calculateSymmetry(points) {
    const leftEye = points[36]; // Left eye corner
    const rightEye = points[45]; // Right eye corner
    const nose = points[30]; // Nose tip
    const leftMouth = points[48]; // Left mouth corner
    const rightMouth = points[54]; // Right mouth corner
    
    // Calculate distances from nose to left and right features
    const leftEyeDistance = Math.sqrt(
        Math.pow(leftEye.x - nose.x, 2) + Math.pow(leftEye.y - nose.y, 2)
    );
    const rightEyeDistance = Math.sqrt(
        Math.pow(rightEye.x - nose.x, 2) + Math.pow(rightEye.y - nose.y, 2)
    );
    
    const leftMouthDistance = Math.sqrt(
        Math.pow(leftMouth.x - nose.x, 2) + Math.pow(leftMouth.y - nose.y, 2)
    );
    const rightMouthDistance = Math.sqrt(
        Math.pow(rightMouth.x - nose.x, 2) + Math.pow(rightMouth.y - nose.y, 2)
    );
    
    // Calculate symmetry ratios
    const eyeSymmetry = Math.min(leftEyeDistance, rightEyeDistance) / Math.max(leftEyeDistance, rightEyeDistance);
    const mouthSymmetry = Math.min(leftMouthDistance, rightMouthDistance) / Math.max(leftMouthDistance, rightMouthDistance);
    
    return (eyeSymmetry + mouthSymmetry) / 2;
}

// Calculate golden ratio proportions
function calculateProportions(points) {
    const leftEye = points[36];
    const rightEye = points[45];
    const nose = points[30];
    const leftMouth = points[48];
    const rightMouth = points[54];
    
    // Calculate face width (distance between eyes)
    const faceWidth = Math.sqrt(
        Math.pow(rightEye.x - leftEye.x, 2) + Math.pow(rightEye.y - leftEye.y, 2)
    );
    
    // Calculate face height (distance from eyes to mouth)
    const eyeCenter = {
        x: (leftEye.x + rightEye.x) / 2,
        y: (leftEye.y + rightEye.y) / 2
    };
    const mouthCenter = {
        x: (leftMouth.x + rightMouth.x) / 2,
        y: (leftMouth.y + rightMouth.y) / 2
    };
    const faceHeight = Math.sqrt(
        Math.pow(mouthCenter.x - eyeCenter.x, 2) + Math.pow(mouthCenter.y - eyeCenter.y, 2)
    );
    
    // Golden ratio is approximately 1.618
    const goldenRatio = 1.618;
    const idealRatio = faceWidth / faceHeight;
    const ratioDifference = Math.abs(idealRatio - goldenRatio) / goldenRatio;
    
    // Convert to score (closer to golden ratio = higher score)
    return Math.max(0, 1 - ratioDifference);
}

// Calculate landmark positioning
function calculateLandmarkPositioning(points) {
    const leftEye = points[36];
    const rightEye = points[45];
    const nose = points[30];
    const leftMouth = points[48];
    const rightMouth = points[54];
    
    // Calculate ideal triangle proportions
    const eyeDistance = Math.sqrt(
        Math.pow(rightEye.x - leftEye.x, 2) + Math.pow(rightEye.y - leftEye.y, 2)
    );
    
    const leftEyeToNose = Math.sqrt(
        Math.pow(nose.x - leftEye.x, 2) + Math.pow(nose.y - leftEye.y, 2)
    );
    const rightEyeToNose = Math.sqrt(
        Math.pow(nose.x - rightEye.x, 2) + Math.pow(nose.y - rightEye.y, 2)
    );
    
    const noseToMouth = Math.sqrt(
        Math.pow((leftMouth.x + rightMouth.x) / 2 - nose.x, 2) + 
        Math.pow((leftMouth.y + rightMouth.y) / 2 - nose.y, 2)
    );
    
    // Ideal proportions: nose should be roughly 1/3 down from eyes to mouth
    const idealNosePosition = noseToMouth / 3;
    const actualNosePosition = Math.min(leftEyeToNose, rightEyeToNose);
    const nosePositionRatio = Math.min(actualNosePosition, idealNosePosition) / Math.max(actualNosePosition, idealNosePosition);
    
    // Eye alignment (should be roughly horizontal)
    const eyeAngle = Math.abs(Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x));
    const eyeAlignmentScore = Math.max(0, 1 - (eyeAngle / (Math.PI / 6))); // Allow 30 degrees deviation
    
    return (nosePositionRatio + eyeAlignmentScore) / 2;
}

// Display results with animations
function displayResults(rating) {
    resultsSection.style.display = 'block';
    
    // Animate score number
    animateNumber(scoreNumber, 0, rating.total, 1000);
    
    // Animate metric bars
    setTimeout(() => {
        animateBar(symmetryBar, symmetryValue, rating.symmetry);
    }, 200);
    
    setTimeout(() => {
        animateBar(proportionsBar, proportionsValue, rating.proportions);
    }, 400);
    
    setTimeout(() => {
        animateBar(landmarksBar, landmarksValue, rating.landmarks);
    }, 600);
}

// Animate number counting
function animateNumber(element, start, end, duration) {
    const startTime = performance.now();
    const difference = end - start;
    
    function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const current = start + (difference * progress);
        element.textContent = current.toFixed(1);
        
        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        }
    }
    
    requestAnimationFrame(updateNumber);
}

// Animate progress bar
function animateBar(barElement, valueElement, targetValue) {
    const duration = 1000;
    const startTime = performance.now();
    const startWidth = 0;
    
    function updateBar(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const currentWidth = startWidth + (targetValue - startWidth) * progress;
        barElement.style.width = currentWidth + '%';
        valueElement.textContent = Math.round(currentWidth) + '%';
        
        if (progress < 1) {
            requestAnimationFrame(updateBar);
        }
    }
    
    requestAnimationFrame(updateBar);
}

// Show loading state
function showLoading(button) {
    const btnText = button.querySelector('.btn-text');
    const btnLoader = button.querySelector('.btn-loader');
    
    btnText.style.display = 'none';
    btnLoader.style.display = 'flex';
    button.disabled = true;
}

// Hide loading state
function hideLoading(button) {
    const btnText = button.querySelector('.btn-text');
    const btnLoader = button.querySelector('.btn-loader');
    
    btnText.style.display = 'block';
    btnLoader.style.display = 'none';
    button.disabled = false;
}

// Clean up resources
function cleanup() {
    if (faceDetectionInterval) {
        clearInterval(faceDetectionInterval);
    }
    
    if (video && video.srcObject) {
        const tracks = video.srcObject.getTracks();
        tracks.forEach(track => track.stop());
    }
}

// Handle page unload
window.addEventListener('beforeunload', cleanup);

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init); 