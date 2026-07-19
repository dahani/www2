/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Compass, Menu, X, ShieldAlert } from 'lucide-react';
import { getAssetUrl } from '../utils';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenInteractiveMap: () => void;
}

export default function Navbar({ currentTab, setCurrentTab, onOpenInteractiveMap }: NavbarProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isHome = currentTab === 'overview';
  const isTransparent = isHome && !isScrolled && !isOpen;

  const navItems = [
    { id: 'overview', label: 'Découvrir' },
    { id: 'faune', label: 'Faune' },
    { id: 'flore', label: 'Flore' },
    { id: 'culture', label: 'Culture & Légende' },
    { id: 'tourism', label: 'Écotourisme' },
    { id: 'preservation', label: 'Préservation' },
    { id: 'gallery', label: 'Galerie' },
    { id: 'contact', label: 'Contact' }
  ];

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
      isTransparent
        ? 'bg-transparent border-b border-transparent text-white'
        : 'bg-brand-bg/95 backdrop-blur-md border-b border-brand-light-gray text-brand-text shadow-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 lg:h-20">
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentTab('overview')}>
            <div className={`p-0 overflow-hidden rounded-xl border shadow-sm flex items-center justify-center shrink-0 transition-all duration-300 ${
              isTransparent
                ? 'bg-white/10 border-white/25 shadow-none'
                : 'bg-white border-brand-light-gray'
            }`}>
              <img src={getAssetUrl("/images/pnhao_logo.png")} alt="PNHAO Logo" className="h-9 w-9 lg:h-11 lg:w-11 object-contain" referrerPolicy="no-referrer" />
            </div>
            <div>
              <span className={`font-serif font-bold text-sm md:text-lg tracking-tight block leading-tight transition-colors duration-300 ${
                isTransparent ? 'text-white' : 'text-brand-primary'
              }`}>
                PNHAO
              </span>
              <span className={`text-[7px] md:text-[8px] uppercase font-sans tracking-widest block font-bold leading-none transition-colors duration-300 ${
                isTransparent ? 'text-brand-accent/90' : 'text-brand-accent'
              }`}>
                Haut Atlas Oriental
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex space-x-0.5 xl:space-x-1.5 items-center">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`px-2.5 py-2 rounded-xl text-xs xl:text-sm font-bold transition-all duration-300 relative cursor-pointer ${
                    isActive
                      ? isTransparent
                        ? 'text-white bg-white/15 shadow-sm'
                        : 'text-brand-primary bg-brand-sand/50'
                      : isTransparent
                        ? 'text-white/85 hover:text-white hover:bg-white/10'
                        : 'text-brand-text/75 hover:text-brand-primary hover:bg-brand-sand'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className={`absolute bottom-0 left-2 right-2 h-0.5 ${
                        isTransparent ? 'bg-white' : 'bg-brand-primary'
                      }`}
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Call to Action Button */}
          <div className="hidden xl:flex items-center">
            <button 
              onClick={onOpenInteractiveMap}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all shadow-sm cursor-pointer ${
                isTransparent
                  ? 'bg-white text-brand-primary hover:bg-white/90 shadow-md'
                  : 'bg-brand-primary hover:bg-[#3d4d41] active:bg-[#2f3d32] text-white'
              }`}
            >
              <Compass className="h-4 w-4" />
              <span>Agir pour le Parc</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`inline-flex items-center justify-center p-2 rounded-xl focus:outline-none cursor-pointer transition-colors ${
                isTransparent ? 'text-white hover:bg-white/10' : 'text-brand-text hover:bg-brand-sand'
              }`}
              aria-expanded="false"
            >
              <span className="sr-only">Ouvrir le menu</span>
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-0 left-0 w-full z-50 bg-white border-b border-brand-light-gray p-3 shadow-xl flex flex-col"
        >
          {/* Header inside popup */}
          <div className="flex items-center justify-between pb-2 border-b border-brand-light-gray/60 mb-2">
            <div className="flex items-center space-x-2">
              <div className="p-0 overflow-hidden rounded-xl border border-brand-light-gray shadow-sm flex items-center justify-center shrink-0 bg-white">
                <img src={getAssetUrl("/images/pnhao_logo.png")} alt="PNHAO Logo" className="h-7 w-7 object-contain" referrerPolicy="no-referrer" />
              </div>
              <div>
                <span className="font-serif font-bold text-xs tracking-tight block leading-tight text-brand-primary">PNHAO</span>
                <span className="text-[6px] uppercase font-sans tracking-widest text-brand-accent block font-bold leading-none">Haut Atlas Oriental</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-brand-text hover:bg-brand-sand transition-colors cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Grid of Navigation Items - reduces height drastically */}
          <div className="grid grid-cols-2 gap-1.5">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentTab(item.id);
                    setIsOpen(false);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all text-left cursor-pointer ${
                    isActive
                      ? 'bg-brand-sand text-brand-primary border-l-2 border-brand-primary'
                      : 'text-brand-text/80 hover:text-brand-primary hover:bg-brand-sand'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* CTA Button */}
          <div className="pt-2 mt-1.5 border-t border-brand-light-gray/60">
            <button
              onClick={() => {
                onOpenInteractiveMap();
                setIsOpen(false);
              }}
              className="w-full flex items-center justify-center space-x-2 py-1.5 bg-brand-primary hover:bg-[#3d4d41] text-white rounded-lg text-[11px] font-bold transition-all shadow cursor-pointer"
            >
              <Compass className="h-3.5 w-3.5" />
              <span>Agir pour le Parc</span>
            </button>
          </div>
        </motion.div>
      )}
    </nav>
  );
}
