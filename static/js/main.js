// Global variables
let currentFile = null;
let isProcessing = false;
let currentResults = null;

// DOM elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const previewSection = document.getElementById('previewSection');
const previewImage = document.getElementById('previewImage');
const imageInfo = document.getElementById('imageInfo');
const confidenceSlider = document.getElementById('confidenceSlider');
const confidenceValue = document.getElementById('confidenceValue');
const processBtn = document.getElementById('processBtn');
const loadingSection = document.getElementById('loadingSection');
const progressFill = document.getElementById('progressFill');
const resultsSection = document.getElementById('resultsSection');
const resultImage = document.getElementById('resultImage');
const modelStatus = document.getElementById('modelStatus');
const toastContainer = document.getElementById('toastContainer');
const fullscreenModal = document.getElementById('fullscreenModal');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const fullscreenImage = document.getElementById('fullscreenImage');
const closeFullscreen = document.getElementById('closeFullscreen');
const downloadBtn = document.getElementById('downloadBtn');
const newAnalysisBtn = document.getElementById('newAnalysisBtn');

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    checkModelStatus();
    updateConfidenceDisplay();
});

// Event listeners setup
function initializeEventListeners() {
    // Upload area interactions
    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    
    // File input change
    fileInput.addEventListener('change', handleFileSelect);
    
    // Confidence slider
    confidenceSlider.addEventListener('input', updateConfidenceDisplay);
    
    // Process button
    processBtn.addEventListener('click', processImage);
    
    // Fullscreen functionality
    fullscreenBtn.addEventListener('click', openFullscreen);
    closeFullscreen.addEventListener('click', closeFullscreenModal);
    fullscreenModal.addEventListener('click', (e) => {
        if (e.target === fullscreenModal) closeFullscreenModal();
    });
    
    // Action buttons
    downloadBtn.addEventListener('click', downloadResult);
    newAnalysisBtn.addEventListener('click', resetApplication);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

// Drag and drop handlers
function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFileSelection(files[0]);
    }
}

// File selection handlers
function handleFileSelect(e) {
    const files = e.target.files;
    if (files.length > 0) {
        handleFileSelection(files[0]);
    }
}

function handleFileSelection(file) {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/tiff', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
        showToast('Please select a valid image file', 'error');
        return;
    }
    
    // Validate file size (16MB max)
    const maxSize = 16 * 1024 * 1024;
    if (file.size > maxSize) {
        showToast('File size must be less than 16MB', 'error');
        return;
    }
    
    currentFile = file;
    displayPreview(file);
    uploadArea.classList.add('has-file');
    processBtn.disabled = false;
    
    showToast('Image loaded successfully! Adjust confidence and click Process Image.', 'success');
}

// Display image preview
function displayPreview(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        previewImage.src = e.target.result;
        updateImageInfo(file);
        previewSection.style.display = 'block';
        previewSection.classList.add('fade-in');
    };
    reader.readAsDataURL(file);
}

// Update image information
function updateImageInfo(file) {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    const lastModified = new Date(file.lastModified).toLocaleDateString();
    
    imageInfo.innerHTML = `
        <strong>File:</strong> ${file.name}<br>
        <strong>Size:</strong> ${sizeInMB} MB<br>
        <strong>Type:</strong> ${file.type}<br>
        <strong>Modified:</strong> ${lastModified}
    `;
}

// Update confidence display
function updateConfidenceDisplay() {
    confidenceValue.textContent = confidenceSlider.value;
}

// Process image with YOLO
async function processImage() {
    if (!currentFile || isProcessing) return;
    
    isProcessing = true;
    processBtn.disabled = true;
    processBtn.innerHTML = '<i class=\"fas fa-spinner fa-spin\"></i> Processing...';
    
    // Show loading section
    loadingSection.style.display = 'block';
    loadingSection.classList.add('fade-in');
    resultsSection.style.display = 'none';
    
    // Start progress animation
    animateProgress();
    
    try {
        // Prepare form data
        const formData = new FormData();
        formData.append('file', currentFile);
        formData.append('confidence', confidenceSlider.value);
        
        // Send request to backend
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Processing failed');
        }
        
        // Hide loading section
        loadingSection.style.display = 'none';
        
        // Display results
        displayResults(data);
        
        showToast(`Successfully detected ${data.stats.total_detections} objects!`, 'success');
        
    } catch (error) {
        console.error('Processing error:', error);
        loadingSection.style.display = 'none';
        showToast(`Error: ${error.message}`, 'error');
    } finally {
        isProcessing = false;
        processBtn.disabled = false;
        processBtn.innerHTML = '<i class=\"fas fa-cogs\"></i> Process Image';
    }
}

