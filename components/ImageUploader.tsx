
import React, { useState, useCallback } from 'react';
import type { ImageState } from '../types';

interface ImageUploaderProps {
  onImageUpload: (image: ImageState | null) => void;
}

const fileToImageState = (file: File): Promise<ImageState> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const result = event.target?.result as string;
            if (result) {
                const base64 = result.split(',')[1];
                resolve({
                    base64,
                    mimeType: file.type,
                    previewUrl: result
                });
            } else {
                reject(new Error("Failed to read file."));
            }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
};


const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = useCallback(async (files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        try {
            const imageState = await fileToImageState(file);
            setPreview(imageState.previewUrl);
            onImageUpload(imageState);
        } catch (error) {
            console.error("Error processing file:", error);
            onImageUpload(null);
            setPreview(null);
        }
      }
    }
  }, [onImageUpload]);

  const onDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files);
  }, [handleFileChange]);

  return (
    <div
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={`relative border-2 border-dashed border-stone-400 rounded-lg p-4 text-center cursor-pointer transition-all duration-300 ${isDragging ? 'bg-amber-100 border-amber-500' : 'bg-stone-50 hover:bg-stone-100'}`}
    >
      <input
        type="file"
        accept="image/*"
        onChange={(e) => handleFileChange(e.target.files)}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      {preview ? (
        <img src={preview} alt="Product preview" className="mx-auto h-40 w-auto object-contain rounded-md" />
      ) : (
        <div className="flex flex-col items-center justify-center space-y-2 text-stone-500 py-10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="font-semibold">Drag & drop an image here</p>
          <p className="text-sm">or click to select a file</p>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
