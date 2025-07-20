import React from 'react';

const Icon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9" viewBox="0 0 100 100" aria-hidden="true">
    <rect width="100" height="100" rx="22" fill="#213961"/>
    <g fill="#FFFFFF">
        <circle cx="50" cy="29" r="9"/>
        <path d="M32,43 C42,43 50,56 50,56 C50,56 58,43 68,43 C82,43 83,60 74,70 C65,80 62,88 50,88 C38,88 35,80 26,70 C17,60 18,43 32,43 Z M40,76 C44,78 44,84 40,86 C36,84 36,78 40,76 Z M60,76 C64,78 64,84 60,86 C56,84 56,78 60,76 Z"/>
    </g>
  </svg>
);


export const Header: React.FC = () => {
  return (
    <header className="bg-gray-800/50 backdrop-blur-sm shadow-lg border-b border-gray-700">
      <div className="container mx-auto px-4 py-4 flex items-center gap-4">
        <Icon />
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Pelv Image AI <span className="text-indigo-400">Generator</span>
        </h1>
      </div>
    </header>
  );
};