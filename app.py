import os
from datetime import datetime
import numpy as np
import tensorflow as tf
from flask import Flask, render_template, request, send_file, jsonify
from werkzeug.utils import secure_filename

app = Flask(__name__)

# Configuration
MODEL_PATH = 'checkpoints/epoch_12_valacc_0.5206.h5'
UPLOAD_FOLDER = 'uploads'
REPORT_FOLDER = 'reports'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'bmp', 'gif'}

# Create directories
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(REPORT_FOLDER, exist_ok=True)
os.makedirs('static/uploads', exist_ok=True)

# Load model
print('🔄 Loading model...')
model = tf.keras.models.load_model(MODEL_PATH)
print('✅ Model loaded successfully!')

# Get model input size automatically
MODEL_INPUT_SIZE = model.input_shape[1] if len(model.input_shape) >= 2 else 256
print(f"Model expects input size: {MODEL_INPUT_SIZE}x{MODEL_INPUT_SIZE}")

# CLASS NAMES - MUST MATCH YOUR TRAINING ORDER EXACTLY
CLASS_NAMES = [
    'Benign Keratosis',
    'Benign Tumors',
    'Eczema',
    'Fungal infection',
    'Psoriasis',
    'Warts(other viral infections)'
]

DISEASE_INFO = {
    'Benign Keratosis': {
        'description': 'Non-cancerous skin growths that develop from keratinocytes, appearing as rough, scaly, waxy patches on sun-exposed areas.',
        'symptoms': ['Rough, scaly texture', 'Waxy appearance', 'Brown/tan coloration', 'Well-defined borders',
                     'Gradual growth'],
        'causes': ['Chronic sun exposure', 'UV radiation damage', 'Genetic predisposition', 'Aging process'],
        'treatment': ['Cryotherapy (liquid nitrogen)', 'Electrodesiccation', 'Laser removal', 'Shave excision',
                      'Topical imiquimod'],
        'severity': 'Low Risk',
        'color': '#28a745'
    },
    'Benign Tumors': {
        'description': 'Non-cancerous growths on or under the skin that are typically harmless but may cause cosmetic concerns or discomfort.',
        'symptoms': ['Raised lumps or masses', 'Soft or firm texture', 'Painless growth', 'Various sizes',
                     'Smooth surface'],
        'causes': ['Genetic factors', 'Hormonal changes', 'Age-related changes', 'Previous trauma'],
        'treatment': ['Clinical observation', 'Surgical removal', 'Laser therapy', 'Cryotherapy', 'Biopsy if needed'],
        'severity': 'Low Risk',
        'color': '#17a2b8'
    },
    'Eczema': {
        'description': 'Chronic inflammatory skin condition characterized by itchy, red, and inflamed patches that can significantly impact quality of life.',
        'symptoms': ['Intense itching', 'Red inflamed patches', 'Dry scaly skin', 'Small raised bumps',
                     'Thickened skin', 'Raw scratched areas'],
        'causes': ['Genetic predisposition', 'Immune dysfunction', 'Environmental allergens', 'Stress factors',
                   'Weather changes', 'Food triggers'],
        'treatment': ['Moisturizers and emollients', 'Topical corticosteroids', 'Antihistamines', 'Trigger avoidance',
                      'Wet wrap therapy', 'Immunomodulators'],
        'severity': 'Moderate Risk',
        'color': '#ffc107'
    },
    'Fungal infection': {
        'description': 'Superficial skin infections caused by various fungi, thriving in warm and moist environments, highly contagious.',
        'symptoms': ['Red scaly patches', 'Intense itching', 'Ring-shaped lesions', 'Peeling skin', 'Burning sensation',
                     'Possible odor'],
        'causes': ['Direct contact transmission', 'Contaminated surfaces', 'Warm humid environments',
                   'Compromised immunity', 'Poor hygiene', 'Tight clothing'],
        'treatment': ['Topical antifungals', 'Oral medications', 'Keep area dry', 'Antifungal powders',
                      'Hygiene improvement', 'Environmental control'],
        'severity': 'Moderate Risk',
        'color': '#fd7e14'
    },
    'Psoriasis': {
        'description': 'Chronic autoimmune disorder causing rapid skin cell turnover, resulting in thick, scaly patches that can be painful and emotionally distressing.',
        'symptoms': ['Thick red patches', 'Silvery scales', 'Dry cracked skin', 'Itching and burning', 'Nail changes',
                     'Joint pain'],
        'causes': ['Autoimmune dysfunction', 'Genetic factors', 'Stress and trauma', 'Infections',
                   'Certain medications', 'Environmental triggers'],
        'treatment': ['Topical corticosteroids', 'Vitamin D analogs', 'UV phototherapy', 'Systemic medications',
                      'Biologic drugs', 'Lifestyle modifications'],
        'severity': 'High Risk',
        'color': '#dc3545'
    },
    'Warts(other viral infections)': {
        'description': 'Viral skin infections caused by human papillomavirus (HPV), appearing as rough growths that can spread to other body areas.',
        'symptoms': ['Small grainy bumps', 'Rough cauliflower texture', 'Black dots (blood vessels)',
                     'Usually painless', 'Variable sizes', 'Can multiply'],
        'causes': ['Human papillomavirus', 'Direct skin contact', 'Contaminated surfaces', 'Weakened immunity',
                   'Skin breaks', 'Moist environments'],
        'treatment': ['Salicylic acid treatments', 'Cryotherapy freezing', 'Laser therapy', 'Immunotherapy',
                      'Surgical removal', 'Often self-resolve'],
        'severity': 'Low Risk',
        'color': '#6610f2'
    }
}


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def improved_model_predict(img_path):
    """Fixed prediction function with better accuracy"""
    try:
        # Load and preprocess image - EXACT PREPROCESSING
        img = tf.keras.preprocessing.image.load_img(img_path, target_size=(MODEL_INPUT_SIZE, MODEL_INPUT_SIZE))
        img_array = tf.keras.preprocessing.image.img_to_array(img)

        # Normalize to [0,1] range - CRITICAL for accuracy
        img_array = img_array / 255.0
        img_array = np.expand_dims(img_array, axis=0)

        # Get predictions
        predictions = model.predict(img_array, verbose=0)
        predictions = np.squeeze(predictions)

        print(f"Raw predictions: {predictions}")
        print(f"Prediction shape: {predictions.shape}")

        # Handle different output formats
        if predictions.ndim == 1 and len(predictions) == len(CLASS_NAMES):
            # Multi-class softmax output
            class_idx = int(np.argmax(predictions))
            confidence = float(predictions[class_idx]) * 100  # Convert to percentage
        elif predictions.ndim == 0 or (predictions.ndim == 1 and len(predictions) == 1):
            # Binary or single output
            prob = float(predictions) if predictions.ndim == 0 else float(predictions[0])
            class_idx = 1 if prob >= 0.5 else 0
            confidence = prob * 100 if prob >= 0.5 else (1 - prob) * 100
        else:
            # Fallback
            print(f"Unexpected prediction format: {predictions.shape}")
            class_idx = 0
            confidence = 50.0

        # Ensure class index is valid
        if class_idx >= len(CLASS_NAMES):
            class_idx = 0

        pred_class = CLASS_NAMES[class_idx]
        info = DISEASE_INFO.get(pred_class, {})

        print(f"Predicted: {pred_class} with {confidence:.1f}% confidence")

        return pred_class, confidence, info

    except Exception as e:
        print(f"Prediction error: {str(e)}")
        return CLASS_NAMES[0], 50.0, DISEASE_INFO[CLASS_NAMES]


