/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FAUNA_DATA } from '../data';
import { getAssetUrl } from '../utils';
import { Search, SlidersHorizontal, Bird, Eye, AlertTriangle, ShieldCheck, Heart, X, ChevronLeft, ChevronRight, Compass, MapPin, Loader2 } from 'lucide-react';
import { FaunaItem } from '../types';

export const FAUNA_IMAGES: Record<string, { image: string, gallery: string[] }> = {
  "fau-1": {
    image: "/images/faune/mouflon_manchettes1_b6edba.jpg",
    gallery: [
      "/images/faune/mouflon_manchettes1_b6edba.jpg",
      "/images/faune/mouflon_manchettes2_fdccbf.jpg",
      "/images/faune/mouflon_manchettes3_10d6b4.jpg"
    ]
  },
  "fau-2": {
    image: "/images/faune/macaque_1_e1a371.jpg",
    gallery: [
      "/images/faune/macaque_1_e1a371.jpg",
      "/images/faune/macaque_2_da4814.jpg",
      "/images/faune/macaque_3_c1860e.jpg",
      "/images/faune/macaque_4_e4f748.jpg",
      "/images/faune/macaque_5_389bb5.jpg"
    ]
  },
  "fau-3": {
    image: "/images/faune/gazella_dorcas1_08e87c.jpg",
    gallery: [
      "/images/faune/gazella_dorcas1_08e87c.jpg",
      "/images/faune/gazella_dorcas2_942ddc.jpg",
      "/images/faune/gazella_dorcas3_f003f9.jpg"
    ]
  },
  "fau-4": {
    image: "/images/faune/lutra_lutra1_51887e.jpg",
    gallery: [
      "/images/faune/lutra_lutra1_51887e.jpg",
      "/images/faune/lutra_lutra2_7c5f77.jpg",
      "/images/faune/lutra_lutra3_087199.jpg",
      "/images/faune/lutra_lutra4_fa02b3.jpg",
      "/images/faune/lutra_lutra5_49c172.jpg"
    ]
  },
  "fau-5": {
    image: "/images/faune/porc-epic_3b6595.webp",
    gallery: [
      "/images/faune/porc-epic_3b6595.webp"
    ]
  },
  "fau-6": {
    image: "/images/faune/aigle_royal_1_96b6c9.jpg",
    gallery: [
      "/images/faune/aigle_royal_1_96b6c9.jpg",
      "/images/faune/aigle_royal_2_d1a951.jpg"
    ]
  },
  "fau-7": {
    image: "/images/faune/photo-1528114039593-4366cc08227d_cd76b6.jpg",
    gallery: [
      "/images/faune/photo-1528114039593-4366cc08227d_199d97.jpg"
    ]
  },
  "fau-8": {
    image: "/images/faune/parus_major_1_62b1c6.jpg",
    gallery: [
      "/images/faune/parus_major_1_62b1c6.jpg",
      "/images/faune/parus_major_2_cf5cc5.jpg"
    ]
  },
  "fau-9": {
    image: "/images/faune/tadorne-casarca4_390718.jpg",
    gallery: [
      "/images/faune/tadorne-casarca3_782405.jpg",
      "/images/faune/tadorne-casarca_98c436.jpg",
      "/images/faune/tadorne-casarca1_c50c97.jpg"
    ]
  },
  "fau-10": {
    image: "/images/faune/neophron_percnopterus_vautour_1784117973147.jpg",
    gallery: [
      "/images/faune/neophron_percnopterus_vautour_1784117973147.jpg"
    ]
  },
  "fau-11": {
    image: "/images/faune/vipera-monticola_7fd785.jpg",
    gallery: [
      "/images/faune/vipera-monticola_7fd785.jpg",
      "/images/faune/vipera-monticola1_3e8305.jpg"
    ]
  },
  "fau-12": {
    image: "/images/faune/psammodrome-vert_b4ac02.jpg",
    gallery: [
      "/images/faune/psammodrome-vert_b4ac02.jpg"
    ]
  },
  "fau-13": {
    image: "/images/faune/discoglossus-scovazzi_f09d42.jpg",
    gallery: [
      "/images/faune/discoglossus-scovazzi_f09d42.jpg"
    ]
  },
  "fau-14": {
    image: "/images/faune/testudo-graeca_ba910e.jpg",
    gallery: [
      "/images/faune/testudo-graeca_ba910e.jpg",
      "/images/faune/testudo-graeca2_2a3c7c.jpg",
      "/images/faune/testudo-graeca3_ba0c52.jpg"
    ]
  },
  "fau-15": {
    image: "/images/faune/renard_rou_1_c3b49e.jpg",
    gallery: [
      "/images/faune/renard_rou_1_c3b49e.jpg",
      "/images/faune/renard_rou_2_f1e381.jpg",
      "/images/faune/renard_rou_3_e8f74d.jpg"
    ]
  },
  "fau-16": {
    image: "/images/faune/upupa_epops1_829f20.jpg",
    gallery: [
      "/images/faune/upupa_epops1_829f20.jpg",
      "/images/faune/upupa_epops2_d1acf4.jpg",
      "/images/faune/upupa_epops3_e4ad22.jpg",
      "/images/faune/upupa_epops4_df4886.jpg",
      "/images/faune/upupa_epops5_b61d41.jpg"
    ]
  },
  "fau-17": {
    image: "/images/faune/alectoris_barbara1_d4bbae.jpg",
    gallery: [
      "/images/faune/alectoris_barbara1_d4bbae.jpg",
      "/images/faune/alectoris_barbara2_a63e93.jpg",
      "/images/faune/alectoris_barbara3_b74520.jpg",
      "/images/faune/alectoris_barbara4_91f64b.jpg",
      "/images/faune/alectoris_barbara5_7f67fd.jpg"
    ]
  },
  "fau-18": {
    image: "/images/faune/cerf_de_berberie1_232788.jpg",
    gallery: [
      "/images/faune/cerf_de_berberie1_232788.jpg",
      "/images/faune/cerf_de_berberie2_2d1a7f.jpg",
      "/images/faune/cervus_elaphus_barbarus_11601c.jpg"
    ]
  },
  "fau-19": {
    image: "/images/faune/sanglier_1_8bdbf6.jpg",
    gallery: [
      "/images/faune/sanglier_1_8bdbf6.jpg",
      "/images/faune/sanglier_2_0b76c0.jpg",
      "/images/faune/sanglier_3_d2164a.jpg"
    ]
  },
  "fau-20": {
    image: "/images/faune/corvus_corax1_d313c0.jpg",
    gallery: [
      "/images/faune/corvus_corax1_d313c0.jpg",
      "/images/faune/corvus_corax2_b7bce1.jpg",
      "/images/faune/corvus_corax3_79108a.jpg",
      "/images/faune/corvus_corax4_d535b7.jpg",
      "/images/faune/corvus_corax5_d80984.jpg",
      "/images/faune/corvus_corax6_33dc9f.jpg",
      "/images/faune/corvus_corax7_523948.jpg"
    ]
  },
  "fau-21": {
    image: "/images/faune/chouette_hulotte1_09b6fc.jpg",
    gallery: [
      "/images/faune/chouette_hulotte1_09b6fc.jpg",
      "/images/faune/chouette_hulotte2_f244e9.jpg",
      "/images/faune/chouette_hulotte3_e5ba0e.jpg"
    ]
  },
  "fau-22": {
    image: "/images/faune/dendrocopos_major_1_3758be.jpg",
    gallery: [
      "/images/faune/dendrocopos_major_1_3758be.jpg",
      "/images/faune/dendrocopos_major_2_2b2520.jpg"
    ]
  },
  "fau-23": {
    image: "/images/faune/parus_major_1_62b1c6.jpg",
    gallery: [
      "/images/faune/parus_major_1_62b1c6.jpg",
      "/images/faune/parus_major_2_cf5cc5.jpg"
    ]
  },
  "fau-24": {
    image: "/images/faune/fennec_vulpes_zerda1_0e5d88.jpg",
    gallery: [
      "/images/faune/fennec_vulpes_zerda1_0e5d88.jpg",
      "/images/faune/fennec_vulpes_zerda2_cf04d8.jpg",
      "/images/faune/fennec_vulpes_zerda3_996fb4.jpg",
      "/images/faune/fennec_vulpes_zerda4_a0efe2.jpg",
      "/images/faune/fennec_vulpes_zerda5_4e362d.jpg",
      "/images/faune/fennec_vulpes_zerda6_511006.jpg"
    ]
  },
  "fau-25": {
    image: "/images/faune/herpestes_ichneumon1_b03245.jpg",
    gallery: [
      "/images/faune/herpestes_ichneumon1_b03245.jpg",
      "/images/faune/herpestes_ichneumon2_a406fb.jpg",
      "/images/faune/herpestes_ichneumon3_ba81a4.jpg",
      "/images/faune/herpestes_ichneumon4_72a277.jpg",
      "/images/faune/herpestes_ichneumon5_dec947.jpg"
    ]
  },
  "fau-26": {
    image: "/images/faune/phoenicopterus_roseus1_2aa57d.jpg",
    gallery: [
      "/images/faune/phoenicopterus_roseus1_2aa57d.jpg",
      "/images/faune/phoenicopterus_roseus2_5b57e7.jpg",
      "/images/faune/phoenicopterus_roseus3_d24995.jpg",
      "/images/faune/phoenicopterus_roseus4_2231a8.jpg",
      "/images/faune/phoenicopterus_roseus5_7dcbea.jpg"
    ]
  },
  "fau-27": {
    image: "/images/faune/larus_michahellis1_302f06.jpg",
    gallery: [
      "/images/faune/larus_michahellis1_302f06.jpg",
      "/images/faune/larus_michahellis2_786cb7.jpg",
      "/images/faune/larus_michahellis3_0faac5.jpg",
      "/images/faune/larus_michahellis4_6197b7.jpg",
      "/images/faune/larus_michahellis5_828ba0.jpg",
      "/images/faune/larus_michahellis6_61ed7c.jpg"
    ]
  },
  "fau-28": {
    image: "/images/faune/pandion_haliaetus1_754f4c.jpg",
    gallery: [
      "/images/faune/pandion_haliaetus1_754f4c.jpg",
      "/images/faune/pandion_haliaetus2_e0971b.jpg",
      "/images/faune/pandion_haliaetus3_a6a2b5.jpg",
      "/images/faune/pandion_haliaetus4_023f08.jpg"
    ]
  },
  "fau-29": {
    image: "/images/faune/monachus_monachus1_682f1e.jpg",
    gallery: [
      "/images/faune/monachus_monachus1_682f1e.jpg",
      "/images/faune/monachus_monachus2_17eec5.jpg"
    ]
  },
  "fau-30": {
    image: "/images/faune/ichthyaetus_audouinii1_1faeb0.jpg",
    gallery: [
      "/images/faune/ichthyaetus_audouinii1_1faeb0.jpg",
      "/images/faune/ichthyaetus_audouinii2_c0c3fb.jpg",
      "/images/faune/ichthyaetus_audouinii3_052b0e.jpg"
    ]
  },
  "fau-31": {
    image: "/images/faune/outarde_houbara_1_f8b16d.jpg",
    gallery: [
      "/images/faune/outarde_houbara_1_f8b16d.jpg",
      "/images/faune/outarde_houbara_2_d4ae1f.jpg",
      "/images/faune/outarde_houbara_3_9c9233.jpg"
    ]
  },
  "fau-32": {
    image: "/images/faune/hyaena_hyaena1_369b77.jpg",
    gallery: [
      "/images/faune/hyaena_hyaena1_369b77.jpg",
      "/images/faune/hyaena_hyaena2_0e7232.jpg",
      "/images/faune/hyaena_hyaena3_62aee7.jpg"
    ]
  },
  "fau-33": {
    image: "/images/faune/genetta_genetta1_a43bb8.jpg",
    gallery: [
      "/images/faune/genetta_genetta1_a43bb8.jpg",
      "/images/faune/genetta_genetta2_b45ff7.jpg",
      "/images/faune/genetta_genetta3_a2e6f9.jpg",
      "/images/faune/genetta_genetta4_0601c8.jpg"
    ]
  },
  "fau-34": {
    image: "/images/faune/salamandra_algira_tingitana1_a1bb6f.jpg",
    gallery: [
      "/images/faune/salamandra_algira_tingitana1_a1bb6f.jpg",
      "/images/faune/salamandra_algira_tingitana2_2215bd.jpg",
      "/images/faune/salamandra_algira_tingitana3_e2f6d8.jpg",
      "/images/faune/salamandra_algira_tingitana4_96d5c1.jpg",
      "/images/faune/salamandra_algira_tingitana5_9d9cb0.jpg"
    ]
  }
};

