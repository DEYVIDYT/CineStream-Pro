import React, { useState, useRef, useEffect, useCallback } from 'react';
import Hls from 'hls.js';
import { formatTime } from '../../utils/time';

// Ícones do player secundário
const PlayIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"></path>
    </svg>
);

const PauseIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path d="M5.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75A.75.75 0 007.25 3h-1.5zM12.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75a.75.75 0 00-.75-.75h-1.5z"></path>
    </svg>
);

const VolumeHighIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5 10v4h4L15 20V4L9 10H5z"></path>
    </svg>
);

const VolumeMediumIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072M5 10v4h4L15 20V4L9 10H5z"></path>
    </svg>
);

const VolumeMutedIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zM17 14l-4-4m0 4l4-4"></path>
    </svg>
);

const FullscreenIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 0h-4m4 0l-5-5"></path>
    </svg>
);

const ExitFullscreenIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 14h6v6M20 10h-6V4M14 4l6 6M10 20l-6-6" />
    </svg>
);

const SpinnerIcon = ({ className }: { className?: string }) => (
    <svg className={`animate-spin h-12 w-12 text-cyan-400 ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const PipIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M19 5h-6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z"/>
    </svg>
);

const Forward10Icon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14 12h-2.5a2 2 0 0 0 -2 2v1a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2v-3" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14 12v-3a2 2 0 0 0 -2 -2h-2.5" />
  </svg>
);

const Backward10Icon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5l-7 7 7 7" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 12h2.5a2 2 0 0 1 2 2v1a2 2 0 0 1 -2 2h0a2 2 0 0 1 -2 -2v-3" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 12v-3a2 2 0 0 1 2 -2h2.5" />
  </svg>
);

interface SecondaryVideoPlayerProps {
  src: string;
  className?: string;
}

const SecondaryVideoPlayer: React.FC<SecondaryVideoPlayerProps> = ({ src, className }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<number | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const volumeIndicatorTimeoutRef = useRef<number | null>(null);
  const skipIndicatorTimeoutRef = useRef<number | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [areControlsVisible, setAreControlsVisible] = useState(true);
  
  const [showVolumeIndicator, setShowVolumeIndicator] = useState(false);
  const [skipIndicator, setSkipIndicator] = useState<'forward' | 'backward' | null>(null);

  const [isPipActive, setIsPipActive] = useState(false);
  const [isPipSupported, setIsPipSupported] = useState(false);

  const [isLive, setIsLive] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);

  useEffect(() => {
    setIsPipSupported(!!document.pictureInPictureEnabled);

    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        maxMaxBufferLength: 60,
        maxBufferSize: 120 * 1000 * 1000,
        maxBufferLength: 45,
        manifestLoadingMaxRetry: 4,
        manifestLoadingRetryDelay: 500,
        levelLoadingMaxRetry: 4,
        levelLoadingRetryDelay: 500,
        fragLoadingMaxRetry: 6,
        fragLoadingRetryDelay: 500,
      });
      hlsRef.current = hls;

      hls.loadSource(src);
      hls.attachMedia(videoElement);
      
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          console.error('HLS fatal error:', data);
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log('fatal network error encountered, trying to recover');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log('fatal media error encountered, trying to recover');
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              break;
          }
        }
      });
    } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
      videoElement.src = src;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [src]);
  
  const hideControls = useCallback(() => {
    if (!isPlaying || isPipActive) return;
    setAreControlsVisible(false);
  }, [isPlaying, isPipActive]);

  const resetControlsTimeout = useCallback(() => {
    setAreControlsVisible(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = window.setTimeout(hideControls, 3000);
  }, [hideControls]);

  useEffect(() => {
    const container = containerRef.current;
    if (isPlaying) {
      resetControlsTimeout();
    } else {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      setAreControlsVisible(true);
    }
    
    container?.addEventListener('mousemove', resetControlsTimeout);
    container?.addEventListener('mouseleave', hideControls);

    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      container?.removeEventListener('mousemove', resetControlsTimeout);
      container?.removeEventListener('mouseleave', hideControls);
    };
  }, [isPlaying, resetControlsTimeout, hideControls]);

  const handleTimeUpdate = () => {
      if (videoRef.current && !isSeeking) {
          setCurrentTime(videoRef.current.currentTime);
      }
  };
  const handleLoadedMetadata = () => {
      if (videoRef.current) {
        const videoDuration = videoRef.current.duration;
        if (videoDuration === Infinity) {
          setIsLive(true);
          setDuration(0);
        } else {
          setIsLive(false);
          setDuration(videoDuration);
        }
      }
  };
  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);
  const handleWaiting = () => setIsBuffering(true);
  const handlePlaying = () => setIsBuffering(false);
  const handleVolumeChange = () => {
      if (videoRef.current) {
          setVolume(videoRef.current.volume);
          setIsMuted(videoRef.current.muted);
      }
  };
  const handleEnterPip = () => setIsPipActive(true);
  const handleLeavePip = () => setIsPipActive(false);

  useEffect(() => {
      const video = videoRef.current;
      if (!video) return;
      const events = { timeupdate: handleTimeUpdate, loadedmetadata: handleLoadedMetadata, play: handlePlay, pause: handlePause, waiting: handleWaiting, playing: handlePlaying, volumechange: handleVolumeChange };
      Object.entries(events).forEach(([event, handler]) => video.addEventListener(event, handler));

      video.addEventListener('enterpictureinpicture', handleEnterPip);
      video.addEventListener('leavepictureinpicture', handleLeavePip);
      
      return () => {
        Object.entries(events).forEach(([event, handler]) => video.removeEventListener(event, handler));
        video.removeEventListener('enterpictureinpicture', handleEnterPip);
        video.removeEventListener('leavepictureinpicture', handleLeavePip);
      };
  }, [isSeeking]);

  const togglePlay = useCallback(() => videoRef.current?.paused ? videoRef.current?.play() : videoRef.current?.pause(), []);
  const toggleMute = useCallback(() => {
    if (videoRef.current) videoRef.current.muted = !videoRef.current.muted;
  }, []);

  const handleVolumeChangeWithIndicator = (newVolume: number) => {
      if (videoRef.current) {
          videoRef.current.volume = newVolume;
          videoRef.current.muted = newVolume === 0;
          setShowVolumeIndicator(true);
          if (volumeIndicatorTimeoutRef.current) clearTimeout(volumeIndicatorTimeoutRef.current);
          volumeIndicatorTimeoutRef.current = window.setTimeout(() => setShowVolumeIndicator(false), 1500);
      }
  };

  const handleVolumeSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleVolumeChangeWithIndicator(parseFloat(e.target.value));
  };
  
  const handleSeekStart = useCallback((e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
      if (isLive || isNaN(duration) || !progressBarRef.current || !videoRef.current) return;
      
      setIsSeeking(true);
      
      const progressBar = progressBarRef.current;
      const rect = progressBar.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const percent = Math.min(Math.max(0, (clientX - rect.left) / progressBar.clientWidth), 1);
      
      const newTime = percent * duration;
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
  }, [isLive, duration]);

  const handleSeekMove = useCallback((e: MouseEvent | TouchEvent) => {
      if (!isSeeking || !progressBarRef.current || !videoRef.current || isNaN(duration)) return;
      e.preventDefault();

      const progressBar = progressBarRef.current;
      const rect = progressBar.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const percent = Math.min(Math.max(0, (clientX - rect.left) / progressBar.clientWidth), 1);
      
      const newTime = percent * duration;
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime); 

  }, [isSeeking, duration]);

  const handleSeekEnd = useCallback(() => {
      setIsSeeking(false);
  }, []);

  useEffect(() => {
      if (isSeeking) {
          document.addEventListener('mousemove', handleSeekMove);
          document.addEventListener('touchmove', handleSeekMove, { passive: false });
          document.addEventListener('mouseup', handleSeekEnd);
          document.addEventListener('touchend', handleSeekEnd);
      }
      return () => {
          document.removeEventListener('mousemove', handleSeekMove);
          document.removeEventListener('touchmove', handleSeekMove);
          document.removeEventListener('mouseup', handleSeekEnd);
          document.removeEventListener('touchend', handleSeekEnd);
      };
  }, [isSeeking, handleSeekMove, handleSeekEnd]);

  const toggleFullscreen = useCallback(() => {
      if (!document.fullscreenElement) containerRef.current?.requestFullscreen();
      else document.exitFullscreen();
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const togglePip = useCallback(async () => {
    if (!videoRef.current) return;
    try {
        if (isPipActive) {
            await document.exitPictureInPicture();
        } else {
            await videoRef.current.requestPictureInPicture();
        }
    } catch (error) {
        console.error("Erro ao alternar o modo PiP:", error);
    }
  }, [isPipActive]);
  
  const handleDoubleClick = useCallback((side: 'left' | 'right') => {
    if (isLive || !videoRef.current) return;
    const newTime = videoRef.current.currentTime + (side === 'left' ? -10 : 10);
    videoRef.current.currentTime = Math.max(0, Math.min(duration, newTime));
    
    setSkipIndicator(side === 'right' ? 'forward' : 'backward');
    if (skipIndicatorTimeoutRef.current) clearTimeout(skipIndicatorTimeoutRef.current);
    skipIndicatorTimeoutRef.current = window.setTimeout(() => setSkipIndicator(null), 700);
  }, [duration, isLive]);

  const VolumeIcon = isMuted || volume === 0 ? VolumeMutedIcon : volume < 0.5 ? VolumeMediumIcon : VolumeHighIcon;

  return (
    <div ref={containerRef} className={`relative w-full aspect-video bg-black rounded-lg overflow-hidden shadow-2xl shadow-cyan-500/10 group/container ${className || "w-full h-full"}`}>
      {!isLive && (
        <>
          <div className="absolute top-0 left-0 w-1/2 h-full z-10" onDoubleClick={() => handleDoubleClick('left')}></div>
          <div className="absolute top-0 right-0 w-1/2 h-full z-10" onDoubleClick={() => handleDoubleClick('right')}></div>
        </>
      )}
      
      <video ref={videoRef} className="w-full h-full" onClick={togglePlay} playsInline />
      
      {isPipActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 pointer-events-none z-20">
              <div className="bg-black/70 backdrop-blur-sm p-4 rounded-lg text-white text-lg font-semibold flex items-center gap-3">
                   <PipIcon className="w-6 h-6" />
                   <span>Reproduzindo em Picture-in-Picture</span>
               </div>
          </div>
      )}

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
        {isBuffering && !isPipActive && <SpinnerIcon />}

        {!isPlaying && !isBuffering && !isPipActive && (
            <button onClick={togglePlay} className="p-4 bg-cyan-500/70 rounded-full hover:bg-cyan-500/90 transition-all duration-300 scale-125 hover:scale-150 pointer-events-auto" aria-label="Play">
                <PlayIcon className="w-10 h-10 text-white" />
            </button>
        )}
        
        {skipIndicator && (
          <div className="absolute flex items-center justify-center w-24 h-24 bg-black/50 rounded-full transition-opacity duration-200 opacity-100">
            {skipIndicator === 'forward' ? <Forward10Icon className="w-12 h-12 text-white" /> : <Backward10Icon className="w-12 h-12 text-white" />}
          </div>
        )}

        {showVolumeIndicator && (
          <div className="absolute w-28 h-12 bg-black/50 rounded-md flex items-center justify-center gap-2 transition-opacity duration-200 opacity-100">
              <VolumeIcon className="w-6 h-6 text-white"/>
              <div className="w-16 h-1.5 bg-white/30 rounded-full"><div className="h-full bg-cyan-400 rounded-full" style={{width: `${(isMuted ? 0 : volume) * 100}%`}}></div></div>
          </div>
        )}
      </div>

      <div className={`absolute bottom-0 left-0 right-0 z-30 transition-all duration-300 ${areControlsVisible && !isPipActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'}`}>
        <div className="absolute bottom-0 w-full h-24 bg-gradient-to-t from-black/80 to-transparent pointer-events-none"></div>

        <div className="relative p-4 flex flex-col gap-2">
            {!isLive && (
              <div 
                  ref={progressBarRef}
                  className="w-full h-1.5 bg-white/20 cursor-pointer group/progress"
                  onMouseDown={handleSeekStart}
                  onTouchStart={handleSeekStart}
              >
                  <div className="h-full bg-cyan-400 relative transition-all duration-100 group-hover/progress:h-2" style={{ width: `${(currentTime / duration) * 100}%` }}>
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-4 bg-cyan-400 rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity"></div>
                  </div>
              </div>
            )}
            
            <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-4">
                    <button onClick={togglePlay} title={isPlaying ? 'Pausar' : 'Play'} className="hover:text-cyan-400 transition-colors">
                        {isPlaying ? <PauseIcon className="w-7 h-7" /> : <PlayIcon className="w-7 h-7" />}
                    </button>
                    <div className="flex items-center gap-2 group/volume">
                        <button onClick={toggleMute} title={isMuted ? 'Ativar som' : 'Mudo'} className="hover:text-cyan-400 transition-colors">
                            <VolumeIcon className="w-7 h-7" />
                        </button>
                        <input type="range" min="0" max="1" step="0.05" value={isMuted ? 0 : volume} onChange={handleVolumeSliderChange} title="Volume"
                            className="w-0 group-hover/volume:w-24 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer transition-all duration-300 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-cyan-400 [&::-webkit-slider-thumb]:rounded-full"/>
                    </div>
                    {isLive ? (
                      <div className="flex items-center gap-2 ml-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium uppercase tracking-wider">Live</span>
                      </div>
                    ) : (
                      <span className="text-sm font-mono">{formatTime(currentTime)} / {formatTime(duration)}</span>
                    )}
                </div>
                <div className="flex items-center gap-4">
                    {isPipSupported && (
                         <button onClick={togglePip} title={isPipActive ? "Sair do Picture-in-Picture" : "Picture-in-Picture"} className="hover:text-cyan-400 transition-colors">
                            <PipIcon className="w-6 h-6" />
                        </button>
                    )}
                    <button onClick={toggleFullscreen} title={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'} className="hover:text-cyan-400 transition-colors">
                        {isFullscreen ? <ExitFullscreenIcon className="w-7 h-7" /> : <FullscreenIcon className="w-7 h-7" />}
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SecondaryVideoPlayer;

