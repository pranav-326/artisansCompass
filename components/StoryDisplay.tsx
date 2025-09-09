
import React, { useState, useEffect } from 'react';

interface StoryDisplayProps {
  story: string;
}

const StoryDisplay: React.FC<StoryDisplayProps> = ({ story }) => {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => {
        setIsCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);
  
  const handleCopy = () => {
    if (story) {
      navigator.clipboard.writeText(story);
      setIsCopied(true);
    }
  };

  if (!story) {
    return (
      <div className="text-center text-stone-500">
        <p>Your beautifully crafted story will appear here.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-grow overflow-y-auto pr-2">
        <p className="whitespace-pre-wrap font-serif text-stone-700 text-lg leading-relaxed">{story}</p>
      </div>
      <div className="pt-4 text-right">
        <button
          onClick={handleCopy}
          className="bg-stone-200 text-stone-700 px-4 py-2 rounded-md font-semibold hover:bg-stone-300 transition-colors duration-200"
        >
          {isCopied ? 'Copied!' : 'Copy Story'}
        </button>
      </div>
    </div>
  );
};

export default StoryDisplay;
