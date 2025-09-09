import type { GenerationResult, VideoResult } from '../types';

const PRODUCTS_KEY = 'artisan_products';
const VIDEOS_KEY = 'artisan_videos';
const MAX_PRODUCTS_TO_STORE = 4;
const MAX_VIDEOS_TO_STORE = 1;

// The structure in localStorage will be:
// {
//   "user.email@example.com": [GenerationResult, GenerationResult, ...],
//   "another.user@example.com": [...]
// }
type ProductDatabase = Record<string, GenerationResult[]>;
type VideoDatabase = Record<string, VideoResult[]>;


const getProducts = (): ProductDatabase => {
    const products = localStorage.getItem(PRODUCTS_KEY);
    if (!products) {
        return {};
    }
    try {
        return JSON.parse(products);
    } catch (e) {
        console.error("Failed to parse products from localStorage, clearing data.", e);
        localStorage.removeItem(PRODUCTS_KEY);
        return {};
    }
};

const saveProducts = (products: ProductDatabase) => {
    try {
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
    } catch (e) {
        console.error("Error saving products to localStorage:", e);
        throw new Error("Could not save products. Storage might be full.");
    }
};

const getVideos = (): VideoDatabase => {
    const videos = localStorage.getItem(VIDEOS_KEY);
    if (!videos) {
        return {};
    }
    try {
        return JSON.parse(videos);
    } catch (e) {
        console.error("Failed to parse videos from localStorage, clearing data.", e);
        localStorage.removeItem(VIDEOS_KEY);
        return {};
    }
};

const saveVideos = (videos: VideoDatabase) => {
    try {
        localStorage.setItem(VIDEOS_KEY, JSON.stringify(videos));
    } catch (e) {
        console.error("Error saving videos to localStorage:", e);
        throw new Error("Could not save videos. Storage might be full.");
    }
};

export const productService = {
    async getProductsForUser(userEmail: string): Promise<GenerationResult[]> {
        return new Promise((resolve) => {
            // Simulate async fetch
            setTimeout(() => {
                const allProducts = getProducts();
                resolve(allProducts[userEmail] || []);
            }, 300); 
        });
    },

    async saveProductForUser(userEmail: string, product: GenerationResult): Promise<void> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    const allProducts = getProducts();
                    const userProducts = allProducts[userEmail] || [];
                    // Add the new product to the beginning of the list
                    userProducts.unshift(product);
                    // If the list is too long, remove the oldest item (from the end)
                    if (userProducts.length > MAX_PRODUCTS_TO_STORE) {
                        userProducts.pop();
                    }
                    allProducts[userEmail] = userProducts;
                    saveProducts(allProducts);
                    resolve();
                } catch (error) {
                    reject(error);
                }
            }, 300);
        });
    },

    async getVideosForUser(userEmail: string): Promise<VideoResult[]> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const allVideos = getVideos();
                resolve(allVideos[userEmail] || []);
            }, 300);
        });
    },

    async saveVideoForUser(userEmail: string, video: VideoResult): Promise<void> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    const allVideos = getVideos();
                    const userVideos = allVideos[userEmail] || [];
                    userVideos.unshift(video);
                     // If the list is too long, remove the oldest item (from the end)
                    if (userVideos.length > MAX_VIDEOS_TO_STORE) {
                        userVideos.pop();
                    }
                    allVideos[userEmail] = userVideos;
                    saveVideos(allVideos);
                    resolve();
                } catch (error) {
                    reject(error);
                }
            }, 300);
        });
    },
};