import React, { useContext, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useFocusable, FocusContext } from './FocusManager';
import { useTvLayout } from '../../contexts/TvLayoutContext';

const Logo = () => (
    <div className="flex items-center justify-center h-20 shrink-0">
        <svg viewBox="0 0 100 100" className="w-10 h-10 text-brand-red">
            <path fill="currentColor" d="M20,10 L40,10 L40,50 L60,50 L60,10 L80,10 L80,90 L60,90 L60,60 L40,60 L40,90 L20,90 Z M45,45 L55,45 L55,55 L45,55 Z" />
        </svg>
        <span className="hidden">MEGAFLIX</span>
    </div>
);

// Icons
const HomeIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const SearchIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>;
const TvIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="15" x="2" y="7" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/></svg>;
const FilmIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="2" y1="7" x2="7" y2="7"></line><line x1="2" y1="17" x2="7" y2="17"></line><line x1="17" y1="17" x2="22" y2="17"></line><line x1="17" y1="7" x2="22" y2="7"></line></svg>;

const NavItem = ({ to, icon, label, focusId }: { to: string; icon: React.ReactNode; label: string; focusId: string }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = location.pathname === to;
  const { setSidebarVisible } = useTvLayout();
  const focusContext = useContext(FocusContext);

  const { ref, isFocused } = useFocusable<HTMLDivElement>({
    focusId,
    onEnterPress: () => {
        // Navigating away will cause FocusManager to naturally re-evaluate focus.
        navigate(to);
    },
    onArrowPress: (direction) => {
        if (direction === 'ArrowRight') {
            setSidebarVisible(false);
            focusContext?.releaseFocus();
            // Let the FocusManager find the next best target from the current position.
            return false;
        }
        return false;
    }
  });

  const baseClasses = "flex items-center justify-center w-full p-4 my-1 rounded-lg text-on-surface-variant transition-all duration-200 focus:outline-none";
  const hoverClasses = "hover:bg-surface hover:text-on-surface";
  const activeClasses = "bg-primary/20 text-primary font-semibold";
  
  return (
    <div 
      ref={ref}
      tabIndex={-1}
      aria-label={label}
      onClick={(e) => { e.preventDefault(); navigate(to); }}
      className={`${baseClasses} ${hoverClasses} ${isFocused ? 'focused' : ''} ${isActive && !isFocused ? activeClasses : ''}`}
    >
      {icon}
      <span className="hidden">{label}</span>
    </div>
  );
};

const TvSidebar: React.FC = () => {
  const { isSidebarVisible } = useTvLayout();
  const focusContext = useContext(FocusContext);
  const sidebarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // When the sidebar is visible, ensure focus is trapped within it.
    // The `trapFocus` function is now idempotent, so we can call it on every render
    // where the sidebar is visible without causing issues like resetting focus.
    if (isSidebarVisible && focusContext && sidebarRef.current) {
      focusContext.trapFocus(sidebarRef);
    }
  }, [isSidebarVisible, focusContext, focusContext?.trapFocus]);


  return (
    <aside ref={sidebarRef} className={`fixed top-0 left-0 h-full w-20 bg-background border-r border-white/10 flex flex-col z-40 transition-transform duration-300 ease-in-out ${isSidebarVisible ? 'translate-x-0' : '-translate-x-full'}`}>
      <Logo />
      <nav className="flex flex-col px-2 mt-8">
        <NavItem to="/" label="Início" icon={<HomeIcon className="w-7 h-7 shrink-0" />} focusId="sidebar-item-home" />
        <NavItem to="/live" label="Ao Vivo" icon={<TvIcon className="w-7 h-7 shrink-0" />} focusId="sidebar-item-live" />
      </nav>
      <div className="mt-auto px-2 mb-8">
        <NavItem to="/search" label="Buscar" icon={<SearchIcon className="w-7 h-7 shrink-0" />} focusId="sidebar-item-search" />
        <NavItem to="/profile" label="Perfil" icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 shrink-0"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>} focusId="sidebar-item-profile" />
      </div>
    </aside>
  );
};

export default TvSidebar;