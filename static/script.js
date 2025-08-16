// Global variables
let selectedFile = null;
let isAnalyzing = false;

// DOM elements
const uploadArea = document.getElementById('uploadArea');
const imageInput = document.getElementById('imageInput');
const previewArea = document.getElementById('previewArea');
const previewImg = document.getElementById('previewImg');
const fileName = document.getElementById('fileName');
const fileSize = document.getElementById('fileSize');
const resultsSection = document.getElementById('resultsSection');
const loadingOverlay = document.getElementById('loadingOverlay');

// Initialize event listeners
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    animateElements();
});

function initializeEventListeners() {
    // File input change
    if (imageInput) {
        imageInput.addEventListener('change', handleFileSelect);
    }

    // Drag and drop
    if (uploadArea) {
        uploadArea.addEventListener('dragover', handleDragOver);
        uploadArea.addEventListener('drop', handleDrop);
        uploadArea.addEventListener('dragleave', handleDragLeave);

        // Click to upload
        uploadArea.addEventListener('click', () => {
            if (!selectedFile && imageInput) {
                imageInput.click();
            }
        });
    }
}

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
        const file = files[0];
        if (isValidImageFile(file)) {
            selectedFile = file;
            displayPreview(file);
        } else {
            showError('Please select a valid image file (PNG, JPG, JPEG, GIF, BMP)');
        }
    }
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file && isValidImageFile(file)) {
        selectedFile = file;
        displayPreview(file);
    } else if (file) {
        showError('Please select a valid image file (PNG, JPG, JPEG, GIF, BMP)');
    }
}

function isValidImageFile(file) {
    const validTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/gif', 'image/bmp'];
    return validTypes.includes(file.type) && file.size <= 16 * 1024 * 1024; // 16MB limit
}

function displayPreview(file) {
    const reader = new FileReader();

    reader.onload = function(e) {
        if (previewImg && fileName && fileSize) {
            previewImg.src = e.target.result;
            fileName.textContent = `File: ${file.name}`;
            fileSize.textContent = `Size: ${formatFileSize(file.size)}`;

            // Hide upload area and show preview
            if (uploadArea) uploadArea.style.display = 'none';
            if (previewArea) {
                previewArea.style.display = 'block';
                previewArea.classList.add('animate-fade-up');
            }
        }
    };

    reader.readAsDataURL(file);
}

function removeImage() {
    selectedFile = null;
    if (imageInput) imageInput.value = '';

    // Hide preview and show upload area
    if (previewArea) previewArea.style.display = 'none';
    if (uploadArea) uploadArea.style.display = 'block';

    // Reset results
    if (resultsSection) resultsSection.style.display = 'none';
}

function analyzeImage() {
    if (!selectedFile || isAnalyzing) return;

    isAnalyzing = true;
    showLoading();

    const formData = new FormData();
    formData.append('file', selectedFile);

    // Animate analyze button
    const analyzeBtn = document.querySelector('.analyze-btn');
    const btnText = analyzeBtn.querySelector('span');
    const btnLoader = analyzeBtn.querySelector('.analyze-loader');

    if (analyzeBtn && btnText && btnLoader) {
        analyzeBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'block';
    }

    fetch('/analyze', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            displayResults(data);

            // Store result for result page
            localStorage.setItem('analysisResult', JSON.stringify(data));
        } else {
            showError(data.error || 'Analysis failed. Please try again.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showError('Network error. Please check your connection and try again.');
    })
    .finally(() => {
        hideLoading();
        isAnalyzing = false;

        // Reset analyze button
        if (analyzeBtn && btnText && btnLoader) {
            analyzeBtn.disabled = false;
            btnText.style.display = 'inline';
            btnLoader.style.display = 'none';
        }
    });
}

function showLoading() {
    if (loadingOverlay) {
        loadingOverlay.style.display = 'flex';

        // Animate progress bar
        const progressFill = document.querySelector('.progress-fill');
        if (progressFill) {
            progressFill.style.animation = 'progress 3s ease-in-out infinite';
        }
    }
}

function hideLoading() {
    setTimeout(() => {
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
    }, 500);
}

