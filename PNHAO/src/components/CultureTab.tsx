/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { LAKES_LEGEND, CULTURAL_HERITAGE, PARK_METADATA } from '../data';
import { getAssetUrl } from '../utils';
import { Heart, Music, Home, Sparkles, HelpCircle, Flame, MapPin } from 'lucide-react';

export default function CultureTab() {
  const [showStoryDetail, setShowStoryDetail] = useState(false);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Heart': return <Heart className="h-5 w-5 text-brand-accent" />;
      case 'Music': return <Music className="h-5 w-5 text-brand-primary" />;
      case 'Home': return <Home className="h-5 w-5 text-[#82614E]" />;
      default: return <Sparkles className="h-5 w-5 text-[#9E8259]" />;
    }
  };

  return (
    <div className="space-y-12">
      {/* Intro section with tribal demographics */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 space-y-4">
          <span className="text-xs font-bold font-sans uppercase tracking-widest text-brand-accent">Patrimoine Humain</span>
          <h2 className="font-serif font-bold text-3xl sm:text-4xl text-brand-text tracking-tight">Les Tribus du Haut Atlas Oriental</h2>
          <p className="text-sm text-stone-600 leading-relaxed font-sans">
            La zone d'action du parc est dominée sur le plan social par deux grandes confédérations tribales amazighes (berbères) d'une richesse historique immense : les <span className="font-bold text-brand-primary">Aït H'ddidou</span> et les <span className="font-bold text-brand-primary">Aït Yahia</span>. 
          </p>
          <p className="text-sm text-stone-600 leading-relaxed font-sans">
            La population de <span className="font-bold text-brand-primary">{PARK_METADATA.population.split(" (")[0]}</span> vit principalement regroupée le long des hauts vallons sinueux. Cet isolement séculaire au cœur des montagnes a permis de préserver des coutumes ancestrales intactes, une langue vivante chaleureuse, et une architecture en terre d'une harmonie absolue.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="bg-brand-sand border border-brand-light-gray p-5 rounded-[20px] space-y-1 shadow-sm">
              <span className="text-xs text-stone-400 font-sans font-semibold block uppercase tracking-wider">Confédérations Tribales</span>
              <span className="text-base font-bold text-brand-primary font-serif block">Aït H'ddidou & Aït Yahia</span>
            </div>
            <div className="bg-brand-sand border border-brand-light-gray p-5 rounded-[20px] space-y-1 shadow-sm">
              <span className="text-xs text-stone-400 font-sans font-semibold block uppercase tracking-wider">Villages Fortifiés (Douars)</span>
              <span className="text-base font-bold text-brand-primary font-serif block">35 Douars traditionnels</span>
            </div>
          </div>
        </div>

        {/* Side card displaying tribal layout */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#2D342F] to-[#4A5D4E] text-stone-100 p-8 rounded-[40px] space-y-6 shadow-lg relative overflow-hidden border border-brand-primary/20">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Flame className="w-48 h-48" />
          </div>
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-sans tracking-widest text-brand-accent font-bold block">
              Détail Territorial
            </span>
            <h3 className="font-serif font-bold text-xl text-white">Répartition Administrative</h3>
          </div>
          <div className="space-y-4 text-xs text-stone-200 font-sans">
            <div className="flex items-start space-x-3">
              <MapPin className="h-4 w-4 text-brand-accent mt-0.5 shrink-0" />
              <p className="leading-relaxed">
                <span className="font-bold text-white block">Cercle de Boumia :</span>
                Communes d'Anemzi, Aït Yahia et Bouazmou.
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <MapPin className="h-4 w-4 text-brand-accent mt-0.5 shrink-0" />
              <p className="leading-relaxed">
                <span className="font-bold text-white block">Cercle d'Imilchil :</span>
                Communes d'Imilchil, Outerbat et Amouguer.
              </p>
            </div>
            <div className="pt-4 border-t border-white/10 text-[11px] text-stone-300 italic leading-normal">
              L'habitat se caractérise par une architecture bioclimatique authentique parfaitement intégrée aux versants rocheux calcaires.
            </div>
          </div>
        </div>
      </section>

      {/* Tragic Legend Storyboard Card */}
      <section className="bg-brand-sand/40 border border-brand-light-gray rounded-[40px] p-6 sm:p-10 space-y-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="bg-brand-accent/15 p-3 rounded-full text-brand-accent border border-brand-accent/20">
              <Heart className="h-6 w-6 animate-pulse" />
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-sans font-bold tracking-widest text-brand-accent block">Légende Mythologique</span>
              <h3 className="font-serif font-bold text-2xl text-brand-text tracking-tight leading-tight">
                {LAKES_LEGEND.title}
              </h3>
            </div>
          </div>
          <span className="bg-brand-primary text-white text-xs font-sans font-bold px-4 py-2 rounded-full shadow-sm">
            {LAKES_LEGEND.annualEvent}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <p className="text-sm text-stone-700 leading-relaxed font-sans italic">
              « Deux amants de tribus rivales s'aimaient d'un amour impossible. Leurs parents refusant catégoriquement leur mariage, les jeunes s'enfuirent dans la montagne. Leurs larmes de chagrin furent si abondantes qu'elles formèrent les deux lacs jumeaux d'Isly (le fiancé) et de Tislit (la fiancée)... »
            </p>
            
            {showStoryDetail ? (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="text-sm text-stone-600 leading-relaxed font-sans"
              >
                Touchées par ce drame, les tribus conclurent la paix pour de bon. Afin d'éviter qu'une telle tragédie ne se reproduise, elles décidèrent de fonder un rassemblement annuel — le fameux <strong>Moussem des Fiançailles d'Imilchil</strong>. Sous la bénédiction de Sidi Ahmed Oulmeghni, chaque année en septembre, les jeunes des différentes fractions tribales peuvent se rencontrer, s'aimer et s'engager librement dans un mariage collectif sacré.
              </motion.p>
            ) : null}

            <div>
              <button
                onClick={() => setShowStoryDetail(!showStoryDetail)}
                className="text-sm text-brand-accent hover:text-[#b8714b] font-bold inline-flex items-center space-x-1.5 underline"
              >
                <span>{showStoryDetail ? "Réduire l'histoire" : "Lire la suite de la légende"}</span>
                <span>&rarr;</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-4 h-[220px] rounded-[32px] overflow-hidden shadow-sm border border-brand-light-gray">
            <img
              src={getAssetUrl("/images/isly_tislit_lake_1783949826439.jpg")}
              alt="Lac de montagne Tislit et Isly"
              className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </section>

      {/* Cultural Treasures Cards Grid */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-brand-accent uppercase tracking-widest text-xs font-bold font-sans">Patrimoine Intangible</span>
          <h3 className="font-serif font-bold text-2xl sm:text-3xl text-brand-text tracking-tight">Les Trésors du Patrimoine Immatériel</h3>
          <p className="text-sm text-stone-500 font-sans">Un art de vivre séculaire, fruit de la cohésion et du respect de la montagne.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CULTURAL_HERITAGE.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white border border-brand-light-gray rounded-[28px] p-6 shadow-sm flex items-start space-x-4"
            >
              <div className="bg-brand-sand p-3.5 rounded-full border border-brand-light-gray shrink-0">
                {getIcon(item.icon)}
              </div>
              <div className="space-y-2">
                <h4 className="font-serif font-bold text-lg text-brand-text tracking-tight">
                  {item.title}
                </h4>
                <p className="text-sm text-stone-600 leading-relaxed font-sans">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
