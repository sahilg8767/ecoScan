from flask import Flask, request, jsonify
from flask_cors import CORS
import random
import time

app = Flask(__name__)
CORS(app)

WASTE_TYPES = ["Plastic", "Paper", "Metal", "Organic"]

@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({"error": "No image provided"}), 400
    
    image = request.files['image']
    if image.filename == '':
        return jsonify({"error": "No selected file"}), 400

    # Simulate processing time for image (resize 224x224, normalize, etc.)
    time.sleep(1.5)
    
    # Mock AI inference prediction
    predicted_type = random.choice(WASTE_TYPES)
    
    # Generate realistic confidence score based on type (usually higher if mock)
    confidence = round(random.uniform(75.0, 98.5), 2)
    
    return jsonify({
        "type": predicted_type,
        "confidence": confidence
    })

if __name__ == '__main__':
    # Run Flask server on port 5000
    app.run(host='0.0.0.0', port=5000, debug=True)
