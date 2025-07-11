import React from 'react';
import { NavLink } from 'react-router-dom';

// Since we cannot use a library like lucide-react, we define our own simple icons.
const HomeIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const SearchIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>;
const TvIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="15" x="2" y="7" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/></svg>;
const UserIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;


const NavItem = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => {
  const activeClass = "text-primary";
  const inactiveClass = "text-on-surface-variant hover:text-on-surface";
  
  return (
    <NavLink to={to} className={({ isActive }) => `flex flex-col items-center justify-center space-y-1 ${isActive ? activeClass : inactiveClass}`}>
      {icon}
      <span className="text-xs">{label}</span>
    </NavLink>
  );
};


const BottomNav: React.FC = () => {
  return (
    <nav className="bg-surface/80 backdrop-blur-sm border-t border-white/10 w-full max-w-md mx-auto shadow-lg">
      <div className="flex justify-around items-center h-16">
        <NavItem to="/" label="Início" icon={<HomeIcon />} />
        <NavItem to="/live" label="TV Ao Vivo" icon={<TvIcon />} />
        <NavItem to="/search" label="Buscar" icon={<SearchIcon />} />
        <NavItem to="/profile" label="Perfil" icon={<UserIcon />} />
      </div>
    </nav>
  );
};

export default BottomNav;
