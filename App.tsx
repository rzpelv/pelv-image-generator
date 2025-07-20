import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { PromptForm } from './components/PromptForm';
import { ImageDisplay } from './components/ImageDisplay';
import { Footer } from './components/Footer';
import { generateImageFromPrompt, enhancePrompt, generateRandomPrompt } from './services/geminiService';
import { ErrorAlert } from './components/ErrorAlert';
import { HistoryPanel, HistoryItem } from './components/HistoryPanel';

// --- Start of ImageModal component ---
interface ImageModalProps {
  imageUrl: string;
  onClose: () => void;
  onDownload: (url: string) => void;
}

const DownloadIconModal = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);


const ImageModal: React.FC<ImageModalProps> = ({ imageUrl, onClose, onDownload }) => {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 animate-fade-in-fast"
            onClick={onClose}
        >
            <div 
                className="relative max-w-4xl max-h-4xl w-full h-full p-4"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on the image
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 text-white bg-black bg-opacity-50 p-2 rounded-full hover:bg-opacity-75"
                    aria-label="Close"
                >
                    <CloseIcon/>
                </button>
                <div className="flex items-center justify-center w-full h-full">
                    <img src={imageUrl} alt="Enlarged view" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
                </div>
                <button
                    onClick={() => onDownload(imageUrl)}
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                   <DownloadIconModal />
                   Download
                </button>
            </div>
             <style>{`
                @keyframes fadeInFast {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in-fast {
                    animation: fadeInFast 0.2s ease-in-out;
                }
             `}</style>
        </div>
    );
};
// --- End of ImageModal component ---


type AppTab = 'configure' | 'history';

const MAX_HISTORY_ITEMS = 50;

