import React from 'react';

interface PromptFormProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  aspectRatio: string;
  setAspectRatio: (ratio: string) => void;
  numberOfImages: number;
  setNumberOfImages: (num: number) => void;
  isLoading: boolean;
  isEnhancing: boolean;
  isGeneratingIdea: boolean;
  onSubmit: () => void;
  onEnhancePrompt: () => void;
  onSurpriseMe: () => void;
  onApplyStyle: (keywords: string) => void;
  isRateLimited: boolean;
  countdown: number;
}

const stylePresets = [
    { name: 'Cinematic', keywords: 'cinematic, dramatic lighting, epic composition, photorealistic, 4k' },
    { name: 'Anime', keywords: 'anime style, vibrant colors, detailed line art, manga aesthetic' },
    { name: '3D Render', keywords: '3d render, octane render, high detail, physically based rendering' },
    { name: 'Digital Art', keywords: 'digital painting, concept art, fantasy, intricate details, artstation' },
    { name: 'Vintage Photo', keywords: 'vintage photograph, sepia, grainy, 1950s aesthetic, retro' },
    { name: 'Minimalist', keywords: 'minimalist, clean lines, simple, modern, uncluttered' },
];


const EnhanceIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);

const LightbulbIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.657a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM8.343 5.657a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM11 16a1 1 0 10-2 0v1a1 1 0 102 0v-1zM5.657 14.343a1 1 0 00-1.414 1.414l.707.707a1 1 0 001.414-1.414l-.707-.707zM14.343 14.343a1 1 0 001.414 1.414l.707-.707a1 1 0 00-1.414-1.414l-.707-.707zM4 11a1 1 0 100-2H3a1 1 0 100 2h1zM16 11a1 1 0 100-2h1a1 1 0 100 2h-1zM7 10a4 4 0 014-4h.01a4 4 0 014 4 5 5 0 01-8.01 0z" />
    </svg>
);

const GenerateIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
        <path d="M4.632 3.533A2 2 0 016.577 2.66l7.48 2.493a2 2 0 011.233 2.149l-2.493 7.479a2 2 0 01-3.382 1.233L9.5 13.5l-2.023 2.023a1.5 1.5 0 01-2.121 0l-1.414-1.414a1.5 1.5 0 010-2.121L5.964 10 3.533 5.368a2 2 0 011.1-1.835z" />
    </svg>
);


export const PromptForm: React.FC<PromptFormProps> = ({
  prompt,
  setPrompt,
  aspectRatio,
  setAspectRatio,
  numberOfImages,
  setNumberOfImages,
  isLoading,
  isEnhancing,
  isGeneratingIdea,
  onSubmit,
  onEnhancePrompt,
  onSurpriseMe,
  onApplyStyle,
  isRateLimited,
  countdown,
}) => {
    
    const isBusy = isLoading || isEnhancing || isGeneratingIdea || isRateLimited;

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit();
            }}
            className="space-y-6"
        >
            <div>
                <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-2">Your Prompt</label>
                <textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., A majestic lion wearing a crown, photorealistic"
                    className="w-full h-24 p-3 bg-gray-800 border-2 border-gray-700 rounded-lg text-gray-100 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    rows={10}
                    disabled={isBusy}
                />
            </div>
            
            <div>
                 <label className="block text-sm font-medium text-gray-300 mb-2">Style Presets</label>
                 <div className="flex flex-wrap gap-2">
                     {stylePresets.map(preset => (
                         <button
                            key={preset.name}
                            type="button"
                            onClick={() => onApplyStyle(preset.keywords)}
                            disabled={isBusy}
                            className="px-3 py-1 bg-gray-700 text-sm text-gray-200 rounded-full hover:bg-indigo-600 hover:text-white disabled:bg-gray-800 disabled:cursor-not-allowed disabled:text-gray-500 transition-colors"
                         >
                            {preset.name}
                         </button>
                     ))}
                 </div>
            </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                    type="button"
                    onClick={onEnhancePrompt}
                    disabled={isBusy || !prompt}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600/80 text-white rounded-lg hover:bg-indigo-600 disabled:bg-indigo-900/50 disabled:cursor-not-allowed disabled:text-gray-400 transition-all font-semibold"
                >
                   {isEnhancing ? (
                        <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin"></div>
                    ) : (
                        <EnhanceIcon />
                    )}
                    Enhance Prompt
                </button>
                 <button
                    type="button"
                    onClick={onSurpriseMe}
                    disabled={isBusy}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600/80 text-white rounded-lg hover:bg-purple-600 disabled:bg-purple-900/50 disabled:cursor-not-allowed disabled:text-gray-400 transition-all font-semibold"
                >
                    {isGeneratingIdea ? (
                        <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin"></div>
                    ) : (
                        <LightbulbIcon />
                    )}
                    Surprise Me
                </button>
            </div>

            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                     <div className="w-full">
                        <label htmlFor="numberOfImages" className="block text-sm font-medium text-gray-300 mb-2">Number of Images</label>
                        <select
                            id="numberOfImages"
                            value={numberOfImages}
                            onChange={(e) => setNumberOfImages(Number(e.target.value))}
                            className="w-full p-3 bg-gray-800 border-2 border-gray-700 rounded-lg text-gray-100 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                            disabled={isBusy}
                        >
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                        </select>
                    </div>
                    <div className="w-full">
                        <label htmlFor="aspectRatio" className="block text-sm font-medium text-gray-300 mb-2">Aspect Ratio</label>
                        <select
                            id="aspectRatio"
                            value={aspectRatio}
                            onChange={(e) => setAspectRatio(e.target.value)}
                            className="w-full p-3 bg-gray-800 border-2 border-gray-700 rounded-lg text-gray-100 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                            disabled={isBusy}
                        >
                            <option value="1:1">Square (1:1)</option>
                            <option value="16:9">Widescreen (16:9)</option>
                            <option value="9:16">Portrait (9:16)</option>
                            <option value="4:3">Landscape (4:3)</option>
                            <option value="3:4">Portrait (3:4)</option>
                        </select>
                    </div>
                </div>
            </div>

            <button
                type="submit"
                disabled={isBusy || !prompt}
                className={`w-full flex items-center justify-center gap-3 px-4 py-4 text-lg text-white rounded-lg font-bold transition-all shadow-lg ${isRateLimited ? 'bg-red-800' : 'bg-green-600 hover:bg-green-700 hover:shadow-green-500/30'} disabled:bg-gray-700 disabled:cursor-not-allowed`}
            >
                {isRateLimited ? (
                     `Try again in ${countdown}s`
                ) : isLoading ? (
                    <>
                        <div className="w-6 h-6 border-2 border-dashed rounded-full animate-spin"></div>
                        Generating...
                    </>
                ) : (
                    <>
                        <GenerateIcon />
                        Generate Image
                    </>
                )}
            </button>
        </form>
    );
};