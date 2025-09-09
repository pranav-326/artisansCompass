
import React, { useState, useCallback } from 'react';
import ImageUploader from './components/ImageUploader';
import Spinner from './components/Spinner';
import { generateProductStory, generateProfessionalImages } from './services/geminiService';
import { productService } from './services/productService';
import { useAuth } from './context/AuthContext';
import type { ImageState, GenerationResult, GenerationInputs } from './types';
import ResultsPage from './pages/ResultsPage';
import ProfileModal from './components/ProfileModal';
import CustomSelect from './components/CustomSelect';
import VideoPage from './pages/VideoPage';

const platformOptions = [
  { 
    value: 'Instagram', 
    label: 'Instagram', 
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
      </svg>
    ) 
  },
  { 
    value: 'Facebook', 
    label: 'Facebook', 
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" stroke="none">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
      </svg>
    )
  },
  { 
    value: 'Pinterest', 
    label: 'Pinterest', 
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" stroke="none">
        <path d="M12.017 2c-5.483 0-9.917 4.343-9.917 9.695 0 3.738 2.053 7.02 5.034 8.535.114-.493.226-1.22.28-1.464.062-.281.393-.578.393-.578s-.1-.398-.1-1.023c0-.957.582-1.678 1.313-1.678.618 0 .915.464.915 1.022 0 .621-.394 1.554-.599 2.418-.168.73.364 1.334 1.097 1.334 1.314 0 2.203-1.385 2.203-3.355 0-1.748-1.248-2.986-2.83-2.986-1.942 0-3.076 1.428-3.076 3.09 0 .561.205 1.168.46 1.527.05.071.058.093.042.158-.027.108-.09.37-.116.46-.032.108-.08.132-.192.08-1.03-.455-1.68-1.808-1.68-3.148 0-2.583 1.93-4.728 5.29-4.728 2.775 0 4.903 1.93 4.903 4.582 0 2.76-1.733 4.945-4.143 4.945-1.31 0-2.283-.685-1.97-1.494.38-1.01.54-2.09.54-2.843 0-.546-.192-1.034-.57-1.457-1.155-1.28-2.502-2.73-2.502-4.94 0-1.54.58-2.94 1.5-3.86.91-0.91 2.14-1.46 3.49-1.46 1.25 0 2.38.49 3.25 1.35 0.86.86 1.35 1.99 1.35 3.24 0 1.25-0.49 2.38-1.35 3.25-0.87.87-1.99 1.35-3.24 1.35z"></path>
      </svg>
    ) 
  },
  { 
    value: 'Etsy', 
    label: 'Etsy', 
    icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" stroke="none">
            <path d="M11.984 9.984h5.297v2.016h-5.297V9.984zM6.188 6v10.125c0 .516.14.938.422 1.266.281.328.656.469 1.125.469.375 0 .75-.14.984-.281l.281-.281v-1.64c-.14.047-.328.094-.469.094-.563 0-.844-.281-.844-.844V6h1.969V4.031H6.188V6zm11.812-1.969h-4.828v10.078c0 .563-.14.984-.422 1.266-.281.281-.703.469-1.125.469-.563 0-1.031-.188-1.406-.516-.375-.328-.563-.844-.563-1.406V4.031h-1.97V18H18V4.031z"></path>
        </svg>
    ) 
  },
  { 
    value: 'TikTok', 
    label: 'TikTok', 
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" stroke="none">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-2.43.05-4.84-.94-6.37-2.96-2.24-2.95-2.24-6.42-0.01-9.38 1.25-1.64 3.01-2.75 5-3.16v4.3c-1.31.38-2.49 1.1-3.41 2.12-1.32 1.43-1.86 3.31-1.54 5.15.38 2.05 2.09 3.65 4.17 3.98 2.09.32 4.19-.66 5.42-2.32.17-.23.3-.47.41-.72 0-2.58 0-5.17 0-7.75v-1.7c-1.18.01-2.35.01-3.53.01z"></path>
      </svg>
    ) 
  },
  { 
    value: 'General', 
    label: 'General / Blog', 
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9"></path>
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
      </svg>
    ) 
  },
];

/**
 * Resizes a base64 encoded image to a smaller footprint to save storage space.
 * @param base64Str The original base64 image data URL.
 * @param maxWidth The maximum width of the resized image.
 * @param quality The quality of the output JPEG image (0 to 1).
 * @returns A promise that resolves with the new, smaller base64 data URL.
 */
