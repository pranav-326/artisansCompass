import React, { useState, useCallback } from 'react';
import ImageCarousel from '../components/ImageCarousel';
import StoryDisplay from '../components/StoryDisplay';
import Spinner from '../components/Spinner';
import { generateProfessionalImages, translateText } from '../services/geminiService';
import type { GenerationResult } from '../types';

interface ResultsPageProps {
  result: GenerationResult;
  onStartNew: () => void;
}

const ResultsPage: React.FC<ResultsPageProps> = ({ result, onStartNew }) => {
  const [images, setImages] = useState<string[]>(result.images);
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);
  const [regenerateError, setRegenerateError] = useState<string | null>(null);

  const [translatedStory, setTranslatedStory] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [targetLanguage, setTargetLanguage] = useState<string>('');
  const [showOriginal, setShowOriginal] = useState<boolean>(true);


  const { image, productDescription, targetAudience, aesthetic } = result.inputs;

  const handleRegenerateImages = useCallback(async () => {
    setIsRegenerating(true);
    setRegenerateError(null);
    try {
      const newImages = await generateProfessionalImages(image, productDescription, targetAudience, aesthetic);
      setImages(newImages);
    } catch (err) {
      console.error(err);
      const message = (err instanceof Error) ? err.message : String(err);
      if (message.includes('429') || message.toUpperCase().includes('RESOURCE_EXHAUSTED')) {
        setRegenerateError('You have exceeded the request limit. Please wait a moment and try again.');
      } else {
        setRegenerateError('Failed to regenerate images. Please try again.');
      }
    } finally {
      setIsRegenerating(false);
    }
  }, [image, productDescription, targetAudience, aesthetic]);

  const handleTranslate = useCallback(async () => {
    if (!targetLanguage.trim()) return;
    setIsTranslating(true);
    setTranslationError(null);
    try {
      const translation = await translateText(result.story, targetLanguage);
      setTranslatedStory(translation);
      setShowOriginal(false);
    } catch (err) {
        console.error(err);
        const message = (err instanceof Error) ? err.message : String(err);
        if (message.includes('429') || message.toUpperCase().includes('RESOURCE_EXHAUSTED')) {
            setTranslationError(`Request limit exceeded. Please wait and try again.`);
        } else {
            setTranslationError(`Failed to translate to ${targetLanguage}. Please try again.`);
        }
    } finally {
        setIsTranslating(false);
    }
  }, [result.story, targetLanguage]);

  const handleDownloadImages = useCallback(() => {
    if (images.length === 0) return;

    images.forEach((imageSrc, index) => {
      const link = document.createElement('a');
      link.href = imageSrc;

      const mimeTypeMatch = imageSrc.match(/data:image\/([^;]+);base64,/);
      const extension = mimeTypeMatch ? mimeTypeMatch[1] : 'png';
      
      link.download = `artisan-showcase-${index + 1}.${extension}`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }, [images]);

  return (
    <div className="w-full bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-stone-200">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Story column */}
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <h2 className="text-3xl font-serif text-amber-900">Your Captivating Story</h2>
            {translatedStory && (
                <button
                    onClick={() => setShowOriginal(!showOriginal)}
                    className="text-sm font-semibold text-amber-800 hover:text-amber-900 transition-colors"
                    aria-live="polite"
                >
                    {showOriginal ? 'Show Translation' : 'Show Original'}
                </button>
            )}
          </div>
          <div className="flex-grow bg-stone-50 rounded-md p-4 border border-stone-200 min-h-[20rem] flex">
            <StoryDisplay story={showOriginal ? result.story : translatedStory || ''} />
          </div>
          
          {/* Translation Controls */}
           <div className="pt-2">
            <h3 className="text-lg font-semibold text-stone-700 mb-2">Translate Your Story</h3>
            <div className="flex flex-col sm:flex-row gap-4 items-center">
                <input
                    type="text"
                    value={targetLanguage}
                    onChange={(e) => setTargetLanguage(e.target.value)}
                    placeholder="Enter a language (e.g., Spanish)"
                    className="flex-grow p-3 border border-stone-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white text-black w-full sm:w-auto"
                    aria-label="Enter language for translation"
                    disabled={isTranslating}
                />
                <button
                    onClick={handleTranslate}
                    disabled={isTranslating || !targetLanguage.trim()}
                    className="w-full sm:w-auto bg-stone-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-stone-700 transition-colors duration-300 disabled:bg-stone-400 disabled:cursor-not-allowed flex items-center justify-center"
                >
                    {isTranslating ? 'Translating...' : 'Translate'}
                </button>
            </div>
            {isTranslating && <div className="mt-4"><Spinner message="Translating content..." /></div>}
            {translationError && (
                <div className="mt-4 text-center text-red-600 bg-red-50 p-3 rounded-md">
                    <p>{translationError}</p>
                </div>
            )}
          </div>
        </div>
        
        {/* Images column */}
        <div className="flex flex-col space-y-4">
          <h2 className="text-3xl font-serif text-amber-900">Your Product Showcase</h2>
          {isRegenerating ? (
            <div className="h-64 sm:h-80 rounded-lg bg-stone-100 flex items-center justify-center">
              <Spinner message="Regenerating images..." />
            </div>
          ) : images.length > 0 ? (
            <ImageCarousel images={images} />
          ) : (
            <div className="h-64 sm:h-80 rounded-lg bg-stone-100 flex items-center justify-center text-stone-500 text-center p-4">
              <p>No images were generated for this story.</p>
            </div>
          )}

          {regenerateError && (
            <div className="text-center text-red-600 bg-red-50 p-4 rounded-md">
              <p className="font-bold">An error occurred</p>
              <p>{regenerateError}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            {result.inputs.shouldGenerateImages && (
              <button
                onClick={handleRegenerateImages}
                disabled={isRegenerating}
                className="flex-1 bg-amber-800 text-white px-6 py-3 rounded-md font-semibold text-lg hover:bg-amber-900 transition-colors duration-300 disabled:bg-stone-400 disabled:cursor-not-allowed flex items-center justify-center shadow-md hover:shadow-lg disabled:shadow-none"
              >
                {isRegenerating ? 'Regenerating...' : '🔄 Regenerate Images'}
              </button>
            )}
            {images.length > 0 && (
               <button
                onClick={handleDownloadImages}
                disabled={isRegenerating}
                className="flex-1 bg-stone-600 text-white px-6 py-3 rounded-md font-semibold text-lg hover:bg-stone-700 transition-colors duration-300 disabled:bg-stone-400 disabled:cursor-not-allowed flex items-center justify-center shadow-md hover:shadow-lg disabled:shadow-none"
              >
                📥 Download Images
              </button>
            )}
            <button
              onClick={onStartNew}
              className="flex-1 bg-stone-200 text-stone-700 px-6 py-3 rounded-md font-semibold text-lg hover:bg-stone-300 transition-colors duration-300"
            >
              ＋ Create New Story
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;