'use client';

import { useEffect, useRef, useState } from 'react';

interface BottomSheetProps {
  isOpen: boolean;
  height?: string;
  children: React.ReactNode;
  onClose?: () => void;
}

export function BottomSheet({ isOpen, height = '40%', children, onClose }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentHeight, setCurrentHeight] = useState(height);

  useEffect(() => {
    setCurrentHeight(height);
  }, [height]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    // Basic drag handling - can be enhanced
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  if (!isOpen) return null;

  return (
    <div
      ref={sheetRef}
      className="absolute bottom-0 left-0 right-0 bg-white bottom-sheet safe-area-bottom z-20 transition-all duration-300"
      style={{ height: currentHeight }}
    >
      {/* Drag Handle */}
      <div
        className="w-full flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
      </div>

      {/* Content */}
      <div className="h-full overflow-y-auto no-scrollbar pb-safe">
        {children}
      </div>
    </div>
  );
}
