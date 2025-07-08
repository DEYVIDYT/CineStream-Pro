
import React from 'react';
import VideoPlayer from './components/VideoPlayer';

const App: React.FC = () => {
    // Este é um URL de stream HLS de amostra para teste.
    // Substitua pelo seu próprio URL de stream HLS.
    const videoSrc = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 text-white">
            <main className="w-full max-w-4xl">
                <h1 className="text-3xl font-bold mb-4 text-center text-gray-200">Advanced Video Player</h1>
                <p className="text-center text-gray-400 mb-6">
                    Otimizado para streaming HLS suave com Picture-in-Picture e controles de avanço/retrocesso.
                </p>
                <VideoPlayer src={videoSrc} />
            </main>
        </div>
    );
};

export default App;
