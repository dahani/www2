/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TOURIST_CIRCUITS, PRACTICAL_INFO } from '../data';
import { Compass, Clock, MapPin, AlertCircle, Sparkles, Filter, CheckCircle2, ChevronRight, BedDouble, Navigation } from 'lucide-react';

export default function EcotourismTab() {
  // Trip planner states
  const [profile, setProfile] = useState<'trekker' | 'family' | 'culture'>('trekker');
  const [duration, setDuration] = useState<number>(2); // 1, 2, or 3 days

  const selectedItinerary = React.useMemo(() => {
    if (profile === 'trekker') {
      return {
        title: "Trek de l'Ayachi & Gorges de Jaffar",
        durationText: "2 à 3 Jours",
        difficulty: "Difficile",
        description: "Une aventure alpine intense à travers les canyons spectaculaires du Cirque de Jaffar, montant vers les neiges éternelles du Djebel Ayachi.",
        packing: ["Chaussures de grande randonnée", "Sac de couchage chaud (sommets froids)", "Réserves d'eau et pastilles de purification", "Carte topographique ou guide local obligatoire"],
        steps: ["Départ de Midelt en 4x4 jusqu'au Cirque de Jaffar", "Randonnée dans le canyon et bivouac forestier sous les cèdres", "Ascension du Djebel Ayachi (3164m) avec guide", "Descente vers le village d'Agoudim"]
      };
    } else if (profile === 'family') {
      return {
        title: "La Boucle Facile des Lacs Sacrés",
        durationText: "1 à 2 Jours",
        difficulty: "Facile",
        description: "Un séjour paisible et contemplatif autour des lacs mythiques Isly et Tislit, idéal pour l'observation des oiseaux et la rencontre avec les bergers.",
        packing: ["Lunettes de soleil et crème solaire haute protection", "Jumelles d'observation ornithologique", "Veste coupe-vent (vent fréquent sur les lacs)", "Appareil photo"],
        steps: ["Arrivée à Imilchil et installation dans une auberge berbère", "Promenade à pied le long du rivage du lac Tislit au coucher du soleil", "Visite historique du mausolée de Sidi Ahmed Oulmeghni et lac Isly", "Achat de tapis berbères traditionnels tissés par les coopératives de femmes"]
      };
    } else {
      return {
        title: "La Route du Tissage et des Kasbahs",
        durationText: "1 à 2 Jours",
        difficulty: "Moyen",
        description: "Une immersion profonde dans l'art de vivre et l'histoire des tribus Aït Yahia à travers les villages en pisé de Tirrhist et d'Anefgou.",
        packing: ["Petits cadeaux pour l'école locale ou soutien solidaire", "Chaussures de marche confortables pour visiter les douars", "Chapeau de soleil", "Vêtements respectueux pour les visites culturelles"],
        steps: ["Route touristique depuis Rich le long de l'oued Outerbat", "Visite guidée des kasbahs en pisé d'Anefgou", "Atelier de démonstration de tissage traditionnel de laine berbère", "Dégustation d'un tajine traditionnel cuit au four en terre chez l'habitant"]
      };
    }
  }, [profile]);

  return (
    <div className="space-y-12">
      {/* Introduction & Lodging statistics */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 space-y-4">
          <span className="text-xs font-bold font-sans uppercase tracking-widest text-brand-accent">Guide Pratique</span>
          <h2 className="font-serif font-bold text-3xl sm:text-4xl text-brand-text tracking-tight">Découverte Éco-Responsable</h2>
          <p className="text-sm text-stone-600 leading-relaxed font-sans">
            Le Parc National du Haut Atlas Oriental offre un écotourisme axé sur le partage, le respect et la solidarité. L'hébergement se fait principalement au cœur des douars traditionnels, favorisant directement l'autonomie des familles de montagne.
          </p>
          
          <div className="bg-brand-sand/50 border border-brand-light-gray p-6 rounded-[24px] flex items-start space-x-3.5">
            <BedDouble className="h-6 w-6 text-brand-primary shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-xs font-bold text-brand-primary font-sans uppercase tracking-wider block">Infrastructures Touristiques Solidaires</span>
              <p className="text-xs text-stone-600 leading-relaxed font-sans">
                Le parc compte actuellement <span className="font-bold text-brand-text">4 Hôtels</span>, <span className="font-bold text-brand-text">21 Auberges</span> de charme, et <span className="font-bold text-brand-text">5 Gîtes d'étape ruraux</span>. {PRACTICAL_INFO.lodging.details}
              </p>
            </div>
          </div>
        </div>

        {/* Access list side panel */}
        <div className="lg:col-span-5 bg-white border border-brand-light-gray rounded-[32px] p-6 space-y-4 shadow-sm">
          <div className="flex items-center space-x-2 text-stone-800">
            <Navigation className="h-5 w-5 text-brand-primary" />
            <h3 className="font-serif font-bold text-lg text-brand-text">Accès et Itinéraires</h3>
          </div>
          <div className="space-y-3">
            {PRACTICAL_INFO.access.map((item, idx) => (
              <div key={idx} className="p-4 bg-brand-sand border border-brand-light-gray rounded-xl space-y-1">
                <span className="text-xs font-bold text-brand-text font-serif block">{item.from}</span>
                <span className="text-xs text-stone-500 font-sans block">{item.route}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recommended Circuits Slider section */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-brand-accent uppercase tracking-widest text-xs font-bold font-sans">Itinéraires Balisés</span>
          <h3 className="font-serif font-bold text-2xl sm:text-3xl text-brand-text tracking-tight">Les Circuits Recommandés</h3>
          <p className="text-sm text-stone-500 font-sans">Des tracés officiels balisés pour vivre l'expérience ultime de l'Atlas.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TOURIST_CIRCUITS.map((circuit) => (
            <motion.div
              key={circuit.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-brand-light-gray rounded-[28px] overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-sans font-bold px-2.5 py-1 rounded-full border ${
                    circuit.difficulty === 'Facile' ? 'bg-[#EEF8F6] text-[#2F7666] border-[#D5EFEA]' :
                    circuit.difficulty === 'Moyen' ? 'bg-brand-sand text-brand-primary border-brand-light-gray' :
                    'bg-rose-50 text-rose-800 border-rose-150'
                  }`}>
                    {circuit.difficulty}
                  </span>
                  <span className="text-xs text-stone-400 font-sans flex items-center space-x-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{circuit.duration}</span>
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="font-serif font-bold text-lg text-brand-text tracking-tight leading-snug">
                    {circuit.title}
                  </h4>
                  <p className="text-[11px] font-mono text-brand-primary">{circuit.distance}</p>
                </div>

                <p className="text-xs text-stone-600 font-sans leading-relaxed">
                  {circuit.description}
                </p>

                {/* Stops */}
                <div className="space-y-1.5 pt-2">
                  <span className="text-[11px] font-sans font-bold uppercase text-stone-400 block tracking-wider">Étapes principales :</span>
                  <div className="flex flex-wrap gap-1.5">
                    {circuit.stops.map((stop, i) => (
                      <span key={i} className="text-[10px] font-sans bg-brand-sand border border-brand-light-gray px-2.5 py-1 rounded-md text-brand-primary font-semibold">
                        {stop}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Highlights bar */}
              <div className="bg-brand-sand/40 px-5 py-3.5 border-t border-brand-light-gray text-xs font-sans text-stone-500 flex items-center justify-between mt-auto">
                <span className="font-bold text-brand-primary">Incontournable : {circuit.highlights[0]}</span>
                <ChevronRight className="h-4 w-4 text-brand-primary" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Interactive Trip Planner widget */}
      <section className="bg-[#2D342F] text-stone-100 rounded-[40px] p-6 sm:p-10 space-y-6 shadow-xl border border-brand-primary/20">
        <div className="flex items-center space-x-4">
          <div className="bg-brand-accent/15 p-3 rounded-full border border-brand-accent/20 text-brand-accent">
            <Compass className="h-6 w-6" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-sans font-bold tracking-widest text-brand-accent block">Assistant Écotourisme</span>
            <h3 className="font-serif font-bold text-2xl text-white tracking-tight leading-tight">Planifiez Votre Itinéraire sur Mesure</h3>
          </div>
        </div>

        <p className="text-xs text-stone-300 max-w-2xl font-sans leading-relaxed">
          Choisissez votre profil de voyageur et explorez une recommandation sur mesure générée d'après le Plan d'Aménagement et de Gestion du parc.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-2">
          {/* Controls */}
          <div className="lg:col-span-5 space-y-5 bg-white/5 p-5 rounded-3xl border border-white/10">
            {/* Travel profile */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-sans text-stone-400 font-bold block tracking-wider">1. Style de Voyage</span>
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => setProfile('trekker')}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-between border transition-all ${
                    profile === 'trekker'
                      ? 'bg-brand-primary border-brand-primary text-white shadow-sm'
                      : 'bg-white/5 border-white/10 text-stone-300 hover:text-white'
                  }`}
                >
                  <span>Randonneur Sportif / Trekking</span>
                  <CheckCircle2 className={`h-4 w-4 ${profile === 'trekker' ? 'text-brand-accent' : 'text-white/10'}`} />
                </button>
                <button
                  onClick={() => setProfile('family')}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-between border transition-all ${
                    profile === 'family'
                      ? 'bg-brand-primary border-brand-primary text-white shadow-sm'
                      : 'bg-white/5 border-white/10 text-stone-300 hover:text-white'
                  }`}
                >
                  <span>Famille & Observation Nature</span>
                  <CheckCircle2 className={`h-4 w-4 ${profile === 'family' ? 'text-brand-accent' : 'text-white/10'}`} />
                </button>
                <button
                  onClick={() => setProfile('culture')}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-between border transition-all ${
                    profile === 'culture'
                      ? 'bg-brand-primary border-brand-primary text-white shadow-sm'
                      : 'bg-white/5 border-white/10 text-stone-300 hover:text-white'
                  }`}
                >
                  <span>Immersion Culturelle & Douars</span>
                  <CheckCircle2 className={`h-4 w-4 ${profile === 'culture' ? 'text-brand-accent' : 'text-white/10'}`} />
                </button>
              </div>
            </div>

            {/* Note */}
            <div className="flex items-start space-x-2.5 p-4 bg-brand-accent/10 border border-brand-accent/20 rounded-2xl text-brand-accent text-[11px] font-sans">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <p className="leading-relaxed">Il est fortement conseillé d'engager un guide local labellisé pour toute randonnée d'altitude au PNHAO.</p>
            </div>
          </div>

          {/* Results panel */}
          <div className="lg:col-span-7 bg-white/5 p-6 rounded-3xl border border-white/10 space-y-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={profile}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-brand-accent font-sans uppercase tracking-wider">Votre Proposition d'Itinéraire :</span>
                    <span className="text-[10px] font-sans font-bold bg-white/10 px-2.5 py-1 rounded-full border border-white/10 text-stone-200">Difficulté : {selectedItinerary.difficulty}</span>
                  </div>
                  <h4 className="font-serif font-bold text-xl text-white tracking-tight">{selectedItinerary.title}</h4>
                </div>

                <p className="text-xs text-stone-200 leading-relaxed font-sans">
                  {selectedItinerary.description}
                </p>

                {/* Steps */}
                <div className="space-y-2">
                  <span className="text-[10px] font-sans uppercase text-stone-400 block tracking-wider font-bold">Étapes de l'itinéraire :</span>
                  <div className="space-y-2.5">
                    {selectedItinerary.steps.map((step, idx) => (
                      <div key={idx} className="flex items-start space-x-3 text-xs text-stone-200 font-sans">
                        <span className="bg-brand-primary text-white h-5 w-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 border border-white/10 mt-0.5">
                          {idx + 1}
                        </span>
                        <p className="mt-0.5 leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pack list */}
                <div className="pt-4 border-t border-white/10 space-y-2">
                  <span className="text-[10px] font-sans uppercase text-stone-400 block tracking-wider font-bold">Matériel indispensable à emporter :</span>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-stone-300 font-sans">
                    {selectedItinerary.packing.map((packItem, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <span className="h-1.5 w-1.5 bg-brand-accent rounded-full shrink-0 mt-1.5"></span>
                        <span className="leading-tight">{packItem}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>
    </div>
  );
}
