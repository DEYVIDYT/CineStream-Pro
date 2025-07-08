import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useApi } from '../services/ApiContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import VideoPlayer from '../components/common/VideoPlayer';
import { useFocusable } from '../components/tv/FocusManager';

const FocusableBackButton: React.FC = () => {
    const navigate = useNavigate();
    const { ref, isFocused } = useFocusable<HTMLButtonElement>({ onEnterPress: () => navigate(-1) });
    return (
        <button
            ref={ref}
            onClick={() => navigate(-1)}
            tabIndex={-1}
            className={`absolute top-4 left-4 z-50 text-white bg-black/50 p-2 rounded-full transition-opacity duration-300 ${isFocused ? 'focused' : ''}`}
            aria-label="Go back"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        </button>
    );
};

const PlayerPage: React.FC = () => {
    const { type, id } = useParams<{ type: 'live' | 'movie' | 'series', id: string }>();
    const { credentials } = useApi();
    const location = useLocation();
    const navigate = useNavigate();
    const searchParams = new URLSearchParams(location.search);
    const episodeId = searchParams.get('ep'); // for series

    const [isControlsVisible, setIsControlsVisible] = useState(true);
    const visibilityTimeoutRef = useRef<number | null>(null);

    const showControls = useCallback(() => {
        setIsControlsVisible(true);
        if (visibilityTimeoutRef.current) {
            clearTimeout(visibilityTimeoutRef.current);
        }
        visibilityTimeoutRef.current = window.setTimeout(() => {
            setIsControlsVisible(false);
        }, 3000); // Hide after 3 seconds
    }, []);

    useEffect(() => {
        showControls(); // Show on mount
        window.addEventListener('keydown', showControls, true);
        window.addEventListener('mousemove', showControls, true);

        return () => {
            if (visibilityTimeoutRef.current) clearTimeout(visibilityTimeoutRef.current);
            window.removeEventListener('keydown', showControls, true);
            window.removeEventListener('mousemove', showControls, true);
        };
    }, [showControls]);


    if (!credentials) {
        return (
            <div className="w-full h-full bg-black flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    if (type === 'series' && !episodeId) {
        return (
            <div className="w-screen h-screen bg-black flex flex-col items-center justify-center text-on-surface">
                <h2 className="text-xl mb-4">No episode selected.</h2>
                <p className="text-on-surface-variant mb-6">Please select an episode from the details page.</p>
                <button
                    onClick={() => navigate(-1)}
                    className="bg-primary text-on-primary font-bold py-2 px-6 rounded-lg"
                >
                    Go Back
                </button>
            </div>
        );
    }
    
    const { server, username, password } = credentials;
    let streamUrl = '';

    if (type === 'live') {
        streamUrl = `${server}/live/${username}/${password}/${id}.m3u8`;
    } else if (type === 'movie') {
        streamUrl = `${server}/movie/${username}/${password}/${id}.mp4`;
    } else if (type === 'series' && episodeId) {
        streamUrl = `${server}/series/${username}/${password}/${episodeId}.mp4`;
    }

    return (
        <div className="relative w-screen h-screen bg-black">
            {isControlsVisible && <FocusableBackButton />}
            {streamUrl ? <VideoPlayer src={streamUrl} /> : <div className="w-full h-full flex items-center justify-center"><LoadingSpinner/></div>}
        </div>
    );
};

export default PlayerPage;