export default function FauneTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [selectedAnimal, setSelectedAnimal] = useState<FaunaItem | null>(null);
  const [modalImageIdx, setModalImageIdx] = useState<number>(0);
  const [isImageLoading, setIsImageLoading] = useState<boolean>(false);

  const currentImageUrl = useMemo(() => {
    if (!selectedAnimal) return '';
    const imageInfo = FAUNA_IMAGES[selectedAnimal.id] || { image: "", gallery: [] };
    const gallery = imageInfo.gallery.length > 0 ? imageInfo.gallery : [imageInfo.image];
    return gallery[modalImageIdx] || '';
  }, [selectedAnimal, modalImageIdx]);

  useEffect(() => {
    if (currentImageUrl) {
      setIsImageLoading(true);
    } else {
      setIsImageLoading(false);
    }
  }, [currentImageUrl]);

  const filteredFauna = useMemo(() => {
    return FAUNA_DATA.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.scientificName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.habitat.toLowerCase().includes(searchQuery.toLowerCase());

      let matchesGroup = true;
      if (selectedGroup !== 'all') {
        if (selectedGroup === 'endemic') {
          matchesGroup = item.isEndemic;
        } else {
          matchesGroup = item.group === selectedGroup;
        }
      }
      return matchesSearch && matchesGroup;
    });
  }, [searchQuery, selectedGroup]);

  useEffect(() => {
    if (!selectedAnimal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        const index = filteredFauna.findIndex(item => item.id === selectedAnimal.id);
        if (index !== -1) {
          const nextItem = filteredFauna[(index + 1) % filteredFauna.length];
          setSelectedAnimal(nextItem);
          setModalImageIdx(0);
        }
      } else if (e.key === 'ArrowLeft') {
        const index = filteredFauna.findIndex(item => item.id === selectedAnimal.id);
        if (index !== -1) {
          const prevItem = filteredFauna[(index - 1 + filteredFauna.length) % filteredFauna.length];
          setSelectedAnimal(prevItem);
          setModalImageIdx(0);
        }
      } else if (e.key === 'Escape') {
        setSelectedAnimal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedAnimal, filteredFauna]);

  const openAnimalDetails = (animal: FaunaItem) => {
    setSelectedAnimal(animal);
    setModalImageIdx(0);
  };

  const nextModalImage = (gallery: string[]) => {
    setModalImageIdx((prev) => (prev + 1) % gallery.length);
  };

  const prevModalImage = (gallery: string[]) => {
    setModalImageIdx((prev) => (prev - 1 + gallery.length) % gallery.length);
  };

  return (
    <div className="space-y-10">
      {/* Introduction */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1.5">
          <span className="text-xs font-bold font-sans uppercase tracking-widest text-brand-accent">Richesse Ornithologique & Mammalogique</span>
          <h2 className="font-serif font-bold text-3xl sm:text-4xl text-brand-text tracking-tight">La Faune Sauvage du Haut Atlas</h2>
          <p className="text-sm text-stone-500 max-w-2xl font-sans">
            Des falaises escarpées aux lacs bleus, découvrez les animaux remarquables qui peuplent le Parc National. Un sanctuaire d'altitude pour le Mouflon, le Magot et les grands rapaces.
          </p>
        </div>
      </div>

      {/* Featured Spotlight: Mouflon à manchettes */}
      {!searchQuery && selectedGroup === 'all' && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#2D342F] rounded-[40px] overflow-hidden shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-6 border border-brand-primary/20"
        >
          <div className="lg:col-span-5 h-[320px] lg:h-auto relative">
            <img
              src={getAssetUrl("/images/faune/mouflon_manchettes_1783949869486.jpg")}
              alt="Mouflon à manchettes du Haut Atlas"
              className="w-full h-full object-cover transform hover:scale-102 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
            <div className="absolute top-4 left-4 bg-brand-accent text-white text-[10px] font-bold font-sans uppercase tracking-widest px-3 py-1.5 rounded-full shadow-md">
              Emblème du Parc
            </div>
          </div>
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center text-stone-100 space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center space-x-2 text-brand-accent">
                <Heart className="h-4 w-4 fill-brand-accent" />
                <span className="text-xs font-bold uppercase tracking-widest block font-sans">Espèce Phare Protégée</span>
              </div>
              <h3 className="font-serif font-bold text-3xl text-white tracking-tight">Le Mouflon à manchettes</h3>
              <p className="text-xs font-mono text-stone-300 italic">Ammotragus lervia</p>
            </div>
            <p className="text-sm text-stone-300 leading-relaxed font-sans">
              Le parc abrite l'une des dernières grandes populations viables du Maroc. Cet animal robuste est l'un des rares bovidés sauvages capables de gravir avec une agilité inouïe les falaises calcaires abruptes du massif du Djebel Ayachi. Ses cornes imposantes et sa toison d'or lui permettent de se fondre parfaitement dans le paysage de roches sédimentaires.
            </p>
            <div className="flex flex-wrap gap-2.5 pt-2 items-center">
              <span className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white/10 text-stone-200 text-xs font-semibold border border-white/10">
                <AlertTriangle className="h-3.5 w-3.5 text-brand-accent animate-pulse" />
                <span>Classification UICN : Vulnérable (VU)</span>
              </span>
              <span className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white/10 text-stone-200 text-xs font-semibold border border-white/10">
                <ShieldCheck className="h-3.5 w-3.5 text-brand-accent" />
                <span>Statut : Strictement protégé</span>
              </span>
              <button
                onClick={() => {
                  const item = FAUNA_DATA.find(f => f.id === 'fau-1');
                  if (item) openAnimalDetails(item);
                }}
                className="px-5 py-2 bg-brand-accent hover:bg-amber-600 transition-colors text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 cursor-pointer"
              >
                <Eye className="h-3.5 w-3.5" />
                <span>Voir en Grand</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Interactive Controls (Search & Filters) */}
      <section className="bg-brand-sand/50 border border-brand-light-gray rounded-[28px] p-5 flex flex-col lg:flex-row lg:items-center gap-4 shadow-sm">
        {/* Search Input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-brand-primary/60">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder="Rechercher un oiseau, mammifère, reptile, habitat, nom..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-brand-light-gray rounded-2xl py-3 pl-11 pr-4 text-sm text-brand-text placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all shadow-inner"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="text-brand-primary/80 flex items-center space-x-1.5 text-xs font-bold font-sans uppercase tracking-wider">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Groupe :</span>
          </div>

          <div className="flex flex-wrap gap-1 bg-white p-1 rounded-xl border border-brand-light-gray shadow-sm">
            <button
              onClick={() => setSelectedGroup('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedGroup === 'all' ? 'bg-brand-primary text-white shadow-sm' : 'text-brand-text/75 hover:text-brand-primary'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setSelectedGroup('mammal')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedGroup === 'mammal' ? 'bg-brand-primary text-white shadow-sm' : 'text-brand-text/75 hover:text-brand-primary'
              }`}
            >
              Mammifères
            </button>
            <button
              onClick={() => setSelectedGroup('bird')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedGroup === 'bird' ? 'bg-brand-primary text-white shadow-sm' : 'text-brand-text/75 hover:text-brand-primary'
              }`}
            >
              Oiseaux
            </button>
            <button
              onClick={() => setSelectedGroup('endemic')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedGroup === 'endemic' ? 'bg-brand-primary text-white shadow-sm' : 'text-brand-text/75 hover:text-brand-primary'
              }`}
            >
              Espèces Endémiques
            </button>
          </div>
        </div>
      </section>

      {/* Grid List */}
      <div>
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredFauna.map((item) => {
              const imageInfo = FAUNA_IMAGES[item.id] || { image: "/images/faune/photo-1546182990-dffeafbe841d_0037df.jpg", gallery: [] };
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
                    {/* Animal Card Image */}
                    <div 
                      className="h-[200px] w-full relative overflow-hidden bg-brand-sand cursor-pointer group/card-img"
                      onClick={() => openAnimalDetails(item)}
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
                          item.group === 'mammal' ? 'bg-brand-sand/90 text-brand-primary border-brand-light-gray/40' :
                          item.group === 'bird' ? 'bg-[#EEF4F8]/90 text-[#2F5276] border-[#D5E4EF]/40' :
                          item.group === 'reptile' ? 'bg-[#F5EEF8]/90 text-[#712F76] border-[#EAD5EF]/40' :
                          'bg-[#EEF8F6]/90 text-[#2F7666] border-[#D5EFEA]/40'
                        }`}>
                          {item.group === 'mammal' ? 'Mammifère' :
                           item.group === 'bird' ? 'Oiseau' :
                           item.group === 'reptile' ? 'Reptile' : 'Amphibien'}
                        </span>
                      </div>
                      {item.isEndemic && (
                        <div className="absolute top-4 right-4">
                          <span className="bg-brand-accent/90 text-white text-[9px] font-bold font-sans px-2.5 py-1 rounded-full border border-brand-accent/20 shadow-sm">
                            Endémique Maghreb
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-6 space-y-3">
                      <div className="space-y-1">
                        <h4 className="font-serif font-bold text-lg text-brand-text tracking-tight flex items-center justify-between">
                          <span>{item.name}</span>
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
                    <div className="pt-4 border-t border-brand-light-gray space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-stone-400 font-sans">Habitat :</span>
                        <span className="text-brand-text font-bold font-sans truncate max-w-[170px]" title={item.habitat}>
                          {item.habitat}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-stone-400 font-sans">Statut de conservation :</span>
                        <span className={`text-[10px] font-bold font-sans px-2 py-0.5 rounded-full border ${
                          item.status.includes('EN') || item.status.includes('déclin') || item.status.includes('Menacé') || item.status.includes('disparition')
                            ? 'bg-rose-50 text-rose-700 border-rose-200/30'
                            : item.status.includes('VU')
                            ? 'bg-brand-accent/15 text-brand-accent border-brand-accent/20'
                            : 'bg-brand-sand text-brand-primary border-brand-light-gray'
                        }`}>
                          {item.status.split(" / ")[0]}
                        </span>
                      </div>
                    </div>

                    {/* Interactive 'More' Button */}
                    <button
                      onClick={() => openAnimalDetails(item)}
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

        {filteredFauna.length === 0 && (
          <div className="text-center py-16 bg-white border border-brand-light-gray rounded-[32px] p-8">
            <Bird className="h-10 w-10 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-500 font-sans text-sm font-medium">
              Aucun représentant de la faune ne correspond à votre recherche.
            </p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedGroup('all'); }}
              className="mt-4 px-4 py-2 text-xs bg-brand-sand text-brand-primary hover:bg-brand-light-gray transition-colors rounded-xl font-bold"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>

      {/* Interactive Detail Modal Popup */}
      <AnimatePresence>
        {selectedAnimal && (() => {
          const imageInfo = FAUNA_IMAGES[selectedAnimal.id] || { image: "/images/faune/photo-1546182990-dffeafbe841d_0037df.jpg", gallery: [] };
          const gallery = imageInfo.gallery.length > 0 ? imageInfo.gallery : [imageInfo.image];
          const hasGallery = gallery.length > 1;

          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
              onClick={() => setSelectedAnimal(null)}
            >
              {/* Top center floating navigation buttons */}
              <div 
                className="fixed top-6 left-1/2 -translate-x-1/2 z-[110] flex items-center space-x-3 bg-[#1e2320]/95 border border-[#3e4841]/50 px-5 py-2.5 rounded-full shadow-2xl text-stone-100 backdrop-blur-md transition-all hover:border-brand-accent/50"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => {
                    const index = filteredFauna.findIndex(item => item.id === selectedAnimal.id);
                    if (index !== -1) {
                      const prevItem = filteredFauna[(index - 1 + filteredFauna.length) % filteredFauna.length];
                      setSelectedAnimal(prevItem);
                      setModalImageIdx(0);
                    }
                  }}
                  className="p-1.5 hover:bg-brand-accent hover:text-white rounded-full transition-all cursor-pointer flex items-center justify-center bg-white/5 border border-white/10 active:scale-95 text-stone-200"
                  title="Animal Précédent (Flèche Gauche)"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="flex flex-col items-center px-2 min-w-[70px] select-none">
                  <span className="text-[8px] uppercase tracking-widest font-sans font-bold text-stone-400">FAUNE</span>
                  <span className="text-xs font-mono font-bold text-brand-accent leading-none mt-0.5">
                    {filteredFauna.findIndex(item => item.id === selectedAnimal.id) + 1} / {filteredFauna.length}
                  </span>
                </div>
                <button
                  onClick={() => {
                    const index = filteredFauna.findIndex(item => item.id === selectedAnimal.id);
                    if (index !== -1) {
                      const nextItem = filteredFauna[(index + 1) % filteredFauna.length];
                      setSelectedAnimal(nextItem);
                      setModalImageIdx(0);
                    }
                  }}
                  className="p-1.5 hover:bg-brand-accent hover:text-white rounded-full transition-all cursor-pointer flex items-center justify-center bg-white/5 border border-white/10 active:scale-95 text-stone-200"
                  title="Animal Suivant (Flèche Droite)"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Sidebar navigation arrows for large screens */}
              <div className="absolute left-6 hidden xl:block z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const index = filteredFauna.findIndex(item => item.id === selectedAnimal.id);
                    if (index !== -1) {
                      const prevItem = filteredFauna[(index - 1 + filteredFauna.length) % filteredFauna.length];
                      setSelectedAnimal(prevItem);
                      setModalImageIdx(0);
                    }
                  }}
                  className="p-3.5 rounded-full bg-white/10 hover:bg-brand-accent text-white transition-all border border-white/20 hover:border-brand-accent cursor-pointer shadow-lg hover:scale-110 active:scale-95 flex items-center justify-center"
                  title="Animal Précédent (Raccourci : Flèche Gauche)"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
              </div>

              <motion.div
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                className="bg-white rounded-[32px] overflow-hidden max-w-4xl w-full max-h-[90vh] md:max-h-[85vh] shadow-2xl border border-brand-light-gray text-brand-text flex flex-col md:flex-row relative"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Image Section / Mini Carousel */}
                <div className="md:w-1/2 relative bg-brand-sand h-[250px] md:h-auto min-h-[250px] flex flex-col justify-between shrink-0">
                  <img
                    src={getAssetUrl(gallery[modalImageIdx])}
                    alt={selectedAnimal.name}
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
                  <div className="relative p-4 flex items-center justify-between">
                    <span className="text-[10px] font-bold font-sans uppercase tracking-widest text-white bg-brand-primary px-3 py-1 rounded-full shadow-md">
                      {selectedAnimal.group === 'mammal' ? 'Mammifère' :
                       selectedAnimal.group === 'bird' ? 'Oiseau' :
                       selectedAnimal.group === 'reptile' ? 'Reptile' : 'Amphibien'}
                    </span>
                    {selectedAnimal.isEndemic && (
                      <span className="text-[9px] font-bold font-sans text-white bg-brand-accent px-2.5 py-1 rounded-full shadow-md border border-brand-accent/20">
                        Endémique Maghreb
                      </span>
                    )}
                  </div>

                  {/* Carousel Nav arrows */}
                  {hasGallery && (
                    <div className="relative px-3 flex justify-between items-center pointer-events-none">
                      <button
                        onClick={() => prevModalImage(gallery)}
                        className="p-1.5 rounded-full bg-black/40 hover:bg-black/75 text-white transition-colors cursor-pointer pointer-events-auto border border-white/10"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => nextModalImage(gallery)}
                        className="p-1.5 rounded-full bg-black/40 hover:bg-black/75 text-white transition-colors cursor-pointer pointer-events-auto border border-white/10"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>
                  )}

                  {/* Slide count indicator */}
                  <div className="relative p-4 text-xs font-sans text-stone-200 flex justify-between items-end">
                    <div className="flex items-center space-x-1 bg-black/35 backdrop-blur-sm px-2.5 py-1 rounded-md text-[10px] border border-white/10">
                      <Compass className="h-3.5 w-3.5 text-brand-accent" />
                      <span>Cliché du PNHAO</span>
                    </div>
                    {hasGallery && (
                      <span className="bg-black/50 px-2 py-0.5 rounded-md font-mono text-[10px]">
                        {modalImageIdx + 1} / {gallery.length}
                      </span>
                    )}
                  </div>
                </div>

                {/* Content Section */}
                <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto max-h-[50vh] md:max-h-full">
                  <div className="space-y-5">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-serif font-bold text-2xl sm:text-3xl text-brand-primary leading-tight">
                          {selectedAnimal.name}
                        </h3>
                        <p className="text-sm font-mono text-brand-accent italic font-semibold mt-0.5">
                          {selectedAnimal.scientificName}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedAnimal(null)}
                        className="p-2 rounded-full hover:bg-brand-sand text-stone-400 hover:text-rose-600 transition-colors cursor-pointer shadow-sm border border-brand-light-gray shrink-0"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Status Badge */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-brand-sand text-brand-primary text-xs font-bold border border-brand-light-gray">
                        <AlertTriangle className="h-3.5 w-3.5 text-brand-accent" />
                        <span>{selectedAnimal.status}</span>
                      </span>
                      <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-brand-sand text-brand-primary text-xs font-bold border border-brand-light-gray">
                        <MapPin className="h-3.5 w-3.5 text-brand-accent" />
                        <span className="truncate max-w-[180px]">{selectedAnimal.habitat}</span>
                      </span>
                    </div>

                    {/* Rich Description */}
                    <div className="space-y-2">
                      <h5 className="text-xs font-bold font-sans uppercase tracking-wider text-brand-primary">Description & Comportement :</h5>
                      <p className="text-xs sm:text-sm text-stone-600 font-sans leading-relaxed">
                        {selectedAnimal.description}
                      </p>
                    </div>

                    {/* Eco-Observer Guidance Checklist */}
                    <div className="bg-brand-sand/50 rounded-2xl border border-brand-light-gray p-4 space-y-2 text-xs">
                      <h5 className="font-serif font-bold text-brand-primary text-sm flex items-center space-x-1.5">
                        <ShieldCheck className="h-4 w-4 text-brand-accent" />
                        <span>Charte d'Observation Responsable</span>
                      </h5>
                      <ul className="space-y-1.5 font-sans text-stone-600 list-disc pl-4">
                        <li>Garder une distance de sécurité minimale de 100 mètres.</li>
                        <li>Ne pas tenter de nourrir, d'approcher ou d'attirer l'animal.</li>
                        <li>Utiliser un zoom optique de haute portée ou des jumelles de terrain.</li>
                        <li>Privilégier les heures d'affût : l'aube et le crépuscule.</li>
                      </ul>
                    </div>
                  </div>

                  {/* Close Footer */}
                  <div className="pt-6 border-t border-brand-light-gray mt-6 flex justify-end">
                    <button
                      onClick={() => setSelectedAnimal(null)}
                      className="px-6 py-2.5 bg-brand-primary hover:bg-[#3d4d41] transition-colors text-white text-xs font-bold font-sans rounded-xl cursor-pointer shadow-sm"
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
                    const index = filteredFauna.findIndex(item => item.id === selectedAnimal.id);
                    if (index !== -1) {
                      const nextItem = filteredFauna[(index + 1) % filteredFauna.length];
                      setSelectedAnimal(nextItem);
                      setModalImageIdx(0);
                    }
                  }}
                  className="p-3.5 rounded-full bg-white/10 hover:bg-brand-accent text-white transition-all border border-white/20 hover:border-brand-accent cursor-pointer shadow-lg hover:scale-110 active:scale-95 flex items-center justify-center"
                  title="Animal Suivant (Raccourci : Flèche Droite)"
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
