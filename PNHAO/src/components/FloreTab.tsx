/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FLORA_DATA, VEGETATION_STAGES } from '../data';
import { getAssetUrl } from '../utils';
import { Search, SlidersHorizontal, Leaf, Sparkles, AlertTriangle, Check, BookOpen, Layers, Eye, X, ChevronLeft, ChevronRight, Compass, Loader2 } from 'lucide-react';
import { FloraItem } from '../types';

export const FLORA_IMAGES: Record<string, { image: string, gallery: string[] }> = {
  "flo-1": {
    image: "/images/flore/thymus_maroccanus_1784114509918.jpg",
    gallery: ["/images/flore/thymus_maroccanus_1784114509918.jpg"]
  },
  "flo-2": {
    image: "/images/flore/saxifraga_longifolia_1784114522079.jpg",
    gallery: ["/images/flore/saxifraga_longifolia_1784114522079.jpg"]
  },
  "flo-3": {
    image: "/images/flore/teucrium_mideltense_1784114535027.jpg",
    gallery: ["/images/flore/teucrium_mideltense_1784114535027.jpg"]
  },
  "flo-4": {
    image: "/images/flore/marrubium_litardierei_1784114547260.jpg",
    gallery: ["/images/flore/marrubium_litardierei_1784114547260.jpg"]
  },
  "flo-5": {
    image: "/images/flore/carum_atlanticum_1784114558726.jpg",
    gallery: ["/images/flore/carum_atlanticum_1784114558726.jpg"]
  },
  "flo-6": {
    image: "/images/flore/arenaria_dyris_1784114570208.jpg",
    gallery: ["/images/flore/arenaria_dyris_1784114570208.jpg"]
  },
  "flo-7": {
    image: "/images/flore/thymus_saturejoides_1784114583855.jpg",
    gallery: ["/images/flore/thymus_saturejoides_1784114583855.jpg"]
  },
  "flo-8": {
    image: "/images/flore/lavandula_dentata1_5ed5f5.jpg",
    gallery: [
      "/images/flore/lavandula_dentata1_5ed5f5.jpg",
      "/images/flore/lavandula_dentata2_66c738.jpg",
      "/images/flore/lavandula_dentata3_8a6ac0.jpg"
    ]
  },
  "flo-9": {
    image: "/images/flore/mentha_longifolia_1784114603247.jpg",
    gallery: ["/images/flore/mentha_longifolia_1784114603247.jpg"]
  },
  "flo-10": {
    image: "/images/flore/buxus_balearica_1784114615141.jpg",
    gallery: ["/images/flore/buxus_balearica_1784114615141.jpg"]
  },
  "flo-11": {
    image: "/images/flore/ranunculus_mgounicus_1784114628960.jpg",
    gallery: ["/images/flore/ranunculus_mgounicus_1784114628960.jpg"]
  },
  "flo-12": {
    image: "/images/flore/deverra_juncea_1784114641094.jpg",
    gallery: ["/images/flore/deverra_juncea_1784114641094.jpg"]
  },
  "flo-13": {
    image: "/images/flore/astragalus_maireanus_1784114652366.jpg",
    gallery: ["/images/flore/astragalus_maireanus_1784114652366.jpg"]
  },
  "flo-14": {
    image: "/images/flore/laserpitium_emilianum_1784114665445.jpg",
    gallery: ["/images/flore/laserpitium_emilianum_1784114665445.jpg"]
  },
  "flo-15": {
    image: "/images/flore/cedrus_atlantica1_c50f03.jpg",
    gallery: [
      "/images/flore/cedrus_atlantica1_c50f03.jpg",
      "/images/flore/cedrus_atlantica2_3aed6d.jpg",
      "/images/flore/cedrus_atlantica3_5e6510.jpg"
    ]
  },
  "flo-16": {
    image: "/images/flore/juniperus_thurifera1_841ce9.jpg",
    gallery: [
      "/images/flore/juniperus_thurifera1_841ce9.jpg",
      "/images/flore/juniperus_thurifera2_8d9234.jpg",
      "/images/flore/juniperus_thurifera3_2d4c60.jpg"
    ]
  },
  "flo-17": {
    image: "/images/flore/quercus_ilex1_91c254.jpg",
    gallery: [
      "/images/flore/quercus_ilex1_91c254.jpg",
      "/images/flore/quercus_ilex2_070a12.jpg",
      "/images/flore/quercus_ilex3_5fd7d6.jpg"
    ]
  },
  "flo-18": {
    image: "/images/flore/abies_maroccana_1_1784115608724.jpg",
    gallery: [
      "/images/flore/abies_maroccana_1_1784115608724.jpg"
    ]
  },
  "flo-19": {
    image: "/images/flore/spartium_junceum1_975890.jpg",
    gallery: [
      "/images/flore/spartium_junceum1_975890.jpg",
      "/images/flore/spartium_junceum2_bd4559.jpg",
      "/images/flore/spartium_junceum3_09473a.jpg"
    ]
  },
  "flo-20": {
    image: "/images/flore/tamaris_tamarix_africana1_c23014.jpg",
    gallery: [
      "/images/flore/tamaris_tamarix_africana1_c23014.jpg",
      "/images/flore/tamaris_tamarix_africana2_87e823.jpg",
      "/images/flore/tamaris_tamarix_africana3_9d7dba.jpg"
    ]
  },
  "flo-21": {
    image: "/images/flore/arganier_argania_spinosa1_9e45fd.jpg",
    gallery: [
      "/images/flore/arganier_argania_spinosa1_9e45fd.jpg",
      "/images/flore/arganier_argania_spinosa2_709cf1.jpg",
      "/images/flore/arganier_argania_spinosa3_bfcafa.jpg",
      "/images/flore/arganier_argania_spinosa4_b3bd57.jpg"
    ]
  }
};

