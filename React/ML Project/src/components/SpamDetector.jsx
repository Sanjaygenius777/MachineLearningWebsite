import React, { useState, useRef, useEffect } from 'react';

function SpamDetector() {
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState(null); // null, { prediction: 'spam' | 'not spam' }, or { error: '...' }

    // Style for the text area
    const messageBoxStyle = {
        minHeight: '150px',
        maxHeight: '300px',
        resize: 'vertical',
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        setIsLoading(true);
        setResult(null);

        try {
            const response = await fetch('/detect_text', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: message })
            });

            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            setResult(data); // e.g., { prediction: "spam" }

        } catch (error) {
            setResult({ error: error.message });
            console.error('Error submitting text form:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">Text Spam Detector 🕵️</h2>
            <p className="text-gray-600 text-center mb-6">Paste or type a message below.</p>
            
            <form id="textDetectionForm" onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 sr-only">Message</label>
                    <textarea 
                        id="message" 
                        name="message" 
                        rows="4" 
                        style={messageBoxStyle}
                        className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        placeholder="Enter your message here..." 
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required 
                    />
                </div>
                <div className="text-center">
                    <button 
                        type="submit" 
                        id="detectTextButton" 
                        disabled={isLoading}
                        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition-colors duration-200 disabled:opacity-50"
                    >
                        {isLoading ? 'Detecting...' : 'Detect Spam'}
                    </button>
                </div>
            </form>

            {/* Result Section */}
            {result && (
                <div id="textResult" className="mt-8 pt-6 border-t border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Text Result</h3>
                    <div id="textResponse" className="bg-gray-50 p-4 rounded-lg text-gray-700 font-medium">
                        {result.error ? (
                            <p>Error: {result.error}</p>
                        ) : result.prediction === "spam" ? (
                            <p>This message is <span className="text-red-500 font-bold">likely SPAM 🚨</span>.</p>
                        ) : (
                            <p>This message is <span className="text-green-500 font-bold">NOT spam ✅</span>.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default SpamDetector;