function displayResults(data) {
    const resultsContainer = document.querySelector('.results-container');
    if (!resultsContainer || !previewImg) return;

    const info = data.info || {};

    resultsContainer.innerHTML = `
        <div class="result-card animate-fade-up">
            <div class="result-header">
                <h2>AI Analysis Complete</h2>
                <p>Preliminary skin condition assessment using artificial intelligence</p>
            </div>
            
            <div class="result-content-grid">
                <div class="result-image">
                    <img src="${previewImg.src}" alt="Analyzed Image">
                    <div class="scan-overlay"></div>
                </div>
                
                <div class="result-details">
                    <div class="diagnosis-summary">
                        <div class="condition-badge" style="background: ${info.color || '#17a2b8'}">
                            <i class="fas fa-stethoscope"></i>
                            <span>${data.prediction}</span>
                        </div>
                    </div>
                    
                    <div class="diagnosis-info">
                        <div class="info-card">
                            <h4><i class="fas fa-info-circle"></i> Description</h4>
                            <p>${info.description || 'No description available.'}</p>
                        </div>
                        
                        <div class="confidence-card">
                            <h4><i class="fas fa-chart-line"></i> AI Confidence Assessment</h4>
                            <div class="confidence-content">
                                <div class="confidence-bar-container">
                                    <div class="confidence-bar" style="width: ${data.confidence}%"></div>
                                </div>
                                <div class="confidence-text-large">${data.confidence}%</div>
                            </div>
                            <p class="confidence-note">This percentage indicates how certain the AI model is about this prediction based on learned patterns.</p>
                        </div>
                        
                        <div class="info-card">
                            <h4><i class="fas fa-pills"></i> Potential Treatment Options</h4>
                            <p>${Array.isArray(info.treatment) ? info.treatment.join(' • ') : info.treatment || 'Consult healthcare provider for proper treatment options.'}</p>
                        </div>
                        
                        <div class="info-card">
                            <h4><i class="fas fa-symptoms"></i> Associated Symptoms</h4>
                            <ul class="symptoms-list">
                                ${Array.isArray(info.symptoms) ? info.symptoms.map(symptom => `<li>${symptom}</li>`).join('') : '<li>Consult healthcare provider for symptom evaluation</li>'}
                            </ul>
                        </div>
                        
                        <div class="severity-display">
                            <span class="severity-label">Risk Level:</span>
                            <span class="severity-badge ${getSeverityClass(info.severity)}">${info.severity || 'Unknown'}</span>
                        </div>
                    </div>
                    
                    <div class="result-actions">
                        <button class="btn btn-download" onclick="downloadReport('${data.report_filename}')">
                            <i class="fas fa-download"></i>
                            Download Full Report
                        </button>
                        <button class="btn btn-secondary" onclick="removeImage()">
                            <i class="fas fa-plus"></i>
                            Analyze Another Image
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="accuracy-warning">
                <div class="warning-header">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Important Accuracy Notice</h3>
                </div>
                <p>This AI prediction is <strong>not 100% accurate</strong> and should be interpreted with caution. Many skin diseases can appear visually similar and may share overlapping characteristics, making precise differentiation challenging even for advanced AI systems. Factors such as lighting conditions, image quality, disease stage, and individual skin variations can significantly impact analysis accuracy.</p>
            </div>
            
            <div class="medical-disclaimer">
                <i class="fas fa-user-md"></i>
                <div class="disclaimer-content">
                    <h4>Professional Medical Consultation Required</h4>
                    <p>This AI analysis is for educational and preliminary screening purposes only. It should <strong>never replace professional medical evaluation</strong> by qualified dermatologists or healthcare professionals. Always consult medical experts for accurate diagnosis, proper evaluation, and appropriate treatment decisions.</p>
                </div>
            </div>
        </div>
    `;

    // Show results with animation
    if (resultsSection) {
        resultsSection.style.display = 'block';
        setTimeout(() => {
            resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }

    // Add CSS for result styling
    addResultStyles();
}

function downloadReport(reportFilename) {
    if (reportFilename) {
        window.location.href = `/download_report/${reportFilename}`;
    } else {
        showError('Report file not available');
    }
}

function getSeverityClass(severity) {
    if (!severity) return 'severity-unknown';
    const severityLower = severity.toLowerCase();
    if (severityLower.includes('low')) return 'severity-low';
    if (severityLower.includes('moderate') || severityLower.includes('medium')) return 'severity-medium';
    if (severityLower.includes('high')) return 'severity-high';
    return 'severity-unknown';
}

function addResultStyles() {
    // Add dynamic styles for results if not already present
    if (document.getElementById('dynamic-result-styles')) return;

    const style = document.createElement('style');
    style.id = 'dynamic-result-styles';
    style.textContent = `
        .result-card {
            background: var(--card-bg);
            border-radius: 20px;
            padding: 2rem;
            border: 1px solid var(--border-color);
            box-shadow: var(--shadow-lg);
            margin-top: 2rem;
        }
        
        .result-header {
            text-align: center;
            margin-bottom: 2rem;
        }
        
        .result-content-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
            align-items: start;
        }
        
        .result-image {
            position: relative;
            border-radius: 12px;
            overflow: hidden;
        }
        
        .result-image img {
            width: 100%;
            height: auto;
            border-radius: 12px;
        }
        
        .scan-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(45deg, transparent 30%, rgba(0, 217, 255, 0.1) 50%, transparent 70%);
            pointer-events: none;
        }
        
        .diagnosis-summary {
            margin-bottom: 2rem;
            text-align: center;
        }
        
        .condition-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1.5rem;
            border-radius: 50px;
            color: white;
            font-weight: 600;
            margin-bottom: 1.5rem;
            font-size: 1.1rem;
        }
        
        .confidence-card {
            background: linear-gradient(135deg, rgba(0, 217, 255, 0.1), rgba(124, 58, 237, 0.05));
            border: 1px solid rgba(0, 217, 255, 0.2);
            padding: 1.5rem;
            border-radius: 12px;
            margin: 1.5rem 0;
            text-align: center;
        }
        
        .confidence-card h4 {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            margin-bottom: 1rem;
            color: var(--accent-primary);
        }
        
        .confidence-content {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 1rem;
            margin-bottom: 1rem;
        }
        
        .confidence-bar-container {
            width: 200px;
            height: 20px;
            background: var(--border-color);
            border-radius: 10px;
            overflow: hidden;
            position: relative;
        }
        
        .confidence-bar {
            height: 100%;
            background: var(--gradient-secondary);
            border-radius: 10px;
            transition: width 2s ease-in-out;
            position: relative;
        }
        
        .confidence-bar::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
            animation: shine 2s infinite;
        }
        
        @keyframes shine {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
        }
        
        .confidence-text-large {
            font-size: 1.8rem;
            font-weight: 700;
            color: var(--accent-success);
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        
        .confidence-note {
            font-size: 0.85rem;
            color: var(--text-muted);
            font-style: italic;
            margin: 0;
        }
        
        .info-card {
            background: rgba(255, 255, 255, 0.02);
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 1rem;
        }
        
        .info-card h4 {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 0.5rem;
            color: var(--accent-primary);
        }
        
        .symptoms-list {
            list-style: none;
            padding: 0;
        }
        
        .symptoms-list li {
            padding: 0.3rem 0;
            padding-left: 1rem;
            position: relative;
        }
        
        .symptoms-list li:before {
            content: '•';
            position: absolute;
            left: 0;
            color: var(--accent-primary);
            font-weight: bold;
        }
        
        .severity-display {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin: 1rem 0;
            justify-content: center;
        }
        
        .accuracy-warning {
            background: linear-gradient(135deg, rgba(255, 193, 7, 0.15), rgba(255, 152, 0, 0.05));
            border: 2px solid rgba(255, 193, 7, 0.3);
            border-radius: 12px;
            padding: 1.5rem;
            margin: 2rem 0;
        }
        
        .warning-header {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin-bottom: 1rem;
        }
        
        .warning-header i {
            color: var(--accent-warning);
            font-size: 1.3rem;
        }
        
        .warning-header h3 {
            color: var(--accent-warning);
            margin: 0;
            font-size: 1.1rem;
        }
        
        .accuracy-warning p {
            line-height: 1.6;
            margin: 0;
            color: var(--text-primary);
        }
        
        .medical-disclaimer {
            display: flex;
            gap: 1rem;
            padding: 1.5rem;
            background: rgba(239, 68, 68, 0.1);
            border: 2px solid rgba(239, 68, 68, 0.2);
            border-radius: 12px;
            margin-top: 1rem;
        }
        
        .medical-disclaimer i {
            color: var(--accent-danger);
            font-size: 1.5rem;
            margin-top: 0.2rem;
            flex-shrink: 0;
        }
        
        .disclaimer-content h4 {
            color: var(--accent-danger);
            margin-bottom: 0.5rem;
            font-size: 1rem;
        }
        
        .disclaimer-content p {
            font-size: 0.9rem;
            line-height: 1.5;
            margin: 0;
        }
        
        .result-actions {
            display: flex;
            gap: 1rem;
            margin-top: 2rem;
            flex-wrap: wrap;
            justify-content: center;
        }
        
        @media (max-width: 768px) {
            .result-content-grid {
                grid-template-columns: 1fr;
            }
            
            .result-actions {
                flex-direction: column;
            }
            
            .confidence-content {
                flex-direction: column;
                gap: 0.5rem;
            }
            
            .confidence-bar-container {
                width: 150px;
            }
            
            .accuracy-warning,
            .medical-disclaimer {
                padding: 1rem;
            }
        }
    `;

    document.head.appendChild(style);
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function showError(message) {
    // Create and show error notification
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-notification';
    errorDiv.innerHTML = `
        <div class="error-content">
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

    // Add error notification styles
    if (!document.getElementById('error-notification-styles')) {
        const style = document.createElement('style');
        style.id = 'error-notification-styles';
        style.textContent = `
            .error-notification {
                position: fixed;
                top: 100px;
                right: 2rem;
                z-index: 10000;
                background: var(--accent-danger);
                color: white;
                border-radius: 8px;
                padding: 1rem;
                box-shadow: var(--shadow-lg);
                animation: slideIn 0.3s ease;
                max-width: 400px;
            }
            
            .error-content {
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            
            .error-content button {
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                padding: 0.25rem;
                margin-left: auto;
                border-radius: 4px;
                transition: background 0.3s ease;
            }
            
            .error-content button:hover {
                background: rgba(255, 255, 255, 0.1);
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(errorDiv);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentElement) {
            errorDiv.remove();
        }
    }, 5000);
}

function animateElements() {
    // Add scroll-triggered animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-up');
            }
        });
    });

    // Observe elements for animation
    document.querySelectorAll('.upload-section, .hero').forEach(el => {
        observer.observe(el);
    });
}

