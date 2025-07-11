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


const DetailsPage: React.FC = () => {
    const { type, id } = useParams<{ type: 'movie' | 'series', id: string }>();
    const { api } = useApi();
    const navigate = useNavigate();
    const [details, setDetails] = useState<VodInfo | SeriesInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedSeason, setSelectedSeason] = useState<string | null>(null);

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
            if (!api || !type || !id) return;
            setLoading(true);
            setSelectedSeason(null); // Reset antes de nova busca
            try {
                let data;
                if (type === 'movie') {
                    data = await api.getVodInfo(id);
                } else { // type === 'series'
                    data = await api.getSeriesInfo(id);
                    if (data && 'episodes' in data) { // Garantir que é SeriesInfo
                        const seriesData = data as SeriesInfo; // Type assertion
                        if (seriesData.seasons && seriesData.seasons.length > 0) {
                            // Priorizar a primeira temporada listada em `seriesData.seasons`
                            // que também tem uma entrada correspondente em `seriesData.episodes`.
                            const validSeasonFromList = seriesData.seasons.find(s =>
                                seriesData.episodes &&
                                seriesData.episodes[s.season_number] &&
                                seriesData.episodes[s.season_number].length > 0
                            );
                            if (validSeasonFromList) {
                                setSelectedSeason(String(validSeasonFromList.season_number));
                            } else {
                                // Fallback: Se nenhuma temporada da lista `seasons` tem episódios
                                // ou se `seasons` estiver vazio, tentar usar a primeira chave de `episodes`.
                                const episodeSeasonKeys = Object.keys(seriesData.episodes || {});
                                if (episodeSeasonKeys.length > 0) {
                                    setSelectedSeason(episodeSeasonKeys[0]);
                                }
                            }
                        } else {
                            // Fallback mais profundo: se `seriesData.seasons` estiver vazio,
                            // mas `seriesData.episodes` tiver chaves.
                            const episodeSeasonKeys = Object.keys(seriesData.episodes || {});
                            if (episodeSeasonKeys.length > 0) {
                                setSelectedSeason(episodeSeasonKeys[0]);
                            }
                        }
                    }
                }
                setDetails(data);
            } catch (error) {
                console.error('Failed to fetch details:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [api, type, id]);

    if (loading) {
        return <div className="h-full flex items-center justify-center"><LoadingSpinner /></div>;
    }

    if (!details) {
        return <div className="h-full flex items-center justify-center text-on-surface-variant">Could not load details.</div>;
    }

    const displayData = (() => {
        if ('episodes' in details) { // This is a SeriesInfo
            const info = details.info;
            return {
                name: info.name,
                backdrop_path: info.backdrop_path,
                plot: info.plot,
                cast: info.cast,
                releaseDate: info.releaseDate,
                rating_5based: info.rating_5based,
                episode_run_time: info.episode_run_time,
            };
        } else { // This is a VodInfo
            const info = details.info;
            return {
                name: info.name,
                backdrop_path: info.backdrop_path,
                plot: info.plot || info.description,
                cast: info.cast,
                releaseDate: info.releasedate, // Note the different property name
                rating_5based: info.rating_5based,
                episode_run_time: info.episode_run_time,
            };
        }
    })();
    
    let playerLink = `/player/${type}/${id}`;
    if (type === 'series' && 'episodes' in details && details.episodes) {
        const firstSeasonKey = Object.keys(details.episodes)[0];
        if (firstSeasonKey && details.episodes[firstSeasonKey]?.length > 0) {
            const firstEpisodeId = details.episodes[firstSeasonKey][0].id;
            playerLink = `/player/series/${id}?ep=${firstEpisodeId}`;
        }
    }


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

                {/* Seção de Temporadas e Episódios */}
                {type === 'series' && details && 'episodes' in details && 'seasons' in details && (
                    <div className="mt-8">
                        <h2 className="text-lg font-bold text-on-surface mb-4">Episódios</h2>
                        
                        {/* Season Selector */}
                        {details.seasons && details.seasons.length > 0 ? (
                            <div className="flex space-x-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
                                {details.seasons
                                    // Opcional: manter o filtro se quiser apenas mostrar temporadas com episódios,
                                    // mas para robustez, podemos mostrar todas as temporadas retornadas pela API
                                    // e a lista de episódios abaixo lidará se estiver vazia para uma temporada específica.
                                    // .filter(season => details.episodes && details.episodes[season.season_number] && details.episodes[season.season_number].length > 0)
                                    .map(season => (
                                        <FocusableButton
                                            key={season.id || season.season_number} // Usar season.id se disponível, fallback para season_number
                                            onClick={() => setSelectedSeason(String(season.season_number))}
                                            className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors duration-200 ${
                                                selectedSeason === String(season.season_number)
                                                    ? 'bg-primary text-on-primary'
                                                    : 'bg-surface text-on-surface-variant hover:bg-white/10'
                                            }`}
                                        >
                                            {season.name || `Temporada ${season.season_number}`} {/* Fallback para nome da temporada */}
                                        </FocusableButton>
                                ))}
                            </div>
                        ) : (
                            Object.keys(details.episodes || {}).length > 0 && (
                                <p className="text-on-surface-variant text-sm mb-4">
                                    Temporadas não listadas, mas episódios disponíveis. Selecionando a primeira disponível.
                                    {/* Isso pode acontecer se a API retornar episódios agrupados por season_number
                                        mas a lista `details.seasons` estiver vazia. A lógica de `selectedSeason`
                                        já tenta pegar a primeira chave de `details.episodes` nesses casos. */}
                                </p>
                            )
                        )}

                        {/* Episodes List */}
                        {selectedSeason && details.episodes && details.episodes[selectedSeason] && details.episodes[selectedSeason].length > 0 ? (
                            <div className="space-y-3">
                                {details.episodes[selectedSeason].map(ep => (
                                    <FocusableLink 
                                        to={`/player/series/${id}?ep=${ep.id}`} 
                                        key={ep.id} 
                                        className="flex items-center p-2 rounded-lg bg-surface hover:bg-white/10 transition-colors"
                                        aria-label={`Reproduzir ${ep.title || `Episódio ${ep.episode_num}`}`}
                                    >
                                        <div className="w-28 h-16 bg-black rounded-md mr-4 flex-shrink-0 overflow-hidden">
                                            {ep.info.movie_image ? 
                                                <img src={ep.info.movie_image} alt="" className="w-full h-full object-cover" /> :
                                                <div className="w-full h-full flex items-center justify-center bg-black">
                                                     <PlayIcon className="w-8 h-8 text-on-surface-variant"/>
                                                </div>
                                            }
                                        </div>
                                        <div className="flex-grow">
                                            <p className="font-semibold text-on-surface text-sm leading-tight">
                                                E{ep.episode_num}. {ep.title || `Episódio ${ep.episode_num}`} {/* Fallback para título */}
                                            </p>
                                            {ep.info.duration && <p className="text-xs text-on-surface-variant mt-1">{ep.info.duration}</p>}
                                        </div>
                                        <PlayIcon className="w-6 h-6 text-primary ml-2 flex-shrink-0"/>
                                    </FocusableLink>
                                ))}
                            </div>
                        ) : (
                            selectedSeason && (details.episodes && (!details.episodes[selectedSeason] || details.episodes[selectedSeason].length === 0)) && (
                                <p className="text-on-surface-variant text-sm">
                                    Não há episódios disponíveis para a temporada selecionada.
                                </p>
                            )
                        )}

                        {/* Mensagem de fallback se nenhuma temporada ou episódio for encontrado, mas esperávamos */}
                        {(!details.seasons || details.seasons.length === 0) &&
                         (!details.episodes || Object.keys(details.episodes).length === 0) && (
                            <p className="text-on-surface-variant text-sm">
                                Informações de temporadas e episódios não disponíveis para esta série.
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DetailsPage;