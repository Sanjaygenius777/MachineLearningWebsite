from flask import Flask, render_template, request, jsonify
from flask_cors import CORS


import joblib
from scipy.sparse import csr_matrix
from keras.models import load_model
import numpy as np
import os
import tensorflow as tf
import torch
import accelerate
from transformers import pipeline


app=Flask(__name__)
CORS(app)

model=joblib.load('models/spam.joblib')
vectorizer=joblib.load('models/tfidf.joblib')
flowermodel=load_model('models/flower.keras')

pipe=pipeline("text-generation",model="TinyLlama/TinyLlama-1.1B-Chat-v1.0", torch_dtype=torch.bfloat16, device_map="auto")


img_height = 180
img_width = 180
class_names = ['bougainvillea', 'daisies', 'garden rose', 'gardenias', 'hibiscus', 'hydrangeas', 'lilies', 'orchids', 'peonies', 'tulip']

@app.route('/',methods=['GET','POST'])
def index():
    prediction=""
    if request.method=='POST':
        body=request.get_json()
        message=body["message"]
        vect=vectorizer.transform([message]).toarray()
        prediction=model.predict(vect)[0]
        print(prediction)
        return jsonify({"prediction":prediction})
    return render_template("index.html")

@app.route('/detect_text',methods=['POST'])
def spam():
    prediction=""
    if request.method=='POST':
        body=request.get_json()
        message=body["message"]
        vect=vectorizer.transform([message]).toarray()
        prediction=model.predict(vect)[0]
        print(prediction)
        return jsonify({"prediction":prediction})
    return render_template("index.html")

@app.route('/classify_image', methods=['POST'])
def classify_image():
    # Check if a file was sent in the request
    if 'image' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400

    file = request.files['image']

    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    # Check if the file has a valid extension
    allowed_extensions = {'png', 'jpg', 'jpeg', 'gif'}
    if '.' not in file.filename or file.filename.rsplit('.', 1)[1].lower() not in allowed_extensions:
        return jsonify({'error': 'Invalid file type'}), 400

    try:
        # Read the file directly into a TensorFlow tensor
        # This avoids saving the file to disk, which is more efficient
        img_bytes = file.read()
        img = tf.io.decode_image(img_bytes, channels=3)
        img = tf.image.resize(img, [img_height, img_width])
        img = tf.expand_dims(img, 0) # Add batch dimension
        
        # Make a prediction
        predictions = flowermodel.predict(img)
        score = tf.nn.softmax(predictions[0])
        
        predicted_class_index = np.argmax(score)
        predicted_class_name = class_names[predicted_class_index]
        confidence = float(np.max(score))
        
        return jsonify({
            'prediction': predicted_class_name,
            'confidence': confidence
        })

    except Exception as e:
        print(f"Error during image processing: {e}")
        return jsonify({'error': 'An internal error occurred during processing.'}), 500

@app.route('/chat', methods=['POST'])
def chat():
    try:
        body = request.get_json()
        message = body["message"]
        print(f"Received chat message: {message}")

        messages = [
            {
                "role": "system",
                "content": "You are a friendly chatbot who always responds in the style of a pirate",
                },
                {"role": "user", "content": message},]
        prompt = pipe.tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
        outputs = pipe(prompt, max_new_tokens=256, do_sample=True, temperature=0.7, top_k=50, top_p=0.95)
        assistant_reply = outputs[0]["generated_text"].split("<|assistant|>")[-1].split("<|user|>")[0].strip()
        # --- YOUR LLM LOGIC GOES HERE ---
        # (Example placeholder logic)
        bot_reply = f"{assistant_reply}"
        # --------------------------------
        
        return jsonify({'reply': bot_reply})
    except Exception as e:
        print(f"Error in /chat: {e}")
        return jsonify({'error': str(e)}), 500

if __name__=='__main__':
    app.run(debug=True)