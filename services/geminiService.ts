/**
 * A centralized handler for frontend errors after calling the backend API.
 * @param response The response from the fetch call.
 * @param context A string describing where the error occurred.
 */
const handleApiError = async (response: Response, context: string) => {
    // Try to parse the JSON error message from our backend
    try {
        const errorData = await response.json();
        throw new Error(errorData.error || `An unknown error occurred while ${context}.`);
    } catch (e) {
        // If parsing fails, use the status text from the HTTP response
        throw new Error(response.statusText || `An HTTP error ${response.status} occurred while ${context}.`);
    }
};

/**
 * Sends a request to our backend serverless function to generate images.
 * @returns A promise that resolves to an array of base64 encoded image strings.
 */
export const generateImageFromPrompt = async (prompt: string, aspectRatio: string, numberOfImages: number): Promise<string[]> => {
    const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'generate', prompt, aspectRatio, numberOfImages }),
    });

    if (!response.ok) {
        await handleApiError(response, 'generating image');
    }

    const data = await response.json();
    return data.images;
};

/**
 * Sends a request to our backend to enhance a prompt.
 * @returns A promise that resolves to a more detailed and descriptive prompt.
 */
export const enhancePrompt = async (prompt: string): Promise<string> => {
    const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'enhance', prompt }),
    });

    if (!response.ok) {
        await handleApiError(response, 'enhancing prompt');
    }

    const data = await response.json();
    return data.text;
};

/**
 * Sends a request to our backend to get a random prompt.
 * @returns A promise that resolves to a random prompt string.
 */
export const generateRandomPrompt = async (): Promise<string> => {
    const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'random' }),
    });

    if (!response.ok) {
        await handleApiError(response, 'generating a random prompt');
    }
    
    const data = await response.json();
    return data.text;
};