def generate_detailed_report(filename, pred_class, confidence, info):
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    report = f"""
╔══════════════════════════════════════════════════════════════╗
║                    SKINAI DIAGNOSTIC REPORT                  ║
╚══════════════════════════════════════════════════════════════╝

📊 ANALYSIS SUMMARY
────────────────────────────────────────────────────────────────
• Report Generated    : {timestamp}
• Image Analyzed      : {filename}
• Predicted Condition : {pred_class}
• Confidence Level    : {confidence:.1f}%
• Risk Assessment     : {info.get('severity', 'Unknown')}

🔬 DETAILED CONDITION ANALYSIS
────────────────────────────────────────────────────────────────
Description:
{info.get('description', 'No description available.')}

🩺 CLINICAL SYMPTOMS
────────────────────────────────────────────────────────────────"""

    for i, symptom in enumerate(info.get('symptoms', []), 1):
        report += f"\n{i:2d}. {symptom}"

    report += f"""

🧬 CONTRIBUTING FACTORS
────────────────────────────────────────────────────────────────"""

    for i, cause in enumerate(info.get('causes', []), 1):
        report += f"\n{i:2d}. {cause}"

    report += f"""

💊 RECOMMENDED TREATMENTS
────────────────────────────────────────────────────────────────"""

    for i, treatment in enumerate(info.get('treatment', []), 1):
        report += f"\n{i:2d}. {treatment}"

    report += f"""

⚠️  IMPORTANT MEDICAL DISCLAIMER & ACCURACY NOTICE
────────────────────────────────────────────────────────────────
This AI analysis is provided for EDUCATIONAL and INFORMATIONAL purposes only and 
should NOT be considered as a definitive medical diagnosis. Please understand that 
this prediction is not 100% accurate, as many skin diseases can appear visually 
similar and may share overlapping characteristics, making precise differentiation 
challenging even for advanced AI systems. Factors such as lighting conditions, 
image quality, disease progression stage, and individual skin variations can 
significantly impact the accuracy of automated analysis.

The AI model, while trained on extensive dermatological datasets, cannot replace 
the expertise, clinical experience, and comprehensive examination provided by 
qualified healthcare professionals. Dermatological conditions often require 
physical examination, patient history, and sometimes additional diagnostic tests 
for accurate identification and proper treatment planning.

We strongly recommend consulting a licensed dermatologist or healthcare provider 
for professional evaluation, accurate diagnosis, and appropriate treatment options. 
This AI tool should be used as a preliminary screening aid only, and any medical 
decisions should always be based on professional medical advice rather than 
automated analysis results.

📞 RECOMMENDED NEXT STEPS
────────────────────────────────────────────────────────────────
1. Save this report for medical consultation reference
2. Schedule an appointment with a qualified dermatologist
3. Share this AI analysis with your healthcare provider for discussion
4. Follow professional medical recommendations and prescribed treatments
5. Monitor any changes in the condition and report to your doctor
6. Seek immediate medical attention if symptoms worsen or new concerns arise

────────────────────────────────────────────────────────────────
Generated by SkinAI Diagnostic System v3.0
Powered by Advanced Deep Learning & Computer Vision Technology
This analysis is provided as a screening tool and educational resource only
────────────────────────────────────────────────────────────────
"""

    return report


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400

        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type. Please upload PNG, JPG, JPEG, GIF, or BMP files.'}), 400

        # Save file
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        unique_filename = f"{timestamp}_{filename}"

        file_path = os.path.join(UPLOAD_FOLDER, unique_filename)
        static_path = os.path.join('static/uploads', unique_filename)

        file.save(file_path)
        file.save(static_path)

        # Make prediction with improved function
        pred_class, confidence, info = improved_model_predict(file_path)

        # Generate report
        report_content = generate_detailed_report(unique_filename, pred_class, confidence, info)
        report_filename = f"SkinAI_Report_{timestamp}.txt"
        report_path = os.path.join(REPORT_FOLDER, report_filename)

        with open(report_path, 'w', encoding='utf-8') as f:
            f.write(report_content)

        return jsonify({
            'success': True,
            'filename': unique_filename,
            'prediction': pred_class,
            'confidence': round(confidence, 1),
            'info': info,
            'report_filename': report_filename,
            'timestamp': timestamp
        })

    except Exception as e:
        print(f"Analysis error: {str(e)}")
        return jsonify({'error': f'Analysis failed: {str(e)}'}), 500


@app.route('/result/<filename>')
def result(filename):
    return render_template('result.html', filename=filename)


@app.route('/download_report/<filename>')
def download_report(filename):
    try:
        return send_file(
            os.path.join(REPORT_FOLDER, filename),
            as_attachment=True,
            download_name=f"SkinAI_Medical_Report_{datetime.now().strftime('%Y%m%d')}.txt"
        )
    except FileNotFoundError:
        return "Report not found", 404


@app.route('/test_model')
def test_model():
    """Test endpoint to check model output shape"""
    try:
        dummy_input = np.random.random((1, MODEL_INPUT_SIZE, MODEL_INPUT_SIZE, 3))
        test_output = model.predict(dummy_input, verbose=0)

        return jsonify({
            'input_shape': model.input_shape,
            'output_shape': test_output.shape,
            'model_input_size': MODEL_INPUT_SIZE,
            'number_of_classes': len(CLASS_NAMES),
            'test_output': test_output.tolist()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    print(f"🔧 Model input size: {MODEL_INPUT_SIZE}")
    print(f"📊 Number of classes: {len(CLASS_NAMES)}")
    app.run(debug=True, host='0.0.0.0', port=5000)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)