const App: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [numberOfImages, setNumberOfImages] = useState(1);
  const [imageUrls, setImageUrls] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isGeneratingIdea, setIsGeneratingIdea] = useState(false);
  const [error, setError] = useState('');
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<AppTab>('configure');
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const countdownTimer = useRef<ReturnType<typeof setInterval> | null>(null);


  // Load history from localStorage on initial render
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('pelv-image-gen-history');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (e) {
      console.error("Failed to load history from localStorage:", e);
      // If parsing fails, clear the corrupted history
      localStorage.removeItem('pelv-image-gen-history');
    }
    // Cleanup timer on unmount
    return () => {
        if (countdownTimer.current) {
            clearInterval(countdownTimer.current);
        }
    };
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    try {
      const historyToSave = history.slice(0, MAX_HISTORY_ITEMS);
      localStorage.setItem('pelv-image-gen-history', JSON.stringify(historyToSave));
    } catch (e) {
      console.error("Failed to save history to localStorage:", e);
      // Attempt to clear and save a smaller slice if quota is exceeded
      if (e instanceof DOMException && e.name === 'QuotaExceededError') {
        try {
            const smallerHistory = history.slice(0, 10); // Drastically reduce
            localStorage.setItem('pelv-image-gen-history', JSON.stringify(smallerHistory));
        } catch (finalError) {
            console.error("Could not save even a smaller history:", finalError);
        }
      }
    }
  }, [history]);

  const handleApiCall = useCallback(async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt.');
      return;
    }
    setIsLoading(true);
    setError('');
    setImageUrls(null);
    try {
      const generatedImages = await generateImageFromPrompt(prompt, aspectRatio, numberOfImages);
      const urls = generatedImages.map(base64 => `data:image/jpeg;base64,${base64}`);
      setImageUrls(urls);
      
      // Add to history
      const newHistoryItem: HistoryItem = {
        id: new Date().toISOString(),
        prompt,
        imageUrls: urls,
        aspectRatio,
        numberOfImages,
        timestamp: new Date().getTime(),
      };
      setHistory(prevHistory => [newHistoryItem, ...prevHistory].slice(0, MAX_HISTORY_ITEMS));

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      if (errorMessage.includes("You've exceeded your request quota")) {
        setError(errorMessage);
        setIsRateLimited(true);
        setCountdown(60);
        countdownTimer.current = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(countdownTimer.current!);
                    setIsRateLimited(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }, [prompt, aspectRatio, numberOfImages]);

  const handleEnhancePrompt = useCallback(async () => {
    if (!prompt) return;
    setIsEnhancing(true);
    setError('');
    try {
        const enhanced = await enhancePrompt(prompt);
        setPrompt(enhanced);
    } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
        setIsEnhancing(false);
    }
  }, [prompt]);

  const handleSurpriseMe = useCallback(async () => {
    setIsGeneratingIdea(true);
    setError('');
    try {
        const randomPrompt = await generateRandomPrompt();
        setPrompt(randomPrompt);
    } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
        setIsGeneratingIdea(false);
    }
  }, []);
  
  const handleApplyStyle = useCallback((styleKeywords: string) => {
    setPrompt(prev => {
        const trimmedPrev = prev.trim();
        if (trimmedPrev.endsWith(',')) {
            return `${trimmedPrev} ${styleKeywords}`;
        }
        return trimmedPrev ? `${trimmedPrev}, ${styleKeywords}` : styleKeywords;
    });
  }, []);

  const handleReuseHistory = useCallback((item: HistoryItem) => {
    setPrompt(item.prompt);
    setAspectRatio(item.aspectRatio);
    setNumberOfImages(item.numberOfImages);
    setActiveTab('configure');
  }, []);

  const handleDownload = useCallback((url: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `pelv-ai-image-${new Date().getTime()}.jpeg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, []);

  const handleImageClick = (url: string) => {
    setSelectedImageUrl(url);
  };

  const handleCloseModal = () => {
    setSelectedImageUrl(null);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-gray-100 font-sans">
      <Header />
      <main className="flex-grow container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Configuration & History */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="bg-gray-800 rounded-lg p-6 shadow-xl border border-gray-700">
                <div className="flex border-b border-gray-700 mb-4">
                    <button onClick={() => setActiveTab('configure')} className={`px-4 py-2 text-lg font-semibold transition-colors ${activeTab === 'configure' ? 'border-b-2 border-indigo-500 text-white' : 'text-gray-400 hover:text-white'}`}>
                        Configure
                    </button>
                    <button onClick={() => setActiveTab('history')} className={`px-4 py-2 text-lg font-semibold transition-colors ${activeTab === 'history' ? 'border-b-2 border-indigo-500 text-white' : 'text-gray-400 hover:text-white'}`}>
                        History
                    </button>
                </div>
                {error && <ErrorAlert message={error} />}
                {activeTab === 'configure' ? (
                    <PromptForm
                        prompt={prompt}
                        setPrompt={setPrompt}
                        aspectRatio={aspectRatio}
                        setAspectRatio={setAspectRatio}
                        numberOfImages={numberOfImages}
                        setNumberOfImages={setNumberOfImages}
                        isLoading={isLoading}
                        isEnhancing={isEnhancing}
                        isGeneratingIdea={isGeneratingIdea}
                        onSubmit={handleApiCall}
                        onEnhancePrompt={handleEnhancePrompt}
                        onSurpriseMe={handleSurpriseMe}
                        onApplyStyle={handleApplyStyle}
                        isRateLimited={isRateLimited}
                        countdown={countdown}
                    />
                ) : (
                    <HistoryPanel history={history} onReuse={handleReuseHistory} />
                )}
            </div>
          </div>
          {/* Right Column: Image Display */}
          <div className="lg:col-span-2">
            <ImageDisplay
              imageUrls={imageUrls}
              isLoading={isLoading}
              onDownload={handleDownload}
              onImageClick={handleImageClick}
            />
          </div>
        </div>
      </main>
      {selectedImageUrl && <ImageModal imageUrl={selectedImageUrl} onClose={handleCloseModal} onDownload={handleDownload} />}
      <Footer />
    </div>
  );
};

export default App;