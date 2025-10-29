import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import ChatBot from './components/ChatBot'
import ImageClassifier from './components/ImageClassifier'
import SpamDetector from './components/SpamDetector'

function App() {
    return (
        <div className="bg-gray-100 flex items-center justify-center min-h-screen p-4">
            <div className="bg-white p-6 md:p-10 rounded-2xl shadow-xl w-full max-w-5xl">
                
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-6">ML Model Classifiers 🕵️🏞️</h1>
                <p className="text-gray-600 text-center mb-8">Test our text spam detector and our flower image classifier side by side!</p>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Render Chunk 1 */}
                    <SpamDetector />
                    
                    {/* Render Chunk 2 */}
                    <ImageClassifier />
                </div>

                {/* Render Chunk 3 */}
                <ChatBot />

            </div>
        </div>
    );
}

export default App