export default function FloreTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStage, setSelectedStage] = useState<number>(2); // Default to Montagnard
  const [selectedFlora, setSelectedFlora] = useState<FloraItem | null>(null);
  const [modalImageIdx, setModalImageIdx] = useState<number>(0);
  const [isImageLoading, setIsImageLoading] = useState<boolean>(false);

  const currentImageUrl = useMemo(() => {
    if (!selectedFlora) return '';
    const imageInfo = FLORA_IMAGES[selectedFlora.id] || { image: "", gallery: [] };
    const gallery = imageInfo.gallery.length > 0 ? imageInfo.gallery : [imageInfo.image];
    return gallery[modalImageIdx] || '';
  }, [selectedFlora, modalImageIdx]);

  useEffect(() => {
    if (currentImageUrl) {
      setIsImageLoading(true);
    } else {
      setIsImageLoading(false);
    }
  }, [currentImageUrl]);

  const filteredFlora = useMemo(() => {
    return FLORA_DATA.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.scientificName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.habitat.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [searchQuery, selectedCategory]);

  useEffect(() => {
    if (!selectedFlora) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        const index = filteredFlora.findIndex(item => item.id === selectedFlora.id);
        if (index !== -1) {
          const nextItem = filteredFlora[(index + 1) % filteredFlora.length];
          setSelectedFlora(nextItem);
          setModalImageIdx(0);
        }
      } else if (e.key === 'ArrowLeft') {
        const index = filteredFlora.findIndex(item => item.id === selectedFlora.id);
        if (index !== -1) {
          const prevItem = filteredFlora[(index - 1 + filteredFlora.length) % filteredFlora.length];
          setSelectedFlora(prevItem);
          setModalImageIdx(0);
        }
      } else if (e.key === 'Escape') {
        setSelectedFlora(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedFlora, filteredFlora]);

  const openFloraDetails = (item: FloraItem) => {
    setSelectedFlora(item);
    setModalImageIdx(0);
  };

  const nextModalImage = (gallery: string[]) => {
    setModalImageIdx((prev) => (prev + 1) % gallery.length);
  };

  const prevModalImage = (gallery: string[]) => {
    setModalImageIdx((prev) => (prev - 1 + gallery.length) % gallery.length);
  };

  return (
    <div className="space-y-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1.5">
          <span className="text-xs font-bold font-sans uppercase tracking-widest text-brand-accent">Patrimoine Sylvestre & Endémisme</span>
          <h2 className="font-serif font-bold text-3xl sm:text-4xl text-brand-text tracking-tight">La Flore & les Écosystèmes Forestiers</h2>
          <p className="text-sm text-stone-500 max-w-2xl font-sans">
            La richesse botanique du PNHAO s'élève à 234 taxons de plantes vasculaires. C'est le royaume du majestueux Cèdre de l'Atlas et de nombreuses plantes aromatiques très convoitées.
          </p>
        </div>
      </div>

      {/* Grid of the 4 Vegetation Stages */}
      <section className="bg-white border border-brand-light-gray rounded-[36px] p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex items-center space-x-3">
          <Layers className="h-5 w-5 text-brand-accent" />
          <h3 className="font-serif font-bold text-xl text-brand-text">Les 4 Étages Climatologiques du Parc</h3>
        </div>
        <p className="text-xs sm:text-sm text-stone-600 font-sans leading-relaxed">
          La grande amplitude d'altitude (de 1654 m à 3164 m) couplée aux variations thermiques engendre un étagement végétal d'une pure beauté. Sélectionnez un étage ci-dessous pour inspecter son biotope :
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {VEGETATION_STAGES.map((stage, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedStage(idx)}
              className={`p-5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between h-[160px] ${
                selectedStage === idx
                  ? 'bg-brand-primary border-brand-primary text-white shadow-md transform -translate-y-1'
                  : 'bg-brand-sand/40 border-brand-light-gray text-brand-text hover:bg-brand-sand hover:border-stone-300'
              }`}
            >
              <div className="space-y-1">
                <span className={`text-[10px] font-mono uppercase font-bold tracking-wider ${selectedStage === idx ? 'text-brand-accent' : 'text-stone-400'}`}>
                  {stage.altitude}
                </span>
                <h4 className="font-serif font-bold text-sm line-clamp-2">
                  {stage.name}
                </h4>
              </div>
              <div className="flex items-center justify-between mt-4">
                <span className="text-xs font-sans font-bold">
                  Part: {stage.percentage}%
                </span>
                <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-md ${selectedStage === idx ? 'bg-white/15 text-white' : 'bg-brand-sand text-brand-primary'}`}>
                  {stage.area}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Selected stage details container */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedStage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="p-5 sm:p-6 bg-brand-sand/50 rounded-2xl border border-brand-light-gray grid grid-cols-1 md:grid-cols-12 gap-4 items-center"
          >
            <div className="md:col-span-8 space-y-2">
              <span className="text-[10px] font-mono tracking-widest font-bold uppercase text-brand-accent">
                {VEGETATION_STAGES[selectedStage].altitude} • Écosystème Associé
              </span>
              <h4 className="font-serif font-bold text-lg text-brand-text">
                {VEGETATION_STAGES[selectedStage].name}
              </h4>
              <p className="text-xs sm:text-sm text-stone-600 font-sans leading-relaxed">
                {VEGETATION_STAGES[selectedStage].description}
              </p>
            </div>
            <div className="md:col-span-4 bg-white/80 rounded-xl p-4 border border-brand-light-gray text-center space-y-1.5 shadow-sm">
              <BookOpen className="h-5 w-5 text-brand-primary mx-auto" />
              <p className="text-xs font-mono font-bold text-brand-primary">Espèces Typiques</p>
              <p className="text-[11px] font-sans text-stone-500">
                {selectedStage === 2 ? "Cèdre de l'Atlas, Chêne vert, Genévrier thurifère" :
                 selectedStage === 1 ? "Chêne vert, Genévrier de Phénicie" :
                 selectedStage === 0 ? "Genévrier rouge, Buis des Baléares, Alfa" :
                 "Coussinets épineux d'altitude, Pelouses d'altitude"}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </section>

      {/* Official Flora Inventory Statistics & IUCN Table */}
      <section className="bg-white border border-brand-light-gray rounded-[40px] p-6 sm:p-10 shadow-sm space-y-6">
        <div className="space-y-2">
          <span className="text-xs font-bold font-sans uppercase tracking-widest text-brand-primary">Bilan Botanique Officiel</span>
          <h3 className="font-serif font-bold text-2xl sm:text-3xl text-brand-text tracking-tight">Statistiques de Flore Sauvage & Raretés</h3>
          <p className="text-sm text-stone-500 max-w-3xl font-sans">
            L'inventaire officiel de la flore du Parc National du Haut Atlas Oriental dénombre un total de <strong className="text-brand-primary">525 espèces</strong> de plantes vasculaires, dont <strong className="text-brand-primary">85 espèces endémiques ou d'une rareté critique</strong> au niveau mondial ou national.
          </p>
        </div>

        {/* Highlight Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 pt-2">
          <div className="bg-brand-sand/30 border border-brand-light-gray/60 p-5 rounded-2xl text-center space-y-1">
            <span className="text-3xl sm:text-4xl font-serif font-bold text-brand-primary">525</span>
            <span className="text-[11px] uppercase font-sans font-bold text-stone-400 block tracking-wider">Espèces totales</span>
          </div>
          <div className="bg-brand-sand/30 border border-brand-light-gray/60 p-5 rounded-2xl text-center space-y-1">
            <span className="text-3xl sm:text-4xl font-serif font-bold text-brand-primary">85</span>
            <span className="text-[11px] uppercase font-sans font-bold text-stone-400 block tracking-wider">Endémiques / Rares</span>
          </div>
          <div className="bg-brand-sand/30 border border-brand-light-gray/60 p-5 rounded-2xl text-center space-y-1">
            <span className="text-3xl sm:text-4xl font-serif font-bold text-brand-primary">15</span>
            <span className="text-[11px] uppercase font-sans font-bold text-stone-400 block tracking-wider">Plantes Médicinales</span>
          </div>
          <div className="bg-brand-sand/30 border border-brand-light-gray/60 p-5 rounded-2xl text-center space-y-1">
            <span className="text-3xl sm:text-4xl font-serif font-bold text-brand-primary">4</span>
            <span className="text-[11px] uppercase font-sans font-bold text-stone-400 block tracking-wider">Étages Végétaux</span>
          </div>
        </div>

        {/* Key Endemic & Protected Species List */}
        <div className="bg-brand-sand/30 border border-brand-light-gray/80 rounded-2xl p-5 sm:p-6 space-y-4">
          <h4 className="font-serif font-bold text-sm text-brand-primary">Répartition de la Rareté et Menaces Botaniques</h4>
          <p className="text-xs text-stone-600 font-sans leading-relaxed">
            Les espèces phares du parc subissent de fortes pressions climatiques et anthropiques (surpâturage et prélèvement excessif pour l'artisanat ou les huiles essentielles). Le parc assure le suivi rigoureux de ces espèces prioritaires :
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs font-sans">
            <div className="bg-white p-3.5 border border-brand-light-gray/60 rounded-xl space-y-1">
              <span className="font-bold text-brand-primary">Espèces Endémiques Locales :</span>
              <p className="text-stone-500">Germandrée de Midelt (Teucrium mideltense), Astragale de l'Atlas (Astragalus maireanus).</p>
            </div>
            <div className="bg-white p-3.5 border border-brand-light-gray/60 rounded-xl space-y-1">
              <span className="font-bold text-brand-primary">Espèces en Danger Critique :</span>
              <p className="text-stone-500">Cèdre de l'Atlas (Cedrus atlantica) en recul, Genévrier thurifère (Juniperus thurifera).</p>
            </div>
            <div className="bg-white p-3.5 border border-brand-light-gray/60 rounded-xl space-y-1">
              <span className="font-bold text-brand-primary">Raretés Mondiales Présentes :</span>
              <p className="text-stone-500">Buis des Baléares (Buxus balearica) localisé, Saxifrage à longues feuilles.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Flora Explorer (Search & Categories) */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <h3 className="font-serif font-bold text-xl text-brand-text self-start">
            Herbier Virtuel du Parc
          </h3>
        </div>

        <section className="bg-brand-sand/50 border border-brand-light-gray rounded-[28px] p-5 flex flex-col lg:flex-row lg:items-center gap-4 shadow-sm">
          {/* Search bar */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-brand-primary/60">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              placeholder="Rechercher une herbe, fleur, arbre, biotope, nom scientifique..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-brand-light-gray rounded-2xl py-3 pl-11 pr-4 text-sm text-brand-text placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all shadow-inner"
            />
          </div>

          {/* Filtering */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="text-brand-primary/80 flex items-center space-x-1.5 text-xs font-bold font-sans uppercase tracking-wider">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Catégorie :</span>
            </div>

            <div className="flex flex-wrap gap-1 bg-white p-1 rounded-xl border border-brand-light-gray shadow-sm">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === 'all' ? 'bg-brand-primary text-white shadow-sm' : 'text-brand-text/75 hover:text-brand-primary'
                }`}
              >
                Tous
              </button>
              <button
                onClick={() => setSelectedCategory('endemic')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === 'endemic' ? 'bg-brand-primary text-white shadow-sm' : 'text-brand-text/75 hover:text-brand-primary'
                }`}
              >
                Endémiques
              </button>
              <button
                onClick={() => setSelectedCategory('medicinal')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === 'medicinal' ? 'bg-brand-primary text-white shadow-sm' : 'text-brand-text/75 hover:text-brand-primary'
                }`}
              >
                Médicinales & Aromatiques (PAM)
              </button>
              <button
                onClick={() => setSelectedCategory('protected')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === 'protected' ? 'bg-brand-primary text-white shadow-sm' : 'text-brand-text/75 hover:text-brand-primary'
                }`}
              >
                Menacées / Protégées
              </button>
            </div>
          </div>
        </section>

        {/* Results Grid */}
        <div>
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredFlora.map((item) => {
                const imageInfo = FLORA_IMAGES[item.id] || { image: "/images/flore/photo-1501004318641-b39e6451bec6_006db8.jpg", gallery: [] };
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white border border-brand-light-gray rounded-[28px] overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Flora Card Image */}
                      <div 
                        className="h-[200px] w-full relative overflow-hidden bg-brand-sand cursor-pointer group/card-img"
                        onClick={() => openFloraDetails(item)}
                        title={`Cliquez pour voir la fiche détaillée de ${item.name}`}
                      >
                        <img
                          src={getAssetUrl(imageInfo.image)}
                          alt={item.name}
                          className="w-full h-full object-cover transform hover:scale-105 group-hover/card-img:scale-110 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover/card-img:bg-black/25 transition-colors duration-300 flex items-center justify-center">
                          <Eye className="text-white h-8 w-8 opacity-0 group-hover/card-img:opacity-100 transition-opacity duration-300 drop-shadow-md" />
                        </div>
                        <div className="absolute top-4 left-4">
                          <span className={`text-[10px] font-bold font-sans uppercase px-2.5 py-1 rounded-full border shadow-sm backdrop-blur-md ${
                            item.category === 'endemic' ? 'bg-brand-accent/15 text-brand-accent border-brand-accent/20' :
                            item.category === 'medicinal' ? 'bg-brand-sand text-brand-primary border-brand-light-gray' :
                            'bg-rose-50 text-rose-800 border-rose-100'
                          }`}>
                            {item.category === 'endemic' ? 'Endémique Maroc' :
                             item.category === 'medicinal' ? 'Plante Aromatique' :
                             'Menacée (UICN)'}
                          </span>
                        </div>
                        {item.status && (
                          <div className="absolute top-4 right-4">
                            <span className="text-[9px] text-stone-700 font-sans font-bold bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full border border-brand-light-gray shadow-sm">
                              {item.status.split(" (")[0]}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="p-6 space-y-3">
                        <div className="space-y-1">
                          <h4 className="font-serif font-bold text-lg text-brand-text tracking-tight">
                            {item.name}
                          </h4>
                          <p className="text-xs font-mono text-brand-primary italic">
                            {item.scientificName}
                          </p>
                        </div>

                        <p className="text-xs sm:text-sm text-stone-600 font-sans leading-relaxed line-clamp-3">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <div className="px-6 pb-6 pt-0 space-y-4">
                      <div className="pt-4 border-t border-brand-light-gray space-y-2 mt-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-stone-400 font-sans">Milieu de prédilection :</span>
                          <span className="text-brand-text font-bold font-sans truncate max-w-[170px]" title={item.habitat}>
                            {item.habitat}
                          </span>
                        </div>

                        {item.status && (
                          <div className="flex items-center justify-between">
                            <span className="text-stone-400 font-sans">Index UICN :</span>
                            <span className={`text-[10px] font-bold font-sans px-2.5 py-1 rounded-full border ${
                              item.status.includes('CR') || item.status.includes('EN') || item.status.includes('fortement')
                                ? 'bg-rose-50 text-rose-700 border-rose-100'
                                : 'bg-brand-sand text-brand-primary border-brand-light-gray'
                            }`}>
                              {item.status}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Interactive Button */}
                      <button
                        onClick={() => openFloraDetails(item)}
                        className="w-full py-2.5 bg-brand-sand hover:bg-brand-primary hover:text-white transition-all text-brand-primary font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm border border-brand-light-gray"
                      >
                        <Eye className="h-4 w-4" />
                        <span>Fiche Détaillée & Photos</span>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>

          {filteredFlora.length === 0 && (
            <div className="text-center py-16 bg-white border border-brand-light-gray rounded-[32px] p-8">
              <Leaf className="h-10 w-10 text-stone-300 mx-auto mb-3" />
              <p className="text-stone-500 font-sans text-sm font-medium">
                Aucune espèce de fleur ou de plante ne correspond à votre recherche.
              </p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                className="mt-4 px-4 py-2 text-xs bg-brand-sand text-brand-primary hover:bg-brand-light-gray transition-colors rounded-xl font-bold"
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Interactive Detail Modal Popup */}
      <AnimatePresence>
        {selectedFlora && (() => {
          const imageInfo = FLORA_IMAGES[selectedFlora.id] || { image: "/images/flore/photo-1501004318641-b39e6451bec6_006db8.jpg", gallery: [] };
          const gallery = imageInfo.gallery.length > 0 ? imageInfo.gallery : [imageInfo.image];
          const hasGallery = gallery.length > 1;

          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-md flex items-center justify-center p-4 pt-16 sm:pt-4 overflow-y-auto"
              onClick={() => setSelectedFlora(null)}
            >
              {/* Top center floating navigation buttons */}
              <div 
                className="fixed top-0 left-0  w-full sm:w-auto sm:top-6 sm:left-1/2 sm:-translate-x-1/2 z-[110] flex items-center justify-between sm:justify-start sm:space-x-3 bg-[#1e2320]/95 border-b sm:border border-[#3e4841]/50 sm:rounded-full shadow-2xl text-stone-100 backdrop-blur-md transition-all hover:border-brand-accent/50 px-4 sm:px-5 py-2 sm:py-2.5 h-11 sm:h-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => {
                    const index = filteredFlora.findIndex(item => item.id === selectedFlora.id);
                    if (index !== -1) {
                      const prevItem = filteredFlora[(index - 1 + filteredFlora.length) % filteredFlora.length];
                      setSelectedFlora(prevItem);
                      setModalImageIdx(0);
                    }
                  }}
                  className="p-1 hover:bg-brand-accent hover:text-white rounded-full transition-all cursor-pointer flex items-center justify-center bg-white/5 border border-white/10 active:scale-95 text-stone-200"
                  title="Flore Précédente (Flèche Gauche)"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="flex items-center justify-center space-x-2 select-none">
                  <span className="text-[9px] uppercase tracking-widest font-sans font-bold text-stone-400 text-center">FLORE</span>
                  <span className="text-xs font-mono font-bold text-brand-accent leading-none text-center">
                    {filteredFlora.findIndex(item => item.id === selectedFlora.id) + 1} / {filteredFlora.length}
                  </span>
                </div>
                <button
                  onClick={() => {
                    const index = filteredFlora.findIndex(item => item.id === selectedFlora.id);
                    if (index !== -1) {
                      const nextItem = filteredFlora[(index + 1) % filteredFlora.length];
                      setSelectedFlora(nextItem);
                      setModalImageIdx(0);
                    }
                  }}
                  className="p-1 hover:bg-brand-accent hover:text-white rounded-full transition-all cursor-pointer flex items-center justify-center bg-white/5 border border-white/10 active:scale-95 text-stone-200"
                  title="Flore Suivante (Flèche Droite)"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Sidebar navigation arrows for large screens */}
              <div className="absolute left-6 hidden xl:block z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const index = filteredFlora.findIndex(item => item.id === selectedFlora.id);
                    if (index !== -1) {
                      const prevItem = filteredFlora[(index - 1 + filteredFlora.length) % filteredFlora.length];
                      setSelectedFlora(prevItem);
                      setModalImageIdx(0);
                    }
                  }}
                  className="p-3.5 rounded-full bg-white/10 hover:bg-brand-accent text-white transition-all border border-white/20 hover:border-brand-accent cursor-pointer shadow-lg hover:scale-110 active:scale-95 flex items-center justify-center"
                  title="Flore Précédente (Raccourci : Flèche Gauche)"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
              </div>

              <motion.div
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                className="bg-white rounded-[24px] sm:rounded-[32px] overflow-hidden max-w-[95vw] w-full h-[80vh] sm:h-[85vh] max-h-[90vh] shadow-2xl border border-brand-light-gray text-brand-text flex flex-col sm:flex-row relative"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Image Section / Mini Carousel */}
                <div 
                  className="w-full sm:w-1/2 relative bg-brand-sand h-[30vh] sm:h-full flex flex-col justify-between shrink-0 select-none touch-pan-y"
                  onTouchStart={(e) => {
                    const startX = e.changedTouches[0].clientX;
                    e.currentTarget.setAttribute('data-swipe-start', String(startX));
                  }}
                  onTouchEnd={(e) => {
                    const startXStr = e.currentTarget.getAttribute('data-swipe-start');
                    if (!startXStr) return;
                    const startX = parseFloat(startXStr);
                    const endX = e.changedTouches[0].clientX;
                    const diff = startX - endX;
                    const threshold = 50;
                    if (diff > threshold) {
                      nextModalImage(gallery);
                    } else if (diff < -threshold) {
                      prevModalImage(gallery);
                    }
                  }}
                >
                  <img
                    src={getAssetUrl(gallery[modalImageIdx])}
                    alt={selectedFlora.name}
                    className="absolute inset-0 w-full h-full object-cover transition-all duration-500"
                    referrerPolicy="no-referrer"
                    onLoad={() => setIsImageLoading(false)}
                  />
                  {isImageLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/35 backdrop-blur-xs z-10 transition-all duration-300">
                      <div className="bg-stone-900/80 p-3 rounded-full shadow-lg border border-white/10 flex items-center justify-center">
                        <Loader2 className="h-6 w-6 text-brand-accent animate-spin" />
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />

                  {/* Header over Image */}
                  <div className="relative p-2.5 sm:p-4 flex flex-col sm:flex-row gap-1.5 sm:items-center justify-between">
                    <span className="text-[9px] sm:text-[11px] font-bold font-sans uppercase tracking-widest text-white bg-brand-primary px-2.5 py-0.5 sm:px-3.5 sm:py-1.5 rounded-full shadow-md w-fit">
                      {selectedFlora.category === 'endemic' ? 'Endémique Maroc' :
                       selectedFlora.category === 'medicinal' ? 'Plante Aromatique' :
                       'Menacée (UICN)'}
                    </span>
                    {selectedFlora.status && (
                      <span className="text-[8px] sm:text-[10px] font-bold font-sans text-white bg-brand-accent px-2 py-0.5 sm:px-3 sm:py-1.5 rounded-full shadow-md border border-brand-accent/20 w-fit">
                        {selectedFlora.status}
                      </span>
                    )}
                  </div>

                  {/* Carousel Nav arrows */}
                  {hasGallery && (
                    <div className="relative px-2 sm:px-3 flex justify-between items-center pointer-events-none">
                      <button
                        onClick={() => prevModalImage(gallery)}
                        className="p-1 sm:p-2 rounded-full bg-black/55 hover:bg-black/80 text-white transition-all cursor-pointer pointer-events-auto border border-white/15"
                      >
                        <ChevronLeft className="h-4 w-4 sm:h-6 sm:w-6" />
                      </button>
                      <button
                        onClick={() => nextModalImage(gallery)}
                        className="p-1 sm:p-2 rounded-full bg-black/55 hover:bg-black/80 text-white transition-all cursor-pointer pointer-events-auto border border-white/15"
                      >
                        <ChevronRight className="h-4 w-4 sm:h-6 sm:w-6" />
                      </button>
                    </div>
                  )}

                  {/* Slide count indicator */}
                  <div className="relative p-2.5 sm:p-4 text-[10px] sm:text-xs font-sans text-stone-200 flex justify-between items-end gap-1">
                    <div className="flex items-center space-x-1 sm:space-x-1.5 bg-black/45 backdrop-blur-sm px-1.5 py-0.5 sm:px-3 sm:py-1.5 rounded-md sm:rounded-lg text-[8px] sm:text-[11px] border border-white/10">
                      <Compass className="h-3 w-3 sm:h-4 sm:w-4 text-brand-accent" />
                      <span className="truncate max-w-[50px] sm:max-w-none">PNHAO</span>
                    </div>
                    {hasGallery && (
                      <span className="bg-black/60 px-1.5 py-0.5 sm:px-3 sm:py-1 rounded-md font-mono text-[8px] sm:text-[11px]">
                        {modalImageIdx + 1} / {gallery.length}
                      </span>
                    )}
                  </div>
                </div>

                {/* Content Section */}
                <div className="w-full sm:w-1/2 p-4 sm:p-10 flex flex-col justify-between overflow-y-auto flex-1 min-h-0">
                  <div className="space-y-4 sm:space-y-6">
                    {/* Header */}
                    <div className="flex justify-between items-start gap-2 sm:gap-4 border-b border-brand-light-gray pb-2.5 sm:pb-4">
                      <div>
                        <h3 className="font-serif font-bold text-base sm:text-3xl md:text-4xl text-brand-primary leading-tight">
                          {selectedFlora.name}
                        </h3>
                        <p className="text-xs sm:text-base md:text-lg font-mono text-brand-accent italic font-semibold mt-0.5 sm:mt-1">
                          {selectedFlora.scientificName}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedFlora(null)}
                        className="p-1.5 sm:p-2 rounded-full hover:bg-brand-sand text-stone-400 hover:text-brand-text transition-colors cursor-pointer border border-brand-light-gray shrink-0"
                      >
                        <X className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                    </div>

                    {/* Description */}
                    <div className="space-y-1 sm:space-y-2.5">
                      <h5 className="text-[10px] sm:text-xs font-bold font-sans uppercase tracking-wider text-brand-primary">Présentation</h5>
                      <p className="text-[11px] sm:text-sm md:text-base text-stone-700 font-sans leading-relaxed">
                        {selectedFlora.description}
                      </p>
                    </div>

                    {/* Metadata list */}
                    <div className="bg-brand-sand/50 p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-brand-light-gray space-y-2.5 sm:space-y-4 text-[10px] sm:text-xs md:text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-stone-400 font-sans">Milieu & Habitat :</span>
                        <span className="text-brand-text font-bold font-sans text-right max-w-[100px] sm:max-w-[220px] truncate" title={selectedFlora.habitat}>
                          {selectedFlora.habitat}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-stone-400 font-sans">Catégorie :</span>
                        <span className="text-brand-text font-bold font-sans text-right">
                          {selectedFlora.category === 'endemic' ? 'Endémique' :
                           selectedFlora.category === 'medicinal' ? 'Médicinale' :
                           'Menacée'}
                        </span>
                      </div>
                      {selectedFlora.status && (
                        <div className="flex items-center justify-between">
                          <span className="text-stone-400 font-sans">Conservation :</span>
                          <span className="text-rose-700 font-bold font-sans text-right">
                            {selectedFlora.status}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="bg-emerald-50/50 p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-emerald-100/50 flex items-start space-x-2.5 sm:space-x-4">
                      <Sparkles className="h-4 w-4 sm:h-6 sm:w-6 text-brand-primary shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <h6 className="text-[11px] sm:text-sm font-bold text-brand-primary font-sans">Préservation</h6>
                        <p className="text-[10px] sm:text-xs md:text-sm leading-relaxed text-stone-700 font-sans">
                          Aidez à préserver cette flore inestimable en restant sur les sentiers balisés.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Close Footer */}
                  <div className="pt-4 mt-4 border-t border-brand-light-gray flex justify-end">
                    <button
                      onClick={() => setSelectedFlora(null)}
                      className="px-4 py-2 sm:px-6 sm:py-2.5 bg-brand-primary hover:bg-[#3d4d41] transition-colors text-white text-[11px] sm:text-xs font-bold font-sans rounded-xl cursor-pointer shadow-sm"
                    >
                      Fermer la Fiche
                    </button>
                  </div>
                </div>
              </motion.div>

              <div className="absolute right-6 hidden xl:block z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const index = filteredFlora.findIndex(item => item.id === selectedFlora.id);
                    if (index !== -1) {
                      const nextItem = filteredFlora[(index + 1) % filteredFlora.length];
                      setSelectedFlora(nextItem);
                      setModalImageIdx(0);
                    }
                  }}
                  className="p-3.5 rounded-full bg-white/10 hover:bg-brand-accent text-white transition-all border border-white/20 hover:border-brand-accent cursor-pointer shadow-lg hover:scale-110 active:scale-95 flex items-center justify-center"
                  title="Flore Suivante (Raccourci : Flèche Droite)"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
