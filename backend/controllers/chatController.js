
const { GoogleGenAI } = require('@google/genai');
const User = require('../models/userModel');

const checkChatStatus = (req, res) => {
    // The chatbot is enabled if the API key is configured on the server
    if (process.env.GEMINI_API_KEY) {
        res.json({ enabled: true });
    } else {
        res.json({ enabled: false });
    }
};

const sendChatMessage = async (req, res) => {
    if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ message: "AI Assistant is not configured on the server." });
    }
    
    const { message, history } = req.body;
    if (!message) {
        return res.status(400).json({ message: "Message is required." });
    }

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        const systemInstruction = "You are a helpful AI assistant for the Rajarata University Hostel Management System. Answer only hostel-related questions. If a question is not about hostels, politely decline to answer. Use tools to get student-specific information when needed.";
        
        const tools = [{
            functionDeclarations: [{
                name: "get_student_details",
                description: "Get the details for the currently logged-in student, such as their room number, student ID, name, and email.",
                parameters: { type: "OBJECT", properties: {} } // No parameters needed from model
            }]
        }];

        const chatHistory = (history || []).map(item => ({
            role: item.sender === 'user' ? 'user' : 'model',
            parts: [{ text: item.text }],
        }));

        const contents = [...chatHistory, { role: 'user', parts: [{ text: message }] }];

        // Make a non-streaming call first to check if a tool needs to be called.
        const initialResult = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: contents,
            config: {
                tools: tools,
                systemInstruction: systemInstruction,
            },
        });

        const functionCall = initialResult.candidates?.[0]?.content?.parts?.[0]?.functionCall;

        if (functionCall && functionCall.name === 'get_student_details') {
            // The model wants to use the tool. Execute it.
            const student = await User.findById(req.user.id).select('name studentId roomNumber email');
            if (!student) {
                throw new Error('Student profile not found for tool execution.');
            }

            // Send the tool's result back to the model to get a final, natural language response.
            const stream = await ai.models.generateContentStream({
                model: "gemini-2.5-flash",
                contents: [
                    ...contents, // Original history + user message
                    { role: 'model', parts: [{ functionCall }] }, // The model's request to use the tool
                    {
                        role: 'function', // Our response providing the tool's output
                        parts: [{
                            functionResponse: {
                                name: 'get_student_details',
                                response: { student: student.toJSON() },
                            }
                        }]
                    }
                ],
                config: { systemInstruction: systemInstruction },
            });
            
            // Stream the final answer back to the client.
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            res.setHeader('Transfer-Encoding', 'chunked');
            for await (const chunk of stream) {
                res.write(chunk.text);
            }
            res.end();

        } else {
            // No tool was needed. We can just stream the initial response text.
            // We re-request as a stream to provide the expected user experience.
             const stream = await ai.models.generateContentStream({
                model: "gemini-2.5-flash",
                contents: contents,
                config: { systemInstruction: systemInstruction }
            });
            
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            res.setHeader('Transfer-Encoding', 'chunked');
            for await (const chunk of stream) {
                res.write(chunk.text);
            }
            res.end();
        }

    } catch (error) {
        console.error("Error with Gemini API:", error);
        res.status(500).send("Error getting response from AI Assistant.");
    }
};

module.exports = {
    checkChatStatus,
    sendChatMessage,
};
