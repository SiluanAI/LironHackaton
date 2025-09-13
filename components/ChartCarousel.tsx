import React, { useState, useRef } from 'react';
import { ProcessedConsumptionData } from '../types';
import UsageChart from './UsageChart';

interface ChartCarouselProps {
  data: ProcessedConsumptionData[];
}

const ChartCarousel: React.FC<ChartCarouselProps> = ({ data }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.targetTouches[0].clientX;
    touchEndXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartXRef.current || !touchEndXRef.current) return;
    const distance = touchStartXRef.current - touchEndXRef.current;

    if (distance > minSwipeDistance) {
      // Swipe left
      setActiveIndex(prev => Math.min(prev + 1, slides.length - 1));
    } else if (distance < -minSwipeDistance) {
      // Swipe right
      setActiveIndex(prev => Math.max(prev - 1, 0));
    }
    
    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };
  
  const midPoint = Math.ceil(data.length / 2);
  const firstHalfData = data.slice(0, midPoint);
  const secondHalfData = data.slice(midPoint);
  
  const slides = [
      { data: firstHalfData, label: "First Half (00:00 - 11:00)" },
      { data: secondHalfData, label: "Second Half (12:00 - 23:00)" }
  ].filter(slide => slide.data.length > 0);

  if (slides.length === 0) {
      return (
        <div className="mt-6 mb-12 max-w-6xl mx-auto">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 aspect-video md:aspect-[2/1] flex items-center justify-center">
              <p className="text-slate-500">No consumption data to display for this period.</p>
          </div>
        </div>
      );
  }
  
  const currentIndex = Math.min(activeIndex, slides.length - 1);

  return (
    <div className="mt-6 mb-12 max-w-6xl mx-auto">
      <div 
        className="overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className="flex transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <div key={index} className="flex-shrink-0 w-full">
              <UsageChart 
                data={slide.data} 
                xAxisDataKey="time"
                lineDataKey="usageKWh"
                showArea={true}
              />
            </div>
          ))}
        </div>
      </div>
      
      <div className="text-center text-sm text-slate-500 font-medium mt-4">
        {slides[currentIndex]?.label || ''}
      </div>

      {slides.length > 1 && (
        <div className="w-full flex justify-center items-center space-x-3 mt-3">
            {slides.map((_, index) => (
            <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${
                  currentIndex === index ? 'bg-blue-600' : 'bg-slate-300 hover:bg-slate-400'
                }`}
                aria-label={`Go to chart for ${slides[index].label}`}
            ></button>
            ))}
        </div>
      )}
    </div>
  );
};

export default ChartCarousel;