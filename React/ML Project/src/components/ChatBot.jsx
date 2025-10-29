import React, { useState, useRef, useEffect } from 'react';

function ChatBot() {
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [history, setHistory] = useState([
        { role: 'bot', content: 'Hello! Ask me anything about these models.' }
    ]);
    const chatEndRef = useRef(null);

    // Style for the chat box
    const chatHistoryStyle = {
        scrollBehavior: 'smooth',
    };

    // Auto-scroll to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView();
    }, [history, isLoading]); // Scroll when history changes or loading state changes

    const handleSubmit = async (e) => {
        e.preventDefault();
        const message = input.trim();
        if (!message) return;

        // Add user message to history
        setHistory(prev => [...prev, { role: 'user', content: message }]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: message })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            const result = await response.json(); // Expects { "reply": "..." }
            setHistory(prev => [...prev, { role: 'bot', content: result.reply }]);

        } catch (error) {
            setHistory(prev => [...prev, { role: 'bot', content: 'Error: ' + error.message }]);
            console.error('Error submitting chat form:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mt-10 pt-8 border-t border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">LLM Chat 🤖</h2>
            <p className="text-gray-600 text-center mb-6">Chat with our AI model.</p>
            
            {/* Chat History Box */}
            <div 
                id="chatHistoryBox" 
                style={chatHistoryStyle}
                className="h-80 overflow-y-auto bg-gray-50 p-4 rounded-lg border border-gray-300 mb-4 flex flex-col gap-3"
            >
                {history.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`p-3 rounded-lg max-w-xs md:max-w-md ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                
                {/* Loading Indicator */}
                {isLoading && (
                    <div id="chatLoadingIndicator" className="flex justify-start">
                        <div className="p-3 rounded-lg bg-gray-200 text-gray-800">
                            <span className="animate-pulse">...</span>
                        </div>
                    </div>
                )}

                {/* Empty div for auto-scrolling */}
                <div ref={chatEndRef} />
            </div>
            
            {/* Chat Input Form */}
            <form id="chatForm" onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                <label htmlFor="chatInput" className="sr-only">Chat Message</label>
                <input 
                    type="text" 
                    id="chatInput"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Type your message..." 
                    autoComplete="off"
                />
                <button 
                    type="submit"
                    id="chatSendButton"
                    disabled={isLoading}
                    className="bg-gray-700 hover:bg-gray-800 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors duration-200 disabled:opacity-50"
                >
                    Send
                </button>
            </form>
        </div>
    );
}

export default ChatBot;