const resizeImage = (base64Str: string, maxWidth = 800, quality = 0.85): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      let newWidth = img.width;
      if (img.width > maxWidth) {
        newWidth = maxWidth;
      }

      const canvas = document.createElement('canvas');
      const scale = newWidth / img.width;
      canvas.width = newWidth;
      canvas.height = img.height * scale;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return reject(new Error('Could not get 2D context from canvas'));
      }

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Use JPEG for better compression of photographic images.
      const resizedBase64 = canvas.toDataURL('image/jpeg', quality);
      resolve(resizedBase64);
    };
    img.onerror = (error) => {
      console.error("Failed to load image for resizing.", error);
      // Fallback to original string if loading fails, to not break the whole flow.
      resolve(base64Str);
    };
  });
};

const App: React.FC = () => {
  const { user, logout } = useAuth();

  const [image, setImage] = useState<ImageState | null>(null);
  const [productDescription, setProductDescription] = useState<string>('');
  const [targetAudience, setTargetAudience] = useState<string>('');
  const [platform, setPlatform] = useState<string>('Instagram');
  const [aesthetic, setAesthetic] = useState<string>('');
  const [shouldGenerateImages, setShouldGenerateImages] = useState<boolean>(true);
  
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [resultData, setResultData] = useState<GenerationResult | null>(null);
  const [uploaderKey, setUploaderKey] = useState(0);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [activeGenerator, setActiveGenerator] = useState<'story' | 'video'>('story');


  const handleGenerate = useCallback(async () => {
    setError(null);
    if (!image || !productDescription || !targetAudience) {
      setError('Please provide an image, product details, and target audience.');
      return;
    }
    if (shouldGenerateImages && !aesthetic) {
      setError('Please describe the desired photo aesthetic when generating images.');
      return;
    }

    setIsGenerating(true);

    const artisanName = user?.name ?? '';
    const artisanBio = user?.bio ?? '';

    try {
      // Generate story first to avoid sending too many API requests at once.
      const generatedStory = await generateProductStory(image, productDescription, targetAudience, platform, artisanName, artisanBio);
      
      let professionalImages: string[] = [];
      // If requested, generate images after the story is successfully created.
      if (shouldGenerateImages) {
        professionalImages = await generateProfessionalImages(image, productDescription, targetAudience, aesthetic);
      }
      
      const inputs: GenerationInputs = { image, productDescription, targetAudience, platform, aesthetic, shouldGenerateImages };
      const newResultData: GenerationResult = { story: generatedStory, images: professionalImages, inputs, createdAt: Date.now() };
      setResultData(newResultData);

      if (user) {
        // Resize generated images to a smaller footprint to avoid
        // exceeding localStorage quota, then save the full result.
        const resizedImages = await Promise.all(
          newResultData.images.map(imgBase64 => resizeImage(imgBase64))
        );

        const storableResult: GenerationResult = {
          ...newResultData,
          images: resizedImages,
        };
        await productService.saveProductForUser(user.email, storableResult);
      }

    } catch (err) {
      console.error(err);
      const message = (err instanceof Error) ? err.message : String(err);
      if (message.includes('429') || message.toUpperCase().includes('RESOURCE_EXHAUSTED')) {
        setError('You have exceeded the request limit. Please wait a moment and try again.');
      } else {
        setError('Failed to generate content. Please try again.');
      }
    } finally {
      setIsGenerating(false);
    }
  }, [image, productDescription, targetAudience, platform, aesthetic, shouldGenerateImages, user]);
  
  const handleStartNew = () => {
    setResultData(null);
    setImage(null);
    setProductDescription('');
    setTargetAudience('');
    setPlatform('Instagram');
    setAesthetic('');
    setShouldGenerateImages(true);
    setError(null);
    setUploaderKey(k => k + 1);
  };

  return (
    <>
      <div className="min-h-screen font-sans text-stone-800 flex flex-col items-center p-4 sm:p-6 lg:p-8">
        <header className="w-full max-w-4xl mb-4">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <h1 className="text-4xl sm:text-5xl font-serif text-[#92400d] tracking-tight">Artisan's Compass</h1>
            <div className="flex items-center space-x-4">
                <span className="text-stone-600 hidden sm:block">Welcome, {user?.name}</span>
                <button 
                  onClick={() => setIsProfileModalOpen(true)}
                  className="p-2 rounded-full hover:bg-stone-200 transition-colors"
                  aria-label="Open profile settings"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-stone-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                <button 
                    onClick={logout} 
                    className="bg-stone-200 text-stone-700 px-4 py-2 rounded-md font-semibold hover:bg-stone-300 transition-colors"
                >
                    Logout
                </button>
            </div>
          </div>
        </header>

        <main className="w-full max-w-4xl">
          {resultData ? (
            <ResultsPage result={resultData} onStartNew={handleStartNew} />
          ) : (
             <div className="w-full bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-stone-200">
                <div className="flex justify-center mb-6 border-b border-stone-200">
                    <button
                        onClick={() => setActiveGenerator('story')}
                        className={`px-6 py-3 text-lg font-semibold transition-colors duration-200 ${activeGenerator === 'story' ? 'text-amber-800 border-b-2 border-amber-800' : 'text-stone-500 hover:text-stone-700'}`}
                        aria-pressed={activeGenerator === 'story'}
                    >
                        Story Generator
                    </button>
                    <button
                        onClick={() => setActiveGenerator('video')}
                        className={`px-6 py-3 text-lg font-semibold transition-colors duration-200 ${activeGenerator === 'video' ? 'text-amber-800 border-b-2 border-amber-800' : 'text-stone-500 hover:text-stone-700'}`}
                         aria-pressed={activeGenerator === 'video'}
                   >
                        Video Ad Generator
                    </button>
                </div>
                
                {activeGenerator === 'story' ? (
                  <div className="max-w-2xl mx-auto flex flex-col space-y-6">
                    <div>
                      <label className="text-lg font-semibold text-stone-700 mb-2 block">1. Upload a Product Image</label>
                      <ImageUploader key={uploaderKey} onImageUpload={setImage} />
                    </div>

                    <div>
                      <label htmlFor="productDescription" className="text-lg font-semibold text-stone-700 mb-2 block">2. Product Details (for story)</label>
                      <textarea
                        id="productDescription"
                        value={productDescription}
                        onChange={(e) => setProductDescription(e.target.value)}
                        placeholder="e.g., Hand-carved wooden bowl, made from reclaimed maple wood. It has a smooth, satin finish and is perfect for salads or as a decorative centerpiece."
                        className="w-full p-3 border border-stone-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white text-black"
                        rows={4}
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="targetAudience" className="text-lg font-semibold text-stone-700 mb-2 block">3. Target Audience</label>
                      <input
                        id="targetAudience"
                        type="text"
                        value={targetAudience}
                        onChange={(e) => setTargetAudience(e.target.value)}
                        placeholder="e.g., Eco-conscious home decorators"
                        className="w-full p-3 border border-stone-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white text-black"
                        required
                      />
                    </div>
                     <div>
                      <label htmlFor="platform" className="text-lg font-semibold text-stone-700 mb-2 block">4. Social Media Platform</label>
                       <CustomSelect
                        id="platform"
                        options={platformOptions}
                        value={platform}
                        onChange={setPlatform}
                      />
                    </div>

                    <div className="flex items-center justify-between bg-stone-50 p-4 rounded-lg border border-stone-200">
                      <label htmlFor="generateImagesToggle" className="text-lg font-semibold text-stone-700 cursor-pointer">
                        Generate Professional Images
                      </label>
                      <button
                        id="generateImagesToggle"
                        type="button"
                        onClick={() => setShouldGenerateImages(!shouldGenerateImages)}
                        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 ${shouldGenerateImages ? 'bg-amber-800' : 'bg-stone-300'}`}
                        role="switch"
                        aria-checked={shouldGenerateImages}
                      >
                        <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ${shouldGenerateImages ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>

                    {shouldGenerateImages && (
                      <div className="transition-all duration-500">
                        <label htmlFor="aesthetic" className="text-lg font-semibold text-stone-700 mb-2 block">5. Desired Photo Aesthetic / Vibe</label>
                        <input
                          id="aesthetic"
                          type="text"
                          value={aesthetic}
                          onChange={(e) => setAesthetic(e.target.value)}
                          placeholder="e.g., On a marble countertop with flowers in the background"
                          className="w-full p-3 border border-stone-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white text-black"
                          required={shouldGenerateImages}
                        />
                      </div>
                    )}
                    
                    {error && (
                        <div className="text-center text-red-600 bg-red-50 p-4 rounded-md">
                          <p className="font-bold">An error occurred</p>
                          <p>{error}</p>
                        </div>
                    )}

                    <div className="pt-2">
                      <button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="w-full bg-amber-800 text-white px-6 py-3 rounded-md font-semibold text-lg hover:bg-amber-900 transition-colors duration-300 disabled:bg-stone-400 disabled:cursor-not-allowed flex items-center justify-center shadow-md hover:shadow-lg disabled:shadow-none"
                      >
                        {isGenerating ? <Spinner message="Creating..." /> : shouldGenerateImages ? 'Create Story & Showcase' : 'Create Story'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <VideoPage />
                )}
              </div>
          )}
        </main>
        
        <footer className="w-full max-w-4xl text-center mt-8 py-4">
            <p className="text-stone-500">Powered by Gemini</p>
        </footer>
      </div>

      {isProfileModalOpen && user && <ProfileModal user={user} onClose={() => setIsProfileModalOpen(false)} />}
    </>
  );
};

export default App;