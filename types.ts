export interface ImageState {
  base64: string;
  mimeType: string;
  previewUrl: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  bio?: string;
}

export interface GenerationInputs {
  image: ImageState;
  productDescription: string;
  targetAudience: string;
  platform: string;
  aesthetic: string;
  shouldGenerateImages: boolean;
}

export interface GenerationResult {
  story: string;
  images: string[];
  inputs: GenerationInputs;
  createdAt: number;
}

export interface VideoResult {
  id: string;
  createdAt: number;
  videoDataUrl: string;
  prompt: string;
  inputImage?: ImageState | null;
}
