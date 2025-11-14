
import { GoogleGenAI, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export async function editImage(base64ImageData: string, mimeType: string, prompt: string): Promise<string | null> {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: base64ImageData,
                            mimeType: mimeType,
                        },
                    },
                    {
                        text: prompt,
                    },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                return part.inlineData.data;
            }
        }
        
        return null; // Return null if no image data is found in the response
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw error;
    }
}


export async function generateImage(prompt: string): Promise<string | null> {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    {
                        text: prompt,
                    },
                ],
            },
            config: {
                systemInstruction: "You are an expert architect and designer specializing in technical blueprints, permaculture layouts, and graph views. Generate clear, detailed, and accurate visual representations based on the user's request. The output should be a single, high-quality image.",
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                return part.inlineData.data;
            }
        }
        
        return null;
    } catch (error) {
        console.error("Error calling Gemini API for image generation:", error);
        throw error;
    }
}
