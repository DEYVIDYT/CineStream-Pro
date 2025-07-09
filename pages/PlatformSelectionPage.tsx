import React from 'react';
import { useFocusable } from '../components/tv/FocusManager';

const TvIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="15" x="2" y="7" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/></svg>;
const SmartphoneIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>;

interface PlatformSelectionPageProps {
    onSelectPlatform: (platform: 'mobile' | 'tv') => void;
}

const PlatformSelectionPage: React.FC<PlatformSelectionPageProps> = ({ onSelectPlatform }) => {
  
  const handleSelect = (platform: 'mobile' | 'tv') => {
    localStorage.setItem('platform_preference', platform);
    onSelectPlatform(platform);
  };
  
  const { ref: mobileRef, isFocused: isMobileFocused } = useFocusable<HTMLButtonElement>({
    onEnterPress: () => handleSelect('mobile')
  });

  const { ref: tvRef, isFocused: isTvFocused } = useFocusable<HTMLButtonElement>({
    onEnterPress: () => handleSelect('tv')
  });

  const buttonClasses = "flex flex-col items-center justify-center gap-4 p-8 bg-surface rounded-2xl w-48 h-48 text-on-surface-variant hover:bg-white/10 hover:text-on-surface focus:outline-none transition-all duration-300 transform";

  return (
    <div className="bg-background w-screen h-screen flex flex-col items-center justify-center text-on-surface p-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-12 text-center">Onde você está assistindo?</h1>
      <div className="flex flex-col md:flex-row gap-8">
        <button
          ref={mobileRef}
          tabIndex={-1}
          onClick={() => handleSelect('mobile')}
          className={`${buttonClasses} ${isMobileFocused ? 'focused' : ''}`}
        >
          <SmartphoneIcon className="w-16 h-16" />
          <span className="text-xl font-semibold">Celular</span>
        </button>
        <button
          ref={tvRef}
          tabIndex={-1}
          onClick={() => handleSelect('tv')}
          className={`${buttonClasses} ${isTvFocused ? 'focused' : ''}`}
        >
          <TvIcon className="w-16 h-16" />
          <span className="text-xl font-semibold">Televisão</span>
        </button>
      </div>
       <p className="absolute bottom-6 text-sm text-on-surface-variant">Sua preferência será salva.</p>
    </div>
  );
};

export default PlatformSelectionPage;