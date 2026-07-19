/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, MapPin, X, ChevronLeft, ChevronRight, Eye, Grid, Info } from 'lucide-react';
import { getAssetUrl } from '../utils';
import animalsData from '../animals.json';

interface GalleryItem {
  id: string;
  url: string;
  title: string;
  category: 'Lacs & Zones Humides' | 'Faune Alpine' | 'Forêts & Cèdres' | 'Vie Berbère & Douars';
  location: string;
  description: string;
  photographer: string;
}

export default function GalleryTab() {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const galleryItems: GalleryItem[] = [
    {
      id: 'gal-1',
      url: '/images/isly_tislit_lake_1783949826439.jpg',
      title: "Les Lacs Jumeaux d'Isly et Tislit",
      category: "Lacs & Zones Humides",
      location: "Plateau de l'Imilchil, 2200m",
      description: "Classés Ramsar d'importance mondiale, ces deux miroirs bleus reflètent l'immensité du ciel de l'Atlas.",
      photographer: "Division de l'ANEF"
    },
    {
      id: 'gal-2',
      url: '/images/faune/mouflon_manchettes_1783949869486.jpg',
      title: "Le Mouflon à manchettes en altitude",
      category: "Faune Alpine",
      location: "Massif du Djebel Ayachi, 2900m",
      description: "Grimpant agile des versants abrupts, photographié lors d'un recensement hivernal de la faune sauvage.",
      photographer: "Équipe Scientifique PNHAO"
    },
    {
      id: 'gal-3',
      url: '/images/atlas_kasbah_village_1783949848718.jpg',
      title: "Ksour Traditionnels de la Vallée",
      category: "Vie Berbère & Douars",
      location: "Vallée d'Outerbat, Midelt",
      description: "Des habitations d'une authenticité préservée construites en pisé, assurant un confort thermique ancestral.",
      photographer: "Observatoire du Patrimoine de l'Atlas"
    },
    {
      id: 'gal-4',
      url: 'https://ifrane.pnm.ma/wp-content/uploads/2025/11/Cedrus_atlantica1.jpg',
      title: "Forêt de Cèdres millénaires",
      category: "Forêts & Cèdres",
      location: "Canton forestier de Tirrhist, 2400m",
      description: "Le Cedrus atlantica, symbole majestueux du Maroc, formant des futaies denses indispensables au climat montagnard.",
      photographer: "Service Forestier de l'ANEF"
    },
    {
      id: 'gal-5',
      url: 'https://ifrane.pnm.ma/wp-content/uploads/2025/11/Juniperus_thurifera1.jpg',
      title: "Genévriers thurifères sur les Crêtes",
      category: "Forêts & Cèdres",
      location: "Crêtes du Massif Ayachi, 2800m",
      description: "Arbre robuste d'altitude bravant le gel, la neige et les vents violents sur les versants calcaires élevés du parc.",
      photographer: "Équipe Scientifique PNHAO"
    },
    ...(animalsData as GalleryItem[])
  ];

  const filteredItems = galleryItems.filter(item => {
    return activeFilter === 'all' || item.category === activeFilter;
  });

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIdx === null) return;
      if (e.key === 'Escape') setSelectedIdx(null);
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIdx]);

  const handleNext = () => {
    if (selectedIdx === null) return;
    setSelectedIdx((selectedIdx + 1) % filteredItems.length);
  };

  const handlePrev = () => {
    if (selectedIdx === null) return;
    setSelectedIdx((selectedIdx - 1 + filteredItems.length) % filteredItems.length);
  };

  // Touch/swipe navigation for mobile
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.changedTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    const swipeThreshold = 50; // minimum distance in pixels

    if (diff > swipeThreshold) {
      handleNext();
    } else if (diff < -swipeThreshold) {
      handlePrev();
    }
    setTouchStartX(null);
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1.5">
          <span className="text-xs font-bold font-sans uppercase tracking-widest text-brand-accent">Galerie de Photos & Paysages</span>
          <h2 className="font-serif font-bold text-3xl sm:text-4xl text-brand-text tracking-tight">Vues Immersives du Parc National</h2>
          <p className="text-sm text-stone-500 max-w-2xl font-sans">
            Une fenêtre visuelle sur le Haut Atlas Oriental. Parcourez la faune locale, les montagnes de calcaire, la vie des tribus berbères et les magnifiques cédraies. Cliquez sur n'importe quelle photo pour l'ouvrir en plein écran.
          </p>
        </div>
      </div>

      {/* Category Filters */}
      <section className="flex flex-wrap gap-2 pb-2 border-b border-brand-light-gray">
        <button
          onClick={() => { setActiveFilter('all'); setSelectedIdx(null); }}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
            activeFilter === 'all'
              ? 'bg-brand-primary text-white shadow-sm'
              : 'bg-white border border-brand-light-gray text-brand-text/75 hover:bg-brand-sand'
          }`}
        >
          <Grid className="h-4 w-4" />
          <span>Toutes les Photos</span>
        </button>
        {['Lacs & Zones Humides', 'Faune Alpine', 'Forêts & Cèdres', 'Vie Berbère & Douars'].map((cat) => (
          <button
            key={cat}
            onClick={() => { setActiveFilter(cat); setSelectedIdx(null); }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeFilter === cat
                ? 'bg-brand-primary text-white shadow-sm'
                : 'bg-white border border-brand-light-gray text-brand-text/75 hover:bg-brand-sand'
            }`}
          >
            {cat}
          </button>
        ))}
      </section>

      {/* Photo Grid */}
      <motion.div
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item, index) => {
            const originalIndex = galleryItems.findIndex(g => g.id === item.id);
            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                onClick={() => setSelectedIdx(index)}
                className="group relative h-[300px] rounded-[32px] overflow-hidden shadow-sm hover:shadow-xl border border-brand-light-gray bg-brand-sand cursor-pointer transition-all duration-300"
              >
                {/* Image */}
                <img
                  src={getAssetUrl(item.url)}
                  alt={item.title}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />

                {/* Cover Overlay on Hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#2D342F]/90 via-[#2D342F]/45 to-transparent opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 text-white">
                  <div className="space-y-2">
                    <span className="text-[9px] uppercase font-bold tracking-widest text-brand-accent px-2 py-1 rounded-md bg-white/10 w-fit block backdrop-blur-sm">
                      {item.category}
                    </span>
                    <h3 className="font-serif font-bold text-lg leading-tight text-white group-hover:text-brand-accent transition-colors">
                      {item.title}
                    </h3>
                    <div className="flex items-center space-x-1.5 text-xs text-stone-300 font-sans">
                      <MapPin className="h-3.5 w-3.5 text-brand-accent shrink-0" />
                      <span>{item.location}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[10px] text-stone-400 font-sans">
                      <span className="flex items-center space-x-1">
                        <Camera className="h-3.5 w-3.5 shrink-0" />
                        <span>Crédit : {item.photographer}</span>
                      </span>
                      <span className="flex items-center space-x-1 text-white font-bold">
                        <Eye className="h-3.5 w-3.5 shrink-0" />
                        <span>Zoom</span>
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* Lightbox Full Screen Modal */}
      <AnimatePresence>
        {selectedIdx !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden touch-pan-y"
            onClick={() => setSelectedIdx(null)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Background Fullscreen Image */}
            <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedIdx}
                  src={getAssetUrl(filteredItems[selectedIdx].url)}
                  alt={filteredItems[selectedIdx].title}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </AnimatePresence>
              {/* Dark overlay gradients for text readability */}
            </div>

            {/* Modal Container */}
            <div
              className="relative w-full h-full flex flex-col justify-between text-white max-w-5xl mx-auto p-4 md:p-8 z-10"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Controls Row */}
              <div className="w-full flex items-center justify-between z-20 shrink-0 mb-4">
                <span className="font-mono text-xs text-white font-bold bg-black/50 border border-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
                  {selectedIdx + 1} / {filteredItems.length}
                </span>
                <button
                  onClick={() => setSelectedIdx(null)}
                  className="p-2 rounded-full bg-black/50 hover:bg-rose-600 border border-white/10 transition-all text-white cursor-pointer shadow-md shrink-0 backdrop-blur-sm"
                  title="Fermer (Echap)"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation Chevrons Area - Vertically centered overlay over background */}
              <div className="flex-grow flex items-center justify-between w-full pointer-events-none py-4">
                {/* Left Navigation Chevron */}
                <button
                  onClick={handlePrev}
                  className="p-3 sm:p-4 rounded-full bg-black/50 hover:bg-white/20 active:bg-white/35 border border-white/10 transition-all text-white cursor-pointer shadow-2xl backdrop-blur-md pointer-events-auto"
                  title="Photo précédente"
                >
                  <ChevronLeft className="h-6 w-6 sm:h-7 sm:w-7" />
                </button>

                {/* Right Navigation Chevron */}
                <button
                  onClick={handleNext}
                  className="p-3 sm:p-4 rounded-full bg-black/50 hover:bg-white/20 active:bg-white/35 border border-white/10 transition-all text-white cursor-pointer shadow-2xl backdrop-blur-md pointer-events-auto"
                  title="Photo suivante"
                >
                  <ChevronRight className="h-6 w-6 sm:h-7 sm:w-7" />
                </button>
              </div>

              {/* Text Infos (Floating at Bottom with high z-index and 50% transparency) */}
              <div className="w-full bg-black/50 border border-white/10 p-4 md:p-6 rounded-2xl space-y-2.5 shrink-0 backdrop-blur-md text-left shadow-2xl z-20 mt-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-brand-accent bg-brand-accent/20 border border-brand-accent/30 px-3 py-1 rounded-full">
                    {filteredItems[selectedIdx].category}
                  </span>
                  <div className="flex items-center space-x-1.5 text-xs text-stone-300 font-sans">
                    <MapPin className="h-3.5 w-3.5 text-brand-accent shrink-0" />
                    <span>{filteredItems[selectedIdx].location}</span>
                  </div>
                </div>

                {/* Title & Description */}
                <div className="space-y-1">
                  <h3 className="font-serif font-bold text-lg sm:text-xl md:text-2xl text-white tracking-tight leading-tight">
                    {filteredItems[selectedIdx].title}
                  </h3>
                  <p className="text-xs sm:text-sm md:text-base text-stone-200 font-sans leading-relaxed">
                    {filteredItems[selectedIdx].description}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
