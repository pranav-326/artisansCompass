import React, { useState } from 'react';

interface ImageCarouselProps {
  images: string[];
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return null;
  }

  const goToPrevious = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? images.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    const isLastSlide = currentIndex === images.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  const goToSlide = (slideIndex: number) => {
    setCurrentIndex(slideIndex);
  };

  return (
    <div className="relative w-full h-64 sm:h-80 rounded-lg overflow-hidden shadow-inner bg-stone-200">
      <div
        className="w-full h-full bg-center bg-contain bg-no-repeat duration-500"
        style={{ backgroundImage: `url(${images[currentIndex]})` }}
        aria-label={`Showcase image ${currentIndex + 1} of ${images.length}`}
        role="img"
      ></div>

      <button
        onClick={goToPrevious}
        className="absolute top-1/2 left-2 transform -translate-y-1/2 cursor-pointer bg-black/30 hover:bg-black/50 p-2 rounded-full text-white focus:outline-none focus:ring-2 focus:ring-white"
        aria-label="Previous image"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={goToNext}
        className="absolute top-1/2 right-2 transform -translate-y-1/2 cursor-pointer bg-black/30 hover:bg-black/50 p-2 rounded-full text-white focus:outline-none focus:ring-2 focus:ring-white"
        aria-label="Next image"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2" role="group" aria-label="Image indicators">
        {images.map((_, slideIndex) => (
          <button
            key={slideIndex}
            onClick={() => goToSlide(slideIndex)}
            className={`cursor-pointer h-3 w-3 rounded-full transition-colors ${
              currentIndex === slideIndex ? 'bg-white' : 'bg-white/50'
            }`}
            aria-label={`Go to image ${slideIndex + 1}`}
            aria-current={currentIndex === slideIndex}
          ></button>
        ))}
      </div>
    </div>
  );
};

export default ImageCarousel;
