import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { productService } from '../services/productService';
import type { User, GenerationResult, VideoResult } from '../types';
import Spinner from './Spinner';
import ImageCarousel from './ImageCarousel';
import StoryDisplay from './StoryDisplay';

interface ProfileModalProps {
  user: User;
  onClose: () => void;
}

type CatalogueItem = (GenerationResult & { itemType: 'story' }) | (VideoResult & { itemType: 'video' });


const CatalogueDetailView: React.FC<{ item: CatalogueItem; onClose: () => void }> = ({ item, onClose }) => {
  return (
    <div
      className="fixed inset-0 bg-black/70 z-[60] flex justify-center items-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="catalogue-detail-title"
    >
      <div
        className="bg-stone-50 rounded-2xl shadow-xl w-full max-w-5xl h-[90vh] flex flex-col p-6 sm:p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-500 hover:text-stone-800 z-10 p-1 bg-white/50 rounded-full"
          aria-label="Close detail view"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h3 id="catalogue-detail-title" className="text-2xl font-serif text-amber-900 mb-4 text-center flex-shrink-0">Catalogue Detail</h3>
        <div className="flex-grow overflow-y-auto pr-4 -mr-4">
          {item.itemType === 'story' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="flex flex-col space-y-6">
                <div>
                    <h4 className="text-xl font-semibold text-stone-700 mb-2">Generated Showcase</h4>
                    {item.images && item.images.length > 0 ? (
                    <ImageCarousel images={item.images} />
                    ) : (
                    <div className="h-64 sm:h-80 rounded-lg bg-stone-100 flex items-center justify-center text-stone-500">
                        No generated images.
                    </div>
                    )}
                </div>
                <div>
                    <h4 className="text-xl font-semibold text-stone-700 mb-2">Original Product Image</h4>
                    <img src={item.inputs.image.previewUrl} alt="Original product" className="w-full h-auto max-h-64 object-contain rounded-lg border bg-white p-2" />
                </div>
              </div>
              <div className="flex flex-col">
                <h4 className="text-xl font-semibold text-stone-700 mb-2">Generated Story</h4>
                <div className="bg-white rounded-md p-4 border border-stone-200 flex-grow flex">
                  <StoryDisplay story={item.story} />
                </div>
              </div>
            </div>
          ) : ( // video item
            <div className="max-w-md mx-auto">
                <h4 className="text-xl font-semibold text-stone-700 mb-4 text-center">Generated Video Ad</h4>
                <video src={item.videoDataUrl} poster={item.inputImage?.previewUrl} className="w-full rounded-lg shadow-md" controls />
                <div className="mt-4 bg-white p-4 rounded-lg border">
                  <p className="font-semibold text-stone-800">Prompt:</p>
                  <p className="text-stone-600 mt-1">{item.prompt}</p>
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


const ProfileModal: React.FC<ProfileModalProps> = ({ user, onClose }) => {
  const { updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    bio: user.bio || '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [catalogueItems, setCatalogueItems] = useState<CatalogueItem[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [selectedItem, setSelectedItem] = useState<CatalogueItem | null>(null);

  useEffect(() => {
    const fetchCatalogue = async () => {
      setIsLoadingProducts(true);
      try {
        const [userProducts, userVideos] = await Promise.all([
          productService.getProductsForUser(user.email),
          productService.getVideosForUser(user.email)
        ]);
        
        const items: CatalogueItem[] = [
          ...userProducts.map(p => ({ ...p, itemType: 'story' as const })),
          ...userVideos.map(v => ({ ...v, itemType: 'video' as const }))
        ];

        // Sort by creation date, newest first
        items.sort((a, b) => b.createdAt - a.createdAt);

        setCatalogueItems(items);
      } catch (e) {
        console.error("Failed to fetch catalogue", e);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchCatalogue();
  }, [user.email]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await updateUser(formData);
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => {
        // Do not close automatically, let the user see the success message
      }, 1500);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-modal-title"
      >
        <div
          className="bg-white rounded-2xl shadow-lg w-full max-w-3xl h-[90vh] flex flex-col p-6 sm:p-8 m-4 relative"
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-stone-500 hover:text-stone-800 z-10"
            aria-label="Close profile settings"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 id="profile-modal-title" className="text-2xl font-semibold text-stone-700 text-center mb-6 flex-shrink-0">Profile & Product Catalogue</h2>

          <div className="flex-grow overflow-y-auto pr-4 -mr-4">
            <section className="mb-8">
              <h3 className="text-xl font-semibold text-stone-700 mb-4 border-b pb-2">Your Details</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name-profile" className="block text-sm font-medium text-stone-700">Name or Brand Name</label>
                  <input id="name-profile" name="name" type="text" value={formData.name} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm" />
                </div>
                <div>
                  <label htmlFor="email-profile" className="block text-sm font-medium text-stone-700">Email Address</label>
                  <input id="email-profile" name="email" type="email" value={formData.email} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm" />
                </div>
                <div>
                  <label htmlFor="bio-profile" className="block text-sm font-medium text-stone-700">About You or Your Craft (Bio)</label>
                  <textarea id="bio-profile" name="bio" value={formData.bio} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm" rows={3} />
                </div>

                {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
                {successMessage && <p className="text-sm text-green-600 bg-green-50 p-3 rounded-md">{successMessage}</p>}

                <div className="flex items-center justify-end space-x-4 pt-2">
                  <button type="button" onClick={onClose} className="px-4 py-2 border border-stone-300 rounded-md shadow-sm text-md font-semibold text-stone-700 bg-white hover:bg-stone-50">Cancel</button>
                  <button type="submit" disabled={isLoading} className="px-6 py-2 border border-transparent rounded-md shadow-sm text-md font-semibold text-white bg-amber-800 hover:bg-amber-900 disabled:bg-stone-400">{isLoading ? 'Saving...' : 'Save Changes'}</button>
                </div>
              </form>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-stone-700 mb-4 border-b pb-2">Your Catalogue</h3>
              {isLoadingProducts ? (
                <div className="flex justify-center p-8"><Spinner message="Loading your catalogue..." /></div>
              ) : catalogueItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {catalogueItems.map((item) => (
                    <div 
                      key={item.itemType === 'story' ? item.createdAt : item.id} 
                      className="bg-stone-50 border border-stone-200 rounded-lg overflow-hidden shadow-sm flex flex-col cursor-pointer transition-shadow hover:shadow-md"
                      onClick={() => setSelectedItem(item)}
                    >
                      {item.itemType === 'story' ? (
                        <>
                          <img 
                            src={item.images?.[0] || item.inputs.image.previewUrl} 
                            alt="Product" 
                            className="w-full h-40 object-cover" 
                          />
                          <div className="p-4 flex flex-col flex-grow">
                            <p className="font-semibold text-stone-800 truncate" title={item.inputs.productDescription}>
                              {item.inputs.productDescription}
                            </p>
                            <p className="text-sm text-stone-600 mt-2 line-clamp-3 flex-grow">
                              {item.story.split('\n').find(line => line.trim() && !line.startsWith('#')) || 'No story text available.'}
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <video 
                            src={item.videoDataUrl} 
                            poster={item.inputImage?.previewUrl}
                            className="w-full h-40 object-cover bg-stone-200" 
                          />
                          <div className="p-4 flex flex-col flex-grow">
                            <p className="font-semibold text-stone-800 truncate" title={item.prompt}>
                              {item.prompt}
                            </p>
                            <p className="text-sm text-stone-500 mt-2 flex-grow">
                              Generated Video Ad
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-stone-500 py-8 bg-stone-50 rounded-lg">
                  <p>You haven't created any products yet.</p>
                  <p className="text-sm mt-1">Go ahead and generate your first story or video!</p>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
      {selectedItem && <CatalogueDetailView item={selectedItem} onClose={() => setSelectedItem(null)} />}
    </>
  );
};

export default ProfileModal;
