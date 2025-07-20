import React from 'react';

export interface HistoryItem {
    id: string;
    prompt: string;
    imageUrls: string[];
    aspectRatio: string;
    numberOfImages: number;
    timestamp: number;
}

interface HistoryPanelProps {
    history: HistoryItem[];
    onReuse: (item: HistoryItem) => void;
}

const ReuseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
    </svg>
);

const EmptyHistory = () => (
     <div className="text-center text-gray-500 py-10">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 text-gray-600">
            <path d="M12 20v-6M6 20v-4M18 20v-8"/>
            <rect x="2" y="3" width="20" height="14" rx="2" />
        </svg>
        <h3 className="text-lg font-semibold">No History Yet</h3>
        <p className="mt-1 text-sm">Your generated images will appear here.</p>
    </div>
);

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onReuse }) => {
    if (history.length === 0) {
        return <EmptyHistory />;
    }

    return (
        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {history.map(item => (
                <div key={item.id} className="bg-gray-700/50 p-3 rounded-lg">
                    <div className="grid grid-cols-3 gap-2">
                        {item.imageUrls.slice(0, 3).map((url, index) => (
                             <img key={index} src={url} alt={`History thumb ${index}`} className="w-full h-full object-cover rounded-md aspect-square"/>
                        ))}
                    </div>
                    <p className="text-xs text-gray-300 mt-2 truncate" title={item.prompt}>{item.prompt}</p>
                    <div className="flex justify-between items-center mt-2">
                         <span className="text-xs text-gray-400">{new Date(item.timestamp).toLocaleDateString()}</span>
                         <button 
                            onClick={() => onReuse(item)}
                            className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600 text-white text-xs font-semibold rounded-md hover:bg-indigo-700 transition-colors"
                        >
                            <ReuseIcon />
                            Reuse
                         </button>
                    </div>
                </div>
            ))}
        </div>
    );
};
