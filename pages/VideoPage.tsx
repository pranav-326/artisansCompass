import React, { useState, useEffect, useRef } from 'react';
import ImageUploader from '../components/ImageUploader';
import Spinner from '../components/Spinner';
import { generateVideoAd, checkVideoOperationStatus, getVideoUrl } from '../services/geminiService';
import type { ImageState, VideoResult } from '../types';
import { useAuth } from '../context/AuthContext';
import { productService } from '../services/productService';

const loadingMessages = [
    "Warming up the cameras...",
    "Scouting for the perfect location...",
    "Directing the scene...",
    "Adding special effects...",
    "Rendering the final cut...",
    "This can take a few minutes, hang tight!"
];

const VideoPage: React.FC = () => {
    const [image, setImage] = useState<ImageState | null>(null);
    const [prompt, setPrompt] = useState<string>('');
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [isFetchingVideo, setIsFetchingVideo] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [playableUrl, setPlayableUrl] = useState<string | null>(null);
    const [loadingMessage, setLoadingMessage] = useState<string>(loadingMessages[0]);
    
    const { user } = useAuth();
    const uploaderKey = useRef(0);
    const pollingInterval = useRef<ReturnType<typeof setInterval> | null>(null);
    const messageInterval = useRef<ReturnType<typeof setInterval> | null>(null);
    
    // Cleanup intervals on unmount
    useEffect(() => {
        return () => {
            if (pollingInterval.current) clearInterval(pollingInterval.current);
            if (messageInterval.current) clearInterval(messageInterval.current);
        }
    }, []);
    
    // Effect to fetch video data when download URL is ready
    useEffect(() => {
        if (!downloadUrl) return;

        const fetchVideoData = async () => {
            setIsFetchingVideo(true);
            setError(null);
            try {
                const response = await fetch(downloadUrl);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const videoBlob = await response.blob();

                // Save video as data URL for persistence
                const reader = new FileReader();
                reader.readAsDataURL(videoBlob);
                reader.onloadend = async () => {
                    const videoDataUrl = reader.result as string;
                    if (user && videoDataUrl) {
                        try {
                            const newVideo: VideoResult = {
                                id: new Date().toISOString(),
                                createdAt: Date.now(),
                                videoDataUrl,
                                prompt,
                                inputImage: image,
                            };
                            await productService.saveVideoForUser(user.email, newVideo);
                        } catch (saveError) {
                            console.error("Failed to save video to catalogue:", saveError);
                            // Optionally, inform the user with a non-intrusive notification/toast
                        }
                    }
                };

                const objectUrl = URL.createObjectURL(videoBlob);
                setPlayableUrl(objectUrl);
            } catch (fetchErr) {
                console.error("Error fetching video data:", fetchErr);
                setError("Could not load the generated video for playback. You can still try to download it.");
            } finally {
                setIsFetchingVideo(false);
                setIsGenerating(false); // Generation process is fully complete
            }
        };

        fetchVideoData();
    }, [downloadUrl, user, prompt, image]);

    // Effect to clean up object URL
    useEffect(() => {
        return () => {
            if (playableUrl) {
                URL.revokeObjectURL(playableUrl);
            }
        };
    }, [playableUrl]);


    const startLoadingMessages = () => {
        let messageIndex = 0;
        setLoadingMessage(loadingMessages[messageIndex]);
        messageInterval.current = setInterval(() => {
            messageIndex = (messageIndex + 1) % loadingMessages.length;
            setLoadingMessage(loadingMessages[messageIndex]);
        }, 5000); // Change message every 5 seconds
    };
    
    const stopLoadingMessages = () => {
        if (messageInterval.current) {
            clearInterval(messageInterval.current);
            messageInterval.current = null;
        }
    };

    const handleGenerate = async () => {
        if (!prompt) {
            setError('Please provide a prompt for your video ad.');
            return;
        }
        setError(null);
        setIsGenerating(true);
        startLoadingMessages();

        try {
            let operation = await generateVideoAd(prompt, image ?? undefined);

            pollingInterval.current = setInterval(async () => {
                try {
                    operation = await checkVideoOperationStatus(operation);

                    if (operation.done) {
                        if (pollingInterval.current) clearInterval(pollingInterval.current);
                        stopLoadingMessages();

                        const uri = operation.response?.generatedVideos?.[0]?.video?.uri;
                        if (uri) {
                             const finalUrl = getVideoUrl(uri);
                            setDownloadUrl(finalUrl); // This will trigger the useEffect to fetch the video
                        } else {
                            console.error("Video generation finished but no URI found:", operation.response);
                            setError("Video generation completed, but we couldn't retrieve the video. Please try again.");
                            setIsGenerating(false);
                        }
                    }
                } catch (pollErr) {
                    console.error("Error during polling:", pollErr);
                    const message = (pollErr instanceof Error) ? pollErr.message : String(pollErr);
                    if (message.includes('429') || message.toUpperCase().includes('RESOURCE_EXHAUSTED')) {
                        setError('Request limit exceeded while checking video status. Please wait and try again.');
                    } else {
                        setError("An error occurred while checking video status. Please try again.");
                    }
                    if (pollingInterval.current) clearInterval(pollingInterval.current);
                    stopLoadingMessages();
                    setIsGenerating(false);
                }
            }, 10000); // Poll every 10 seconds

        } catch (err) {
            console.error(err);
            const message = (err instanceof Error) ? err.message : String(err);
            if (message.includes('429') || message.toUpperCase().includes('RESOURCE_EXHAUSTED')) {
                setError('Request limit exceeded. Please wait and try again.');
            } else {
                setError('Failed to start video generation. Please try again.');
            }
            setIsGenerating(false);
            stopLoadingMessages();
        }
    };

    const handleStartNew = () => {
        setDownloadUrl(null);
        setPlayableUrl(null);
        setImage(null);
        setPrompt('');
        setError(null);
        uploaderKey.current += 1;
    };

    if (playableUrl && downloadUrl) {
        return (
            <div className="w-full bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-stone-200">
                <h2 className="text-3xl font-serif text-amber-900 mb-4 text-center">Your Video Ad is Ready!</h2>
                <div className="max-w-sm mx-auto">
                    <video
                        src={playableUrl}
                        controls
                        className="w-full rounded-lg shadow-md border border-stone-200"
                        aria-label="Generated video advertisement"
                    >
                        Your browser does not support the video tag.
                    </video>
                    <a
                        href={downloadUrl}
                        download="artisan-video-ad.mp4"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-6 w-full bg-amber-800 text-white px-6 py-3 rounded-md font-semibold text-lg hover:bg-amber-900 transition-colors duration-300 flex items-center justify-center shadow-md hover:shadow-lg"
                    >
                        Download Video
                    </a>
                    <button
                        onClick={handleStartNew}
                        className="mt-4 w-full bg-stone-200 text-stone-700 px-6 py-3 rounded-md font-semibold text-lg hover:bg-stone-300 transition-colors duration-300"
                    >
                        ＋ Create Another Video
                    </button>
                </div>
            </div>
        )
    }

    if (isGenerating || isFetchingVideo) {
        return (
            <div className="w-full bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-stone-200 text-center">
                <h2 className="text-3xl font-serif text-amber-900 mb-4">Crafting Your Video...</h2>
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                    <Spinner message={isFetchingVideo ? "Finalizing your video..." : loadingMessage} />
                    <p className="text-stone-500 max-w-md">
                        {isFetchingVideo 
                            ? "Just a moment while we prepare your video for playback."
                            : "Video generation can take several minutes. Feel free to keep this tab open and check back."
                        }
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-stone-200">
            <div className="max-w-2xl mx-auto flex flex-col space-y-6">
                 <div>
                    <h2 className="text-xl font-semibold text-stone-700 mb-2">Create a Vertical Video Ad</h2>
                    <p className="text-stone-600">Generate a short, eye-catching video for platforms like TikTok, Instagram Reels, and YouTube Shorts.</p>
                </div>
                <div>
                  <label className="text-lg font-semibold text-stone-700 mb-2 block">1. Upload a Product Image (Optional)</label>
                  <ImageUploader key={uploaderKey.current} onImageUpload={setImage} />
                  <p className="text-sm text-stone-500 mt-2">Providing an image helps the AI create a more relevant video for your product.</p>
                </div>
                 <div>
                  <label htmlFor="videoPrompt" className="text-lg font-semibold text-stone-700 mb-2 block">2. Describe Your Video</label>
                  <textarea
                    id="videoPrompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., A cinematic, 15-second video of my hand-carved wooden bowl. Show it on a rustic dining table with sunlight streaming in. The mood should be warm and inviting."
                    className="w-full p-3 border border-stone-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white text-black"
                    rows={5}
                    required
                  />
                </div>
                {error && (
                    <div className="text-center text-red-600 bg-red-50 p-4 rounded-md">
                      <p className="font-bold">An error occurred</p>
                      <p>{error}</p>
                    </div>
                )}
                <div className="pt-2">
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !prompt}
                    className="w-full bg-amber-800 text-white px-6 py-3 rounded-md font-semibold text-lg hover:bg-amber-900 transition-colors duration-300 disabled:bg-stone-400 disabled:cursor-not-allowed flex items-center justify-center shadow-md hover:shadow-lg disabled:shadow-none"
                  >
                    {isGenerating ? <Spinner message="Starting..." /> : '🎬 Generate Video Ad'}
                  </button>
                </div>
            </div>
        </div>
    );
};

export default VideoPage;