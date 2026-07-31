import React, { useState, useEffect } from 'react';

interface ServiceImageSliderProps {
  images: string[];
  alt: string;
}

export const ServiceImageSlider: React.FC<ServiceImageSliderProps> = ({ images, alt }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [images.length]);

  if (!images || images.length === 0) return null;

  return (
    <>
      {images.map((src, index) => (
        <img 
          key={src}
          src={src} 
          alt={`${alt} ${index + 1}`} 
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out ${
            index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
          }`}
          referrerPolicy="no-referrer"
        />
      ))}
      {images.length > 1 && (
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-10">
          {images.map((_, i) => (
            <button 
              key={i} 
              onClick={(e) => {
                e.stopPropagation();
                setCurrentSlide(i);
              }}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                i === currentSlide ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Ir a la imagen ${i + 1}`}
            />
          ))}
        </div>
      )}
    </>
  );
};
