import { GoogleGenAI } from "@google/genai";

// Ensure the API key is available in the environment variables.
// Do not add any UI for this, as it's assumed to be pre-configured.
if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * A centralized handler for API errors. It checks for specific rate-limiting
 * errors and provides a user-friendly message.
 * @param error The error object caught.
 * @param context A string describing where the error occurred (e.g., 'generating image').
 */
const handleApiError = (error: unknown, context: string): never => {
  console.error(`Error ${context}:`, error);
  if (error instanceof Error) {
    // Check for specific rate limit / quota exhaustion error strings.
    if (error.message.includes('429') || error.message.includes('RESOURCE_EXHAUSTED')) {
      throw new Error("You've exceeded your request quota. Please wait a moment and try again.");
    }
    // For other errors, pass a more generic but still informative message.
    throw new Error(`Gemini API Error: ${error.message}`);
  }
  // Fallback for non-standard errors.
  throw new Error(`An unknown error occurred while ${context}.`);
};


/**
 * Generates images from a text prompt using the Gemini API.
 * @param prompt The text prompt to generate the image from.
 * @param aspectRatio The desired aspect ratio of the image.
 * @param numberOfImages The number of images to generate.
 * @returns A promise that resolves to an array of base64 encoded image strings.
 */
export const generateImageFromPrompt = async (prompt: string, aspectRatio: string, numberOfImages: number): Promise<string[]> => {
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-3.0-generate-002',
      prompt: prompt,
      config: {
        numberOfImages: numberOfImages,
        outputMimeType: 'image/jpeg',
        aspectRatio: aspectRatio,
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64ImageBytesArray = response.generatedImages.map(img => img.image.imageBytes);
      return base64ImageBytesArray;
    } else {
      throw new Error('No images were generated.');
    }
  } catch (error) {
    handleApiError(error, 'generating image');
  }
};

/**
 * Enhances a user's prompt using a text generation model.
 * @param prompt The user's prompt to enhance.
 * @returns A promise that resolves to a more detailed and descriptive prompt.
 */
export const enhancePrompt = async (prompt: string): Promise<string> => {
    try {
        const instruction = `You are an expert prompt engineer for an AI image generator. Rewrite the following user prompt to be more descriptive, vivid, and detailed. The new prompt should be structured for optimal image generation. Do not add any conversational text or preamble, just return the enhanced prompt itself. User prompt: "${prompt}"`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: instruction,
        });
        
        return response.text;
    } catch (error) {
        handleApiError(error, 'enhancing prompt');
    }
};

/**
 * Generates a random, creative prompt for image generation.
 * @returns A promise that resolves to a random prompt string.
 */
export const generateRandomPrompt = async (): Promise<string> => {
    try {
        const instruction = `You are a creative assistant. Generate a single, random, interesting, and visually rich prompt for an AI image generator. The prompt should be a short phrase or sentence. Do not add any conversational text, preamble, or quotes. Just return the prompt itself.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: instruction,
        });
        
        return response.text.trim();
    } catch (error) {
        handleApiError(error, 'generating a random prompt');
    }
};
