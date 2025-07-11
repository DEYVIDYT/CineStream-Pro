import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '../services/ApiContext';
import { VodInfo, SeriesInfo, Episode, Stream } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useFocusable } from '../components/tv/FocusManager';

const PlayIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="currentColor" className={className}><path d="M8 5v14l11-7z"/></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;

const UserPlaceholderIcon = ({ className }: { className?: string }) => (
    <div className={`flex items-center justify-center bg-surface ${className}`}>
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-on-surface-variant">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
    </div>
);

const CastMember: React.FC<{ name: string }> = ({ name }) => {
    const { ref, isFocused } = useFocusable<HTMLDivElement>({ onEnterPress: () => {} }); // No action on enter, just focusable

    return (
        <div ref={ref} tabIndex={-1} className={`flex flex-col items-center flex-shrink-0 w-24 text-center p-2 rounded-lg transition-all duration-200 ${isFocused ? 'focused' : ''}`}>
            <UserPlaceholderIcon className="w-20 h-20 rounded-full mb-2" />
            <p className="text-xs text-on-surface font-semibold">{name}</p>
        </div>
    );
};

const FocusableButton: React.FC<{ onClick: () => void, className?: string, children: React.ReactNode }> = ({ onClick, className, children }) => {
    const { ref, isFocused } = useFocusable<HTMLButtonElement>({ onEnterPress: onClick });
    return (
        <button ref={ref} onClick={onClick} tabIndex={-1} className={`${className} ${isFocused ? 'focused' : ''}`}>
            {children}
        </button>
    );
};

const FocusableLink: React.FC<{ to: string, className?: string, children: React.ReactNode, 'aria-label'?: string }> = ({ to, className, children, 'aria-label': ariaLabel }) => {
    const navigate = useNavigate();
    const { ref, isFocused } = useFocusable<HTMLDivElement>({ onEnterPress: () => navigate(to) });
    return (
        <div ref={ref} onClick={() => navigate(to)} tabIndex={-1} className={`${className} ${isFocused ? 'focused' : ''}`} aria-label={ariaLabel}>
            {children}
        </div>
    );
};


const MovieDetailsPage: React.FC = () => { // Nome do componente atualizado
    // A rota agora é /movie/:id, então 'type' não é mais um parâmetro de URL aqui.
    const { id } = useParams<{ id: string }>();
    const { api } = useApi();
    const navigate = useNavigate(); // Ainda pode ser útil para o BackButton ou outros links
    const [details, setDetails] = useState<VodInfo | null>(null);
    const [loading, setLoading] = useState(true);
    // selectedSeason não é mais necessário aqui

    const BackButton = () => {
        const { ref, isFocused } = useFocusable<HTMLButtonElement>({onEnterPress: () => navigate(-1)});
        return (
            <button ref={ref} onClick={() => navigate(-1)} tabIndex={-1} className={`absolute top-4 left-4 z-20 bg-black/50 p-2 rounded-full text-white focus:outline-none ${isFocused ? 'focused' : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            </button>
        )
    };

    useEffect(() => {
        const fetchDetails = async () => {
            if (!api || !id) return;
            setLoading(true);
            try {
                const data = await api.getVodInfo(id); // Busca diretamente VodInfo
                setDetails(data);
            } catch (error) {
                console.error('Failed to fetch VOD details:', error);
                setDetails(null);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [api, id]); // Removido 'type' e 'navigate' das dependências do useEffect se não forem mais usados no fetch

    if (loading) {
        return <div className="h-full flex items-center justify-center"><LoadingSpinner /></div>;
    }

    if (!details) { // Se details for null e não estiver carregando (loading é false aqui)
        return (
            <div className="h-full flex flex-col items-center justify-center text-on-surface-variant p-4">
                <BackButton />
                <p>Não foi possível carregar os detalhes do filme.</p>
            </div>
        );
    }

    // 'details' é VodInfo aqui.
    const vodInfo = details.info;
    const displayData = {
        name: vodInfo.name,
        backdrop_path: vodInfo.backdrop_path,
        plot: vodInfo.plot || vodInfo.description,
        cast: vodInfo.cast,
        releaseDate: vodInfo.releasedate,
        rating_5based: vodInfo.rating_5based,
        episode_run_time: vodInfo.episode_run_time,
    };

    const playerLink = `/player/movie/${id}`; // O 'type' no link do player ainda é necessário se PlayerPage o usa

    const backdrop = displayData.backdrop_path?.[0] || '';
    const plot = displayData.plot || 'No plot available.';
    const cast = displayData.cast?.split(',').map(c => c.trim()) || [];

    return (
        <div className="bg-background min-h-full">
            <div className="relative h-60">
                <BackButton />
                {backdrop ?
                    <img src={backdrop} alt={displayData.name} className="w-full h-full object-cover" /> :
                    <div className="w-full h-full bg-surface"></div>}
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent"></div>
            </div>

            <div className="p-4 -mt-8 relative z-10">
                <h1 className="text-3xl font-bold text-on-surface">{displayData.name}</h1>
                <div className="flex items-center space-x-4 text-sm text-on-surface-variant mt-2">
                    <span>{displayData.releaseDate?.substring(0,4)}</span>
                    <span>{displayData.rating_5based?.toFixed(1) || 'N/A'}/5.0</span>
                    <span>{displayData.episode_run_time}</span>
                </div>

                <p className="mt-4 text-on-surface-variant text-sm leading-relaxed">{plot}</p>

                {cast.length > 0 && (
                     <div className="mt-6">
                        <h2 className="text-lg font-bold text-on-surface mb-3">Elenco</h2>
                        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                            {cast.slice(0, 8).map(name => <CastMember key={name} name={name} />)}
                        </div>
                    </div>
                )}

                 <div className="mt-6 space-y-3">
                    <FocusableLink to={playerLink} className="w-full flex items-center justify-center bg-primary text-on-primary font-bold py-3 rounded-lg hover:bg-yellow-600 transition-colors">
                        <PlayIcon />
                        <span className="ml-2">Reproduzir</span>
                    </FocusableLink>
                    <FocusableButton onClick={() => alert('Download feature not implemented.')} className="w-full flex items-center justify-center bg-surface text-on-surface font-bold py-3 rounded-lg hover:bg-white/10 transition-colors">
                        <DownloadIcon />
                        <span className="ml-2">Download</span>
                    </FocusableButton>
                </div>

                {/* A seção de Temporadas e Episódios foi removida, pois esta página é agora apenas para filmes. */}
            </div>
        </div>
    );
};

export default MovieDetailsPage; // Export atualizado