// Result page specific JavaScript (if on result page)
if (window.location.pathname.includes('/result/')) {
    // Get data from localStorage
    const resultData = JSON.parse(localStorage.getItem('analysisResult') || '{}');

    if (resultData && Object.keys(resultData).length > 0) {
        displayResultPageData(resultData);
    }
}

function displayResultPageData(data) {
    const diagnosisCard = document.getElementById('diagnosisCard');
    if (!diagnosisCard) return;

    const info = data.info || {};

    diagnosisCard.innerHTML = `
        <div class="diagnosis-header">
            <div class="condition-badge" style="background: ${info.color || '#17a2b8'}">
                <i class="fas fa-stethoscope"></i>
                <span>${data.prediction}</span>
            </div>
            <div class="confidence-score">
                <div class="confidence-circle">
                    <svg class="confidence-ring">
                        <circle class="confidence-ring-bg" cx="50" cy="50" r="45"></circle>
                        <circle class="confidence-ring-fill" cx="50" cy="50" r="45" 
                                style="stroke-dasharray: ${(data.confidence / 100) * 283}px 283px"></circle>
                    </svg>
                    <span class="confidence-text">${data.confidence}%</span>
                </div>
                <p>AI Confidence</p>
            </div>
        </div>
        
        <div class="diagnosis-content">
            <div class="info-section">
                <h3><i class="fas fa-info-circle"></i> Description</h3>
                <p>${info.description || 'No description available.'}</p>
            </div>
            
            <div class="confidence-card">
                <h3><i class="fas fa-chart-line"></i> AI Confidence Assessment</h3>
                <div class="confidence-content">
                    <div class="confidence-bar-container">
                        <div class="confidence-bar" style="width: ${data.confidence}%"></div>
                    </div>
                    <div class="confidence-text-large">${data.confidence}%</div>
                </div>
                <p class="confidence-note">This represents the AI model's certainty based on learned visual patterns.</p>
            </div>
            
            <div class="info-section">
                <h3><i class="fas fa-pills"></i> Potential Treatment Options</h3>
                <ul>
                    ${(info.treatment || []).map(treatment => `<li>${treatment}</li>`).join('')}
                </ul>
            </div>
            
            <div class="info-section">
                <h3><i class="fas fa-symptoms"></i> Associated Symptoms</h3>
                <ul>
                    ${(info.symptoms || []).map(symptom => `<li>${symptom}</li>`).join('')}
                </ul>
            </div>
            
            <div class="info-section">
                <h3><i class="fas fa-dna"></i> Contributing Factors</h3>
                <ul>
                    ${(info.causes || []).map(cause => `<li>${cause}</li>`).join('')}
                </ul>
            </div>
            
            <div class="severity-indicator">
                <span class="severity-label">Risk Level:</span>
                <span class="severity-badge ${getSeverityClass(info.severity)}">${info.severity || 'Unknown'}</span>
            </div>
            
            <div class="accuracy-warning">
                <div class="warning-header">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Important Accuracy Notice</h3>
                </div>
                <p>This AI prediction is <strong>not 100% accurate</strong>. Many skin conditions appear visually similar, making definitive diagnosis challenging. This analysis should be used as preliminary information only.</p>
            </div>
            
            <div class="disclaimer">
                <i class="fas fa-user-md"></i>
                <div>
                    <h4>Professional Medical Consultation Required</h4>
                    <p>This AI analysis is for educational purposes only and should not replace professional medical diagnosis. Please consult a qualified dermatologist or healthcare provider for proper evaluation, diagnosis, and treatment recommendations.</p>
                </div>
            </div>
        </div>
    `;

    // Setup download button
    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn && data.report_filename) {
        downloadBtn.onclick = () => {
            window.location.href = `/download_report/${data.report_filename}`;
        };
    }
}
