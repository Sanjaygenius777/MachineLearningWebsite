import React, { useState, useRef, useEffect } from 'react';

function ImageClassifier() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState(null); // null, { prediction, confidence }, or { error }

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setSelectedFile(null);
            setPreview(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedFile) {
            setResult({ error: 'Please select an image file.' });
            return;
        }

        const formData = new FormData();
        formData.append('image', selectedFile);

        setIsLoading(true);
        setResult(null);

        try {
            const response = await fetch('/classify_image', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            const data = await response.json();
            setResult(data); // e.g., { prediction: "rose", confidence: 0.98 }

        } catch (error) {
            setResult({ error: error.message });
            console.error('Error submitting image form:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">Image Classifier 🏞️</h2>
            <p className="text-gray-600 text-center mb-6">Upload an image of a flower to see its class.</p>
            
            <form id="imageDetectionForm" onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="imageFile" className="block text-sm font-medium text-gray-700">Image File</label>
                    <input 
                        type="file" 
                        id="imageFile" 
                        name="image" 
                        accept="image/*" 
                        onChange={handleFileChange}
                        className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                </div>

                {/* Image Preview */}
                {preview && (
                    <div id="imagePreview" className="mt-4 mb-4 flex justify-center">
                        <img src={preview} alt="Uploaded Image Preview" className="max-w-full h-auto rounded-lg shadow-md max-h-64 object-contain" />
                    </div>
                )}
                
                <div className="text-center">
                    <button 
                        type="submit" 
                        id="detectImageButton" 
                        disabled={isLoading}
                        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition-colors duration-200"
                    >
                        {isLoading ? 'Classifying...' : 'Classify Image'}
                    </button>
                </div>
            </form>

            {/* Result Section */}
            {result && (
                <div id="imageResult" className="mt-8 pt-6 border-t border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Image Result</h3>
                    <div id="imageResponse" className="bg-gray-50 p-4 rounded-lg text-gray-700 font-medium">
                        {result.error ? (
                            <p>Error: {result.error}</p>
                        ) : (
                            <p>
                                Predicted Class: <span className="font-bold">{result.prediction}</span> with <span className="font-bold text-blue-600">{(result.confidence * 100).toFixed(2)}%</span> confidence.
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default ImageClassifier;