// Display detection results
function displayResults(data) {
    currentResults = data;
    
    // Display result image
    if (data.image_base64) {
        resultImage.src = data.image_base64;
    }
    
    // Update statistics
    updateStatistics(data.stats);
    
    // Update class distribution
    updateClassDistribution(data.stats.class_counts);
    
    // Update detections table
    updateDetectionsTable(data.detections);
    
    // Show results section
    resultsSection.style.display = 'block';
    resultsSection.classList.add('fade-in');
    
    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

// Update statistics panel
function updateStatistics(stats) {
    document.getElementById('totalObjects').textContent = stats.total_detections;
    document.getElementById('avgConfidence').textContent = `${(stats.average_confidence * 100).toFixed(1)}%`;
    document.getElementById('processingTime').textContent = `${stats.processing_time}ms`;
    document.getElementById('timestamp').textContent = stats.timestamp || new Date().toLocaleString();
}

// Update class distribution
function updateClassDistribution(classCounts) {
    const classList = document.getElementById('classList');
    classList.innerHTML = '';
    
    // Define colors for each class (matching backend colors)
    const classColors = {
        'OxygenTank': '#00ff00',
        'NitrogenTank': '#0000ff', 
        'FirstAidBox': '#ff0000',
        'FireAlarm': '#ffff00',
        'SafetySwitchPanel': '#ff00ff',
        'EmergencyPhone': '#00ffff',
        'FireExtinguisher': '#800080'
    };
    
    Object.entries(classCounts).forEach(([className, count]) => {
        const classItem = document.createElement('div');
        classItem.className = 'class-item';
        classItem.style.borderLeftColor = classColors[className] || '#2563eb';
        
        classItem.innerHTML = `
            <span class=\"class-name\">${className}</span>
            <span class=\"class-count\">${count}</span>
        `;
        
        classList.appendChild(classItem);
    });
}

// Update detections table
function updateDetectionsTable(detections) {
    const tableBody = document.getElementById('detectionsTableBody');
    tableBody.innerHTML = '';
    
    detections.forEach((detection, index) => {
        const row = document.createElement('tr');
        
        // Determine confidence level for styling
        let confidenceClass = 'confidence-low';
        if (detection.confidence >= 0.7) {
            confidenceClass = 'confidence-high';
        } else if (detection.confidence >= 0.4) {
            confidenceClass = 'confidence-medium';
        }
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td><strong>${detection.class}</strong></td>
            <td>
                <span class=\"confidence-badge ${confidenceClass}\">
                    ${(detection.confidence * 100).toFixed(1)}%
                </span>
            </td>
            <td>(${detection.center[0]}, ${detection.center[1]})</td>
            <td>[${detection.bbox.map(coord => Math.round(coord)).join(', ')}]</td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Progress animation
function animateProgress() {
    let progress = 0;
    const interval = setInterval(() => {
        if (progress >= 100 || !isProcessing) {
            clearInterval(interval);
            progressFill.style.width = '100%';
            return;
        }
        
        progress += Math.random() * 15 + 5;
        progressFill.style.width = `${Math.min(progress, 95)}%`;
    }, 200);
}

// Fullscreen functionality
function openFullscreen() {
    if (currentResults && currentResults.image_base64) {
        fullscreenImage.src = currentResults.image_base64;
        fullscreenModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeFullscreenModal() {
    fullscreenModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Download result image
function downloadResult() {
    if (!currentResults || !currentResults.image_base64) {
        showToast('No results to download', 'warning');
        return;
    }
    
    try {
        // Create download link
        const link = document.createElement('a');
        link.href = currentResults.image_base64;
        link.download = `yolo_detection_result_${Date.now()}.png`;
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showToast('Result image downloaded successfully!', 'success');
    } catch (error) {
        console.error('Download error:', error);
        showToast('Failed to download image', 'error');
    }
}

// Reset application
function resetApplication() {
    // Reset file input
    fileInput.value = '';
    currentFile = null;
    currentResults = null;
    
    // Reset UI states
    uploadArea.classList.remove('has-file');
    processBtn.disabled = true;
    processBtn.innerHTML = '<i class=\"fas fa-cogs\"></i> Process Image';
    
    // Hide sections
    previewSection.style.display = 'none';
    loadingSection.style.display = 'none';
    resultsSection.style.display = 'none';
    
    // Reset progress
    progressFill.style.width = '0%';
    
    // Reset confidence slider
    confidenceSlider.value = 0.25;
    updateConfidenceDisplay();
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    showToast('Ready for new image analysis!', 'success');
}

// Check model status
async function checkModelStatus() {
    try {
        const response = await fetch('/health');
        const data = await response.json();
        
        if (data.status === 'healthy' && data.model_loaded) {
            modelStatus.innerHTML = '<i class=\"fas fa-circle\"></i> Model Ready';
            modelStatus.classList.remove('error');
            modelStatus.classList.add('success');
        } else {
            modelStatus.innerHTML = '<i class=\"fas fa-exclamation-triangle\"></i> Model Error';
            modelStatus.classList.remove('success');
            modelStatus.classList.add('error');
        }
    } catch (error) {
        console.error('Health check failed:', error);
        modelStatus.innerHTML = '<i class=\"fas fa-exclamation-triangle\"></i> Connection Error';
        modelStatus.classList.remove('success');
        modelStatus.classList.add('error');
    }
}

// Toast notifications
function showToast(message, type = 'info', duration = 5000) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Add appropriate icon
    let icon = 'fas fa-info-circle';
    if (type === 'success') icon = 'fas fa-check-circle';
    else if (type === 'error') icon = 'fas fa-exclamation-triangle';
    else if (type === 'warning') icon = 'fas fa-exclamation-circle';
    
    toast.innerHTML = `
        <div style=\"display: flex; align-items: center; gap: 0.75rem;\">
            <i class=\"${icon}\" style=\"font-size: 1.25rem;\"></i>
            <span>${message}</span>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    
    // Auto remove toast
    setTimeout(() => {
        if (toast.parentNode) {
            toast.style.transform = 'translateX(100%)';
            toast.style.opacity = '0';
            setTimeout(() => {
                if (toast.parentNode) {
                    toastContainer.removeChild(toast);
                }
            }, 300);
        }
    }, duration);
}

// Keyboard shortcuts
function handleKeyboardShortcuts(e) {
    // Ctrl/Cmd + O: Open file
    if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
        e.preventDefault();
        fileInput.click();
    }
    
    // Enter: Process image (if file selected)
    if (e.key === 'Enter' && currentFile && !isProcessing) {
        processImage();
    }
    
    // Escape: Close fullscreen or reset
    if (e.key === 'Escape') {
        if (fullscreenModal.style.display === 'flex') {
            closeFullscreenModal();
        } else if (currentResults) {
            resetApplication();
        }
    }
    
    // F: Fullscreen (if results available)
    if (e.key === 'f' && currentResults) {
        openFullscreen();
    }
    
    // D: Download (if results available)
    if (e.key === 'd' && currentResults) {
        downloadResult();
    }
}

// Utility functions
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Performance monitoring
let performanceMetrics = {
    uploadTime: 0,
    processTime: 0,
    renderTime: 0
};

function logPerformance(metric, value) {
    performanceMetrics[metric] = value;
    console.log(`Performance - ${metric}: ${value}ms`);
}

// Error handling
window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.error);
    showToast('An unexpected error occurred. Please refresh the page.', 'error');
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
    showToast('A network error occurred. Please check your connection.', 'error');
});

// Service worker registration (for offline functionality)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        // Commented out for now - can be implemented later
        // navigator.serviceWorker.register('/sw.js');
    });
}

// Export functions for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        handleFileSelection,
        updateConfidenceDisplay,
        showToast,
        formatBytes
    };
}
