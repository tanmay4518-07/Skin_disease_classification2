text
# 🩺 SkinAI - Advanced Dermatology Diagnostics

![Python](https://img.shields.io/badge/Python-3.11-blue.svg)
![Flask](https://img.shields.io/badge/Flask-3.0.0-green.svg)  
![TensorFlow](https://img.shields.io/badge/TensorFlow-2.17.0-orange.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)
![Status](https://img.shields.io/badge/Status-Live-brightgreen.svg)

> An AI-powered web application for preliminary skin condition analysis using deep learning and computer vision technology.

![SkinAI Demo](https://via.placeholder.com/800x400/1a1a1a/00d9ff?text=SkinAI+Demo+Screenshot)

## 🌟 Features

- **🤖 AI-Powered Analysis**: Advanced deep learning model trained on 11,460+ dermatological images
- **🎯 6 Condition Detection**: Identifies Eczema, Psoriasis, Fungal Infections, Benign Keratosis, Benign Tumors, and Warts
- **📊 Confidence Assessment**: Provides detailed confidence percentage with visual indicators
- **📱 Responsive Design**: Dark-themed UI with smooth animations and mobile optimization
- **📋 Comprehensive Reports**: Downloadable detailed medical reports with treatment recommendations
- **⚠️ Medical Disclaimers**: Clear accuracy notices and professional consultation recommendations
- **🔒 Privacy-Focused**: No image storage - analysis happens in real-time

## 🚀 Live Demo

🌐 **[Try SkinAI Live](https://your-app-name.onrender.com)**

## 📸 Screenshots

<div align="center">
  <img src="https://via.placeholder.com/400x300/1a1a1a/00d9ff?text=Upload+Interface" alt="Upload Interface" width="400"/>
  <img src="https://via.placeholder.com/400x300/1a1a1a/28a745?text=Analysis+Results" alt="Analysis Results" width="400"/>
</div>

## 🛠️ Tech Stack

- **Backend**: Flask 3.0.0, Python 3.11
- **AI/ML**: TensorFlow 2.17.0, ResNet50/MobileNetV2 Architecture
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Custom CSS with CSS Variables, Font Awesome Icons
- **Deployment**: Render.com, Gunicorn WSGI Server
- **Image Processing**: Pillow (PIL), NumPy

## 📦 Installation & Local Setup

### Prerequisites

- Python 3.11+
- pip (Python package manager)
- Git

### 1. Clone Repository

git clone https://github.com/yourusername/skinai-diagnostics.git
cd skinai-diagnostic

text

### 2. Create Virtual Environment

Create virtual environment
python -m venv venv

Activate virtual environment
On Windows:
venv\Scripts\activate

On macOS/Linux:
source venv/bin/activate

text

### 3. Install Dependencies

pip install -r requirements.txt

text

### 4. Download Model File

Place your trained model file `epoch_15_valacc_0.4768.h5` in the project root directory.

### 5. Run Application

python app.py

text

Visit `http://localhost:5000` in your browser.

## 📋 Requirements

Flask==3.0.0
tensorflow==2.17.0
Pillow==10.0.1
numpy==1.26.4
Werkzeug==3.0.1
gunicorn==21.2.0

text

## 🏗️ Project Structure

skinai-diagnostics/
│
├── 📁 static/
│ ├── style.css # Main CSS styles
│ ├── script.js # JavaScript functionality
│ └── uploads/ # Temporary uploaded images
│
├── 📁 templates/
│ ├── index.html # Main upload interface
│ └── result.html # Results display page
│
├── 📁 uploads/ # Server-side uploaded images
├── 📁 reports/ # Generated medical reports
│
├── 📄 app.py # Main Flask application
├── 📄 requirements.txt # Python dependencies
├── 📄 render.yaml # Render deployment config
├── 📄 epoch_15_valacc_0.4768.h5 # Trained ML model

text

## 🎯 Model Performance

| Metric | Value |
|--------|-------|
| **Dataset Size** | 11,460 images |
| **Classes** | 6 skin conditions |
| **Architecture** | ResNet50 + Transfer Learning |
| **Expected Accuracy** | 88-93% |
| **Confidence Threshold** | Variable per prediction |

### Supported Conditions

1. **Benign Keratosis** - Non-cancerous skin growths
2. **Benign Tumors** - Harmless skin lumps  
3. **Eczema** - Chronic inflammatory skin condition
4. **Fungal Infection** - Superficial skin fungi
5. **Psoriasis** - Autoimmune skin disorder
6. **Warts** - Viral skin infections (HPV)

## 🚀 Deployment Guide

### Deploy to Render (Recommended)

1. **Fork this repository**
2. **Connect to Render**:
   - Go to [render.com](https://render.com)
   - Create new Web Service
   - Connect your GitHub repository
3. **Configure deployment**:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn -w 1 app:app`
   - Environment: `Python 3`
4. **Deploy**: Automatic deployment on code push

### Environment Variables

PYTHON_VERSION=3.11.0

text

## 🔧 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Main application interface |
| `/analyze` | POST | Image analysis endpoint |
| `/download_report/<filename>` | GET | Download medical report |
| `/test_model` | GET | Model diagnostics (debug) |

## ⚠️ Important Disclaimers

### Medical Disclaimer
- **This application is for educational purposes only**
- **Not a substitute for professional medical diagnosis**
- **AI predictions are not 100% accurate**
- **Always consult qualified healthcare professionals**

### Accuracy Limitations
- Many skin conditions appear visually similar
- Lighting, image quality affect analysis accuracy
- Individual skin variations impact results
- Professional evaluation is essential for diagnosis

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`  
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

### Development Guidelines

- Follow PEP 8 Python style guide
- Add comments for complex logic
- Test thoroughly before submitting
- Update documentation as needed

## 📊 Future Enhancements

- [ ] **More Conditions**: Expand to 20+ skin conditions  
- [ ] **Mobile App**: React Native/Flutter mobile version
- [ ] **Multi-language**: Support for multiple languages
- [ ] **Doctor Integration**: Connect with dermatologists
- [ ] **History Tracking**: User account with analysis history
- [ ] **Batch Processing**: Multiple image analysis
- [ ] **API Documentation**: RESTful API with Swagger docs

## 🐛 Known Issues

- Large model file size (~100MB+) may cause deployment delays
- Processing time varies based on server resources
- Mobile upload may require specific image formats

## 📞 Support & Contact

- **Developer**: Tanmay (B.Tech Student)
- **Email**: your.email@example.com
- **GitHub**: [@yourusername](https://github.com/yourusername)
- **LinkedIn**: [Your LinkedIn](https://linkedin.com/in/yourprofile)

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Dataset**: Dermatology image datasets from medical institutions
- **Framework**: Flask development team
- **ML Libraries**: TensorFlow and Keras contributors  
- **UI Design**: Font Awesome for icons
- **Hosting**: Render.com for free deployment
- **Inspiration**: Modern healthcare AI applications

## 📈 Project Statistics

![GitHub stars](https://img.shields.io/github/stars/yourusername/skinai-diagnostics?style=social)
![GitHub forks](https://img.shields.io/github/forks/yourusername/skinai-diagnostics?style=social)
![GitHub issues](https://img.shields.io/github/issues/yourusername/skinai-diagnostics)
![GitHub contributors](https://img.shields.io/github/contributors/yourusername/skinai-diagnostics)

---

<div align="center">
  <p><strong>⚡ Built with passion for advancing healthcare technology ⚡</strong></p>
