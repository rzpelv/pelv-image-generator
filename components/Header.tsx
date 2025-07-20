import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-gray-800/50 backdrop-blur-sm shadow-lg border-b border-gray-700">
      <div className="container mx-auto px-4 py-4 flex items-center gap-4">
        <img src="/icon.svg" alt="Pelv Logo" className="h-9 w-9" />
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Pelv Image AI <span className="text-indigo-400">Generator</span>
        </h1>
      </div>
    </header>
  );
};