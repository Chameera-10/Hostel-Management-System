
// This function will now ping a backend endpoint to see if the chatbot feature is enabled on the server.
export const isChatbotEnabled = async (): Promise<boolean> => {
    try {
        const response = await fetch('/api/chat/status');
        if (!response.ok) return false;
        const data = await response.json();
        return data.enabled === true;
    } catch (error) {
        console.warn("Could not check chatbot status.", error);
        return false;
    }
};

// The client no longer starts or manages the chat session directly.
// The primary function is to send a message and stream the response from our own backend.
export const sendMessageToChat = async (message: string, history: { sender: 'user' | 'bot', text: string }[]): Promise<ReadableStream<Uint8Array> | null> => {
    const token = localStorage.getItem('hostel-token');
    
    try {
        const response = await fetch('/api/chat/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Attach auth token so backend knows which user is chatting
                ...(token && { 'Authorization': `Bearer ${token}` })
            },
            // Send message and recent history for context
            body: JSON.stringify({ message, history: history.slice(-10) }),
        });

        if (!response.ok || !response.body) {
            throw new Error('Failed to get response from AI assistant backend.');
        }

        return response.body;

    } catch (error) {
        console.error("Error sending message via backend:", error);
        throw new Error("Failed to get a response from the AI assistant.");
    }
};