// FIX: Imported `GenerateVideosResponse` to use as the type argument for the generic `Operation` type.
import { GoogleGenAI, Modality, Operation, GenerateVideosResponse } from "@google/genai";
import type { ImageState } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const storyModel = 'gemini-2.5-flash';
const imageEditModel = 'gemini-2.5-flash-image-preview';
const videoModel = 'veo-2.0-generate-001';

export async function generateProductStory(
    image: ImageState,
    productDescription: string,
    targetAudience: string,
    platform: string,
    artisanName: string,
    artisanBio: string
): Promise<string> {
    let artisanInfo = '';
    if (artisanName || artisanBio) {
        artisanInfo = `\nHere is some information about the artisan to help inform the tone and voice of the story:`;
        if (artisanName) {
            artisanInfo += `\n- Artisan Name/Brand: '${artisanName}'`;
        }
        if (artisanBio) {
            artisanInfo += `\n- About the Artisan: '${artisanBio}'`;
        }
    }

    const prompt = `You are an expert storyteller for artisanal products. An artisan has provided an image of their product and some details. Your task is to write a short, captivating story about this product.

The story and hashtags MUST be tailored for the '${platform}' platform.
- For Instagram/TikTok: Use a more visual, engaging, and slightly informal tone. Emojis are great. Keep it concise.
- For Facebook: A slightly longer, more community-focused story can work well.
- For Pinterest: Focus on aesthetic, DIY, and inspirational aspects. The description should be keyword-rich.
- For Etsy: Focus on the craftsmanship, materials, and the unique story of the item for a marketplace audience.
- For General / Blog: A more traditional, slightly longer narrative format is appropriate.

The story should be about 150 words, evoke emotion, and highlight the craftsmanship. Make it sound authentic and personal, as if the artisan themself is speaking.${artisanInfo}

Here are the product details:
- Product Details: '${productDescription}'
- Target Audience: '${targetAudience}'

After the story, on two new lines, provide 5-7 relevant social media hashtags specifically optimized for '${platform}'. The hashtags should be space-separated and each must start with #. For example:

#Handmade #ArtisanCraft #SupportSmallBusiness`;
  
    const imagePart = {
        inlineData: {
            mimeType: image.mimeType,
            data: image.base64,
        },
    };

    const textPart = {
        text: prompt,
    };

    try {
        const response = await ai.models.generateContent({
            model: storyModel,
            contents: [{ parts: [imagePart, textPart] }],
        });

        const story = response.text;
        if (!story) {
            throw new Error("Received an empty story from the API.");
        }
        return story.trim();

    } catch (error) {
        console.error("Error calling Gemini API for story generation:", error);
        throw new Error("Failed to generate story from Gemini API.");
    }
}

async function generateSingleProfessionalImage(image: ImageState, prompt: string): Promise<string> {
    const imagePart = {
        inlineData: {
            data: image.base64,
            mimeType: image.mimeType,
        },
    };
    const textPart = { text: prompt };

    const response = await ai.models.generateContent({
        model: imageEditModel,
        contents: [{ parts: [imagePart, textPart] }],
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
    }
    throw new Error("No image was generated.");
}

export async function generateProfessionalImages(image: ImageState, productDescription: string, targetAudience: string, aesthetic: string): Promise<string[]> {
    const basePrompt = `Using the provided image of a product described as '${productDescription}', transform it into a professional product photograph that would appeal to '${targetAudience}'.`;
    
    const prompts: string[] = [
        `${basePrompt} The specific style requested is: '${aesthetic}'.`,
        `${basePrompt} The specific style requested is: '${aesthetic}'. Capture it from a slightly different angle.`,
        `${basePrompt} The specific style requested is: '${aesthetic}'. Use alternate, dramatic lighting.`
    ];

    try {
        // Create an array of promises for each image generation call.
        const imageGenerationPromises = prompts.map(prompt => 
            generateSingleProfessionalImage(image, prompt)
        );

        // Await all promises to resolve in parallel.
        const generatedImages = await Promise.all(imageGenerationPromises);
        return generatedImages;

    } catch (error) {
        console.error("Error calling Gemini API for image generation:", error);
        throw new Error("Failed to generate images from Gemini API.");
    }
}

export async function translateText(text: string, targetLanguage: string): Promise<string> {
    const prompt = `Translate the following text into ${targetLanguage}.
It is a product story for an artisanal good. It's crucial to preserve the original tone, meaning, and captivating, personal style.
IMPORTANT: You MUST NOT translate any hashtags (words starting with #). The hashtags must be preserved exactly as they are in the original text.
Do not add any extra commentary, just provide the translation.

Text to translate:
---
${text}
---
`;

    try {
        const response = await ai.models.generateContent({
            model: storyModel,
            contents: prompt,
        });

        const translated = response.text;
        if (!translated) {
            throw new Error("Received an empty translation from the API.");
        }
        return translated.trim();
    } catch (error) {
        console.error(`Error calling Gemini API for translation to ${targetLanguage}:`, error);
        throw new Error(`Failed to translate text to ${targetLanguage}.`);
    }
}

export async function generateVideoAd(
    prompt: string,
    image?: ImageState
): Promise<Operation<GenerateVideosResponse>> {
    const fullPrompt = `Create a short, engaging vertical format (9:16 aspect ratio) video ad suitable for social media like Instagram Reels, TikTok, or YouTube Shorts. The video should be visually appealing and grab attention within the first 3 seconds. Here is the creative brief: "${prompt}"`;

    let operation;
    if (image) {
        operation = await ai.models.generateVideos({
            model: videoModel,
            prompt: fullPrompt,
            image: {
                imageBytes: image.base64,
                mimeType: image.mimeType,
            },
            config: {
                numberOfVideos: 1
            }
        });
    } else {
        operation = await ai.models.generateVideos({
            model: videoModel,
            prompt: fullPrompt,
            config: {
                numberOfVideos: 1
            }
        });
    }
    return operation;
}

// FIX: The generic `Operation` type requires a type argument. `GenerateVideosResponse` is used for video operations.
export async function checkVideoOperationStatus(operation: Operation<GenerateVideosResponse>): Promise<Operation<GenerateVideosResponse>> {
    const updatedOperation = await ai.operations.getVideosOperation({ operation: operation });
    return updatedOperation;
}

export function getVideoUrl(uri: string): string {
    if (!process.env.API_KEY) {
        console.warn("API_KEY is not set. Video download might fail.");
        return uri;
    }
    return `${uri}&key=${process.env.API_KEY}`;
}