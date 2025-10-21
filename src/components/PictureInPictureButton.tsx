"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Monitor, Minimize2 } from 'lucide-react';

interface PictureInPictureButtonProps {
  videoElement: HTMLVideoElement | null;
  className?: string;
}

export const PictureInPictureButton: React.FC<PictureInPictureButtonProps> = ({ 
  videoElement, 
  className = "" 
}) => {
  const [isPiPActive, setIsPiPActive] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Check if Picture-in-Picture is supported
    setIsSupported('pictureInPictureEnabled' in document);
  }, []);

  const togglePiP = async () => {
    if (!videoElement || !isSupported) return;

    try {
      if (document.pictureInPictureElement) {
        // Exit PiP
        await document.exitPictureInPicture();
        setIsPiPActive(false);
      } else {
        // Enter PiP
        await videoElement.requestPictureInPicture();
        setIsPiPActive(true);
      }
    } catch (error) {
      console.error('Error toggling Picture-in-Picture:', error);
    }
  };

  // Update state when PiP state changes externally
  useEffect(() => {
    const handlePiPChange = () => {
      setIsPiPActive(!!document.pictureInPictureElement);
    };

    document.addEventListener('pictureinpicturechange', handlePiPChange);
    return () => document.removeEventListener('pictureinpicturechange', handlePiPChange);
  }, []);

  if (!isSupported) {
    return null;
  }

  return (
    <button
      onClick={togglePiP}
      className={`
        relative p-2 rounded-full transition-all duration-200
        ${isHovered ? 'bg-primary/20' : 'bg-transparent'}
        ${isPiPActive ? 'text-primary' : 'text-muted-foreground hover:text-primary'}
        ${className}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={isPiPActive ? "Sair do modo Picture-in-Picture" : "Ativar Picture-in-Picture"}
      aria-label={isPiPActive ? "Sair do modo Picture-in-Picture" : "Ativar Picture-in-Picture"}
    >
      {isPiPActive ? (
        <Minimize2 className="h-5 w-5" />
      ) : (
        <Monitor className="h-5 w-5" />
      )}
      <span className="sr-only">
        {isPiPActive ? "Sair do modo Picture-in-Picture" : "Ativar Picture-in-Picture"}
      </span>
    </button>
  );
};