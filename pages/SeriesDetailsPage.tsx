import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '../services/ApiContext';
import { SeriesInfo } from '../types'; // Episode, Stream são usados implicitamente por SeriesInfo
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useFocusable } from '../components/tv/FocusManager'; // Se for usar os componentes Focusable

// Ícones e componentes auxiliares (podem ser movidos para um local comum se usados em mais lugares)
const PlayIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="currentColor" className={className}><path d="M8 5v14l11-7z"/></svg>;

const UserPlaceholderIcon = ({ className }: { className?: string }) => (
    <div className={`flex items-center justify-center bg-surface ${className}`}>
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-on-surface-variant">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
    </div>
);

const CastMember: React.FC<{ name: string }> = ({ name }) => {
    // Se for usar FocusManager, mantenha useFocusable. Caso contrário, pode simplificar.
    const { ref, isFocused } = useFocusable<HTMLDivElement>({ onEnterPress: () => {} });

    return (
        <div ref={ref} tabIndex={-1} className={`flex flex-col items-center flex-shrink-0 w-24 text-center p-2 rounded-lg transition-all duration-200 ${isFocused ? 'focused' : ''}`}>
            <UserPlaceholderIcon className="w-20 h-20 rounded-full mb-2" />
            <p className="text-xs text-on-surface font-semibold">{name}</p>
        </div>
    );
};

// Reutilizando FocusableButton e FocusableLink de DetailsPage (ou defina-os aqui/importe de um local comum)
// Por simplicidade, vou assumir que eles podem ser copiados ou idealmente importados se movidos para /components/common
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


const SeriesDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { api } = useApi();
    const navigate = useNavigate();
    const [seriesDetails, setSeriesDetails] = useState<SeriesInfo | null>(null);
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
        const fetchSeriesDetails = async () => {
            if (!api || !id) return;
            setLoading(true);
            setSelectedSeason(null);
            try {
                const data = await api.getSeriesInfo(id);
                setSeriesDetails(data);

                if (data && data.episodes) {
                    if (data.seasons && data.seasons.length > 0) {
                        const firstSeasonWithEpisodes = data.seasons.find(s =>
                            data.episodes[s.season_number] && data.episodes[s.season_number].length > 0
                        );
                        if (firstSeasonWithEpisodes) {
                            setSelectedSeason(String(firstSeasonWithEpisodes.season_number));
                        } else {
                            const seasonKeys = Object.keys(data.episodes);
                            if (seasonKeys.length > 0) {
                                setSelectedSeason(seasonKeys[0]);
                            }
                        }
                    } else {
                         const seasonKeys = Object.keys(data.episodes);
                         if (seasonKeys.length > 0) {
                            setSelectedSeason(seasonKeys[0]);
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to fetch series details:', error);
                setSeriesDetails(null); // Garante que não haja dados antigos em caso de erro
            } finally {
                setLoading(false);
            }
        };
        fetchSeriesDetails();
    }, [api, id]);

    if (loading) {
        return <div className="h-full flex items-center justify-center"><LoadingSpinner /></div>;
    }

    if (!seriesDetails || !seriesDetails.info) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-on-surface-variant p-4">
                 <BackButton />
                <p>Não foi possível carregar os detalhes da série.</p>
                <p className="text-sm mt-2">Verifique sua conexão ou tente novamente mais tarde.</p>
            </div>
        );
    }

    const { info, seasons, episodes } = seriesDetails;

    const backdrop = info.backdrop_path?.[0] || '';
    const plot = info.plot || 'Sinopse não disponível.';
    const cast = info.cast?.split(',').map(c => c.trim()) || [];

    // Determina o link do player para o primeiro episódio da temporada selecionada ou o primeiro episódio geral
    let playAllLink = `/player/series/${id}`;
    if (selectedSeason && episodes[selectedSeason] && episodes[selectedSeason].length > 0) {
        playAllLink = `/player/series/${id}?ep=${episodes[selectedSeason][0].id}`;
    } else if (Object.keys(episodes).length > 0) {
        const firstSeasonWithEpisodesKey = Object.keys(episodes).find(key => episodes[key].length > 0);
        if (firstSeasonWithEpisodesKey && episodes[firstSeasonWithEpisodesKey].length > 0) {
             playAllLink = `/player/series/${id}?ep=${episodes[firstSeasonWithEpisodesKey][0].id}`;
        }
    }


    return (
        <div className="bg-background min-h-full">
            <div className="relative h-60 sm:h-80 md:h-96"> {/* Altura responsiva para backdrop */}
                <BackButton />
                {backdrop ?
                    <img src={backdrop} alt={info.name} className="w-full h-full object-cover" /> :
                    <div className="w-full h-full bg-surface"></div>}
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent"></div>
            </div>

            <div className="p-4 -mt-10 sm:-mt-16 relative z-10">
                <h1 className="text-2xl sm:text-3xl font-bold text-on-surface">{info.name}</h1>
                <div className="flex items-center space-x-4 text-xs sm:text-sm text-on-surface-variant mt-2">
                    {info.releaseDate && <span>{info.releaseDate.substring(0,4)}</span>}
                    {info.rating_5based !== undefined && <span>{info.rating_5based.toFixed(1)}/5.0</span>}
                    {info.episode_run_time && <span>{info.episode_run_time}</span>}
                </div>

                <p className="mt-4 text-on-surface-variant text-sm sm:text-base leading-relaxed">{plot}</p>

                {cast.length > 0 && (
                     <div className="mt-6">
                        <h2 className="text-lg font-bold text-on-surface mb-3">Elenco</h2>
                        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                            {cast.slice(0, 8).map(name => <CastMember key={name} name={name} />)}
                        </div>
                    </div>
                )}

                 <div className="mt-6 space-y-3">
                    <FocusableLink
                        to={playAllLink}
                        className="w-full flex items-center justify-center bg-primary text-on-primary font-bold py-3 rounded-lg hover:bg-yellow-600 transition-colors"
                        aria-label={`Reproduzir ${info.name}${selectedSeason ? ` (Temporada ${selectedSeason}, Episódio 1)` : ''}`}
                    >
                        <PlayIcon />
                        <span className="ml-2">Reproduzir</span>
                    </FocusableLink>
                    {/* Poderia adicionar outros botões aqui, como "Adicionar à lista" etc. */}
                </div>

                {/* Seção de Temporadas e Episódios */}
                <div className="mt-8">
                    <h2 className="text-xl font-bold text-on-surface mb-4">Temporadas e Episódios</h2>

                    {/* Season Selector */}
                    {seasons && seasons.length > 0 ? (
                        <div className="flex space-x-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
                            {seasons.map(season => (
                                <FocusableButton
                                    key={season.id || season.season_number}
                                    onClick={() => setSelectedSeason(String(season.season_number))}
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors duration-200 ${
                                        selectedSeason === String(season.season_number)
                                            ? 'bg-primary text-on-primary'
                                            : 'bg-surface text-on-surface-variant hover:bg-white/10'
                                    }`}
                                >
                                    {season.name || `Temporada ${season.season_number}`}
                                </FocusableButton>
                            ))}
                        </div>
                    ) : (
                        Object.keys(episodes || {}).length > 0 && (
                             <p className="text-on-surface-variant text-sm mb-4">
                                Nenhuma lista formal de temporadas, exibindo episódios da primeira temporada disponível.
                            </p>
                        )

                    )}

                    {/* Episodes List */}
                    {selectedSeason && episodes && episodes[selectedSeason] && episodes[selectedSeason].length > 0 ? (
                        <div className="space-y-3">
                            {episodes[selectedSeason].map(ep => (
                                <FocusableLink
                                    to={`/player/series/${id}?ep=${ep.id}`}
                                    key={ep.id}
                                    className="flex items-center p-3 rounded-lg bg-surface hover:bg-white/10 transition-colors"
                                    aria-label={`Reproduzir ${ep.title || `Episódio ${ep.episode_num}`}`}
                                >
                                    <div className="w-24 sm:w-28 h-14 sm:h-16 bg-black rounded-md mr-3 sm:mr-4 flex-shrink-0 overflow-hidden">
                                        {ep.info.movie_image ?
                                            <img src={ep.info.movie_image} alt="" className="w-full h-full object-cover" /> :
                                            <div className="w-full h-full flex items-center justify-center bg-black">
                                                 <PlayIcon className="w-6 h-6 sm:w-8 sm:h-8 text-on-surface-variant"/>
                                            </div>
                                        }
                                    </div>
                                    <div className="flex-grow">
                                        <p className="font-semibold text-on-surface text-sm sm:text-base leading-tight">
                                            E{ep.episode_num}. {ep.title || `Episódio ${ep.episode_num}`}
                                        </p>
                                        {ep.info.duration && <p className="text-xs sm:text-sm text-on-surface-variant mt-1">{ep.info.duration}</p>}
                                    </div>
                                    <PlayIcon className="w-5 h-5 sm:w-6 sm:h-6 text-primary ml-2 flex-shrink-0"/>
                                </FocusableLink>
                            ))}
                        </div>
                    ) : (
                        selectedSeason && (
                            <p className="text-on-surface-variant text-sm mt-4">
                                Não há episódios disponíveis para a temporada selecionada.
                            </p>
                        )
                    )}

                    {(!seasons || seasons.length === 0) && (!episodes || Object.keys(episodes).length === 0) && (
                        <p className="text-on-surface-variant text-sm mt-4">
                            Informações de temporadas e episódios não disponíveis para esta série.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SeriesDetailsPage;
