import React, { useRef, useEffect, useId } from 'react';

// Let TypeScript know that Clappr is a global variable from the CDN script
declare const Clappr: any;

interface VideoPlayerProps {
  src: string;
  className?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, className }) => {
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const playerInstanceRef = useRef<any>(null);
  const retryTimeoutRef = useRef<number | null>(null);
  const uniquePlayerId = `clappr-player-${useId()}`;

  useEffect(() => {
    if (typeof Clappr === 'undefined' || !playerContainerRef.current) {
      console.error('Clappr script not loaded or container not found!');
      return;
    }

    const videoURL = src;

    if (!videoURL) {
      // If there's no source, destroy any existing player and do nothing.
      if (playerInstanceRef.current) {
        playerInstanceRef.current.destroy();
        playerInstanceRef.current = null;
      }
      return;
    }

    const retryStream = () => {
      if (retryTimeoutRef.current) return; // Retry already scheduled
      retryTimeoutRef.current = window.setTimeout(() => {
        retryTimeoutRef.current = null;
        if (playerInstanceRef.current) {
          playerInstanceRef.current.destroy();
        }
        startPlayer();
      }, 3000); // Reconnect after 3 seconds
    };

    const startPlayer = () => {
        if (!playerContainerRef.current || !videoURL) return;

        playerInstanceRef.current = new Clappr.Player({
            source: videoURL,
            parentId: `#${uniquePlayerId}`,
            autoPlay: true,
            mute: false,
            playback: {
                hlsUseNextLevel: true,
                hlsMinimumDvrSize: 60,
                hlsRecoverMediaError: true,
                hlsRecoverNetworkError: true,
            },
            height: '100%',
            width: '100%',
            events: {
                onError: (e: any) => {
                    console.warn("Clappr: Error detected, attempting to reconnect...", e);
                    retryStream();
                },
                onStall: () => {
                    console.warn("Clappr: Buffer stalled, attempting to reconnect...");
                    retryStream();
                },
            },
        });
    };

    // Destroy previous instance if it exists
    if (playerInstanceRef.current) {
        playerInstanceRef.current.destroy();
        playerInstanceRef.current = null;
    }
    if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
    }

    startPlayer();

    // Cleanup on component unmount or when src changes
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (playerInstanceRef.current) {
        playerInstanceRef.current.destroy();
        playerInstanceRef.current = null;
      }
    };
  }, [src, uniquePlayerId]);

  return (
    <div id={uniquePlayerId} ref={playerContainerRef} className={className || "w-full h-full bg-black"}></div>
  );
};

export default VideoPlayer;