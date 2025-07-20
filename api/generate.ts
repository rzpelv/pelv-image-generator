import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";

// Ini adalah serverless function, jadi aman untuk memeriksa kunci di sini.
if (!process.env.API_KEY) {
  // Melempar error saat build jika key tidak ada.
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Penangan error terpusat untuk backend
const handleApiError = (error: unknown, res: VercelResponse) => {
  console.error("Backend API Error:", error);
  const message = error instanceof Error ? error.message : "An unknown error occurred.";
  
  // Memberikan pesan error yang lebih spesifik untuk rate limiting
  if (message.includes('429') || message.includes('RESOURCE_EXHAUSTED')) {
    res.status(429).json({ error: "You've exceeded your request quota. Please wait a moment and try again." });
  } else {
    res.status(500).json({ error: `Gemini API Error: ${message}` });
  }
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Hanya menerima request POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { type, prompt, aspectRatio, numberOfImages } = req.body;

  try {
    switch (type) {
      case 'generate':
        const imageResponse = await ai.models.generateImages({
          model: 'imagen-3.0-generate-002',
          prompt: prompt,
          config: {
            numberOfImages: numberOfImages,
            outputMimeType: 'image/jpeg',
            aspectRatio: aspectRatio,
          },
        });
        const base64ImageBytesArray = imageResponse.generatedImages.map(img => img.image.imageBytes);
        return res.status(200).json({ images: base64ImageBytesArray });

      case 'enhance':
        const enhanceInstruction = `You are an expert prompt engineer for an AI image generator. Rewrite the following user prompt to be more descriptive, vivid, and detailed. The new prompt should be structured for optimal image generation. Do not add any conversational text or preamble, just return the enhanced prompt itself. User prompt: "${prompt}"`;
        const enhanceResponse = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: enhanceInstruction,
        });
        return res.status(200).json({ text: enhanceResponse.text });

      case 'random':
        const randomInstruction = `You are a creative assistant. Generate a single, random, interesting, and visually rich prompt for an AI image generator. The prompt should be a short phrase or sentence. Do not add any conversational text, preamble, or quotes. Just return the prompt itself.`;
        const randomResponse = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: randomInstruction,
        });
        return res.status(200).json({ text: randomResponse.text.trim() });
      
      default:
        return res.status(400).json({ error: 'Invalid request type' });
    }
  } catch (error) {
    handleApiError(error, res);
  }
}
