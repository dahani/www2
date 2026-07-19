/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from './components/Navbar';
import OverviewTab from './components/OverviewTab';
import FauneTab from './components/FauneTab';
import FloreTab from './components/FloreTab';
import CultureTab from './components/CultureTab';
import EcotourismTab from './components/EcotourismTab';
import PreservationTab from './components/PreservationTab';
import GalleryTab from './components/GalleryTab';
import ContactTab from './components/ContactTab';
import { MapPin, Phone, Mail, Award, Compass } from 'lucide-react';
import { getAssetUrl } from './utils';

export default function App() {
  const validTabs = ['overview', 'faune', 'flore', 'culture', 'tourism', 'preservation', 'gallery', 'contact'];

  const getTabFromHash = () => {
    const hash = window.location.hash.replace('#', '');
    return validTabs.includes(hash) ? hash : 'overview';
  };

  const [currentTab, setCurrentTab] = useState<string>(getTabFromHash);
  const [showInteractiveMap, setShowInteractiveMap] = useState<boolean>(false);

  // Sync state changes to URL hash
  React.useEffect(() => {
    if (window.location.hash !== `#${currentTab}`) {
      window.history.pushState(null, '', `#${currentTab}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentTab]);

  // Handle browser back/forward buttons (hashchange event)
  React.useEffect(() => {
    const handleHashChange = () => {
      const tab = getTabFromHash();
      setCurrentTab(tab);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const renderActiveTab = () => {
    switch (currentTab) {
      case 'overview':
        return <OverviewTab setCurrentTab={setCurrentTab} onOpenInteractiveMap={() => setShowInteractiveMap(true)} />;
      case 'faune':
        return <FauneTab />;
      case 'flore':
        return <FloreTab />;
      case 'culture':
        return <CultureTab />;
      case 'tourism':
        return <EcotourismTab />;
      case 'preservation':
        return <PreservationTab />;
      case 'gallery':
        return <GalleryTab />;
      case 'contact':
        return <ContactTab />;
      default:
        return <OverviewTab setCurrentTab={setCurrentTab} onOpenInteractiveMap={() => setShowInteractiveMap(true)} />;
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col font-sans antialiased text-brand-text">
      {/* Navigation bar */}
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} onOpenInteractiveMap={() => setShowInteractiveMap(true)} />

      {/* Main Content Space */}
      <main className="flex-grow w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {currentTab === 'overview' ? (
              renderActiveTab()
            ) : (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 lg:pt-28 pb-12">
                {renderActiveTab()}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="px-4 sm:px-6 lg:px-8 py-10 bg-brand-bg">
        <div className="max-w-7xl mx-auto bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-brand-light-gray text-brand-text">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Logo and Intro */}
            <div className="md:col-span-5 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-1 rounded-xl bg-white border border-brand-light-gray shadow-sm flex items-center justify-center shrink-0">
                  <img src={getAssetUrl("/images/pnhao_logo.png")} alt="PNHAO Logo" className="h-10 w-10 object-contain" referrerPolicy="no-referrer" />
                </div>
                <div>
                  <span className="font-serif font-bold text-brand-primary text-xl tracking-tight block">PNHAO</span>
                  <span className="text-[10px] uppercase font-sans tracking-widest text-brand-accent block font-bold leading-tight">
                    Parc National du Haut Atlas Oriental
                  </span>
                </div>
              </div>
              <p className="text-xs text-stone-600 max-w-md leading-relaxed font-sans">
                Créé en 2004, le PNHAO préserve un écosystème forestier et faunique montagnard exceptionnel du Royaume du Maroc. Membre de la Réserve de Biosphère des Cédraies de l'Atlas de l'UNESCO et Zone Ramsar d'importance internationale.
              </p>
            </div>

            {/* Practical Navigation */}
            <div className="md:col-span-3 space-y-3">
              <h4 className="text-xs font-bold font-sans uppercase tracking-widest text-brand-primary">Navigation</h4>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-stone-600 font-sans">
                <li>
                  <button onClick={() => setCurrentTab('overview')} className="hover:text-brand-primary font-medium transition-colors cursor-pointer text-left">
                    Découvrir
                  </button>
                </li>
                <li>
                  <button onClick={() => setCurrentTab('faune')} className="hover:text-brand-primary font-medium transition-colors cursor-pointer text-left">
                    Faune
                  </button>
                </li>
                <li>
                  <button onClick={() => setCurrentTab('flore')} className="hover:text-brand-primary font-medium transition-colors cursor-pointer text-left">
                    Flore
                  </button>
                </li>
                <li>
                  <button onClick={() => setCurrentTab('culture')} className="hover:text-brand-primary font-medium transition-colors cursor-pointer text-left">
                    Culture
                  </button>
                </li>
                <li>
                  <button onClick={() => setCurrentTab('tourism')} className="hover:text-brand-primary font-medium transition-colors cursor-pointer text-left">
                    Écotourisme
                  </button>
                </li>
                <li>
                  <button onClick={() => setCurrentTab('preservation')} className="hover:text-brand-primary font-medium transition-colors cursor-pointer text-left">
                    Préservation
                  </button>
                </li>
                <li>
                  <button onClick={() => setCurrentTab('gallery')} className="hover:text-brand-primary font-medium transition-colors cursor-pointer text-left">
                    Galerie
                  </button>
                </li>
                <li>
                  <button onClick={() => setCurrentTab('contact')} className="hover:text-brand-primary font-medium transition-colors cursor-pointer text-left">
                    Contact
                  </button>
                </li>
              </ul>
            </div>

            {/* Official Contact Info */}
            <div className="md:col-span-4 space-y-3 text-xs text-stone-600 font-sans">
              <h4 className="text-xs font-bold font-sans uppercase tracking-widest text-brand-primary">Contacts & Partenaires</h4>
              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 text-brand-accent shrink-0 mt-0.5" />
                  <p>Direction du PNHAO & Division de l'ANEF, Province de Midelt, Maroc</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-brand-accent shrink-0" />
                  <p>Contact local : +212 (0) 535 58 20 04</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-brand-accent shrink-0" />
                  <p>hao@pnm.ma / support@anef.gov.ma / dpeflcd-midelt@anef.gov.ma</p>
                </div>
                <div className="flex items-center space-x-2 text-[10px] text-brand-primary font-mono font-semibold">
                  <Award className="h-4 w-4 shrink-0 text-brand-accent animate-pulse" />
                  <span>Stratégie Nationale Green-Génération 2020-2030</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-brand-light-gray mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500">
            <p>&copy; {new Date().getFullYear()} Agence Nationale des Eaux et Forêts (ANEF) - Royaume du Maroc. Tous droits réservés.</p>
            <p className="mt-2 sm:mt-0 font-mono text-[10px] text-brand-primary font-semibold">Parc National du Haut Atlas Oriental — Midelt</p>
          </div>
        </div>
      </footer>

      {/* Fullscreen Interactive Map Popup */}
      <AnimatePresence>
        {showInteractiveMap && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black flex flex-col"
          >
            {/* Modal Header */}
            <div className="absolute top-4 left-4 right-4 z-[10000] flex items-center justify-center pointer-events-none">
              
              <button
                onClick={() => setShowInteractiveMap(false)}
                className="p-2 px-5 bg-[#1e2320]/90 backdrop-blur-md hover:bg-rose-600 hover:text-white text-stone-200 rounded-2xl transition-all cursor-pointer border border-stone-800/40 flex items-center justify-center font-sans text-xs font-bold space-x-1.5 pointer-events-auto shadow-lg"
                title="Fermer la Carte"
              >
                <span>Fermer</span>
                <span className="font-bold text-sm leading-none">&times;</span>
              </button>
            </div>

            {/* iFrame Container */}
            <div className="flex-1 bg-stone-950 relative w-full h-full">
              <iframe
                src="https://pnm.ma/interactive_map/?v=4&mapid=2"
                title="Carte Interactive PNHAO"
                className="w-full h-full border-0 absolute inset-0"
                allow="fullscreen"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

