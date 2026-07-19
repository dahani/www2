/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { THREATS_DATA } from '../data';
import { ShieldCheck, AlertTriangle, Lightbulb, Sparkles, HeartHandshake, CheckCircle } from 'lucide-react';

export default function PreservationTab() {
  // Visitor pledge checklist states
  const [commitments, setCommitments] = useState({
    noWaste: false,
    saveWater: false,
    localGuides: false,
    respectWildlife: false,
    supportLocal: false
  });

  const allCommitted = Object.values(commitments).every(Boolean);

  const toggleCommitment = (key: keyof typeof commitments) => {
    setCommitments((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const strategicOrientations = [
    {
      num: 1,
      title: "Réhabilitation de l'Écosystème",
      axes: [
        "A1 : La protection, la conservation et la reconstitution forestière (cèdres, chênes).",
        "A2 : L'amélioration de l'attractivité territoriale concertée du PNHAO."
      ],
      color: "border-brand-light-gray bg-white"
    },
    {
      num: 2,
      title: "Protection de la Faune & Flore",
      axes: [
        "A3 : La protection rigoureuse des habitats hautement et moyennement fragiles.",
        "A4 : La sauvegarde absolue des axes de mouvement du Mouflon et des espèces endémiques."
      ],
      color: "border-brand-light-gray bg-white"
    },
    {
      num: 3,
      title: "Amélioration des Conditions de Vie",
      axes: [
        "A5 : La contribution directe à l'amélioration durable des revenus des ménages.",
        "A6 : L'appui à l'organisation de la population locale (coopératives, AGR)."
      ],
      color: "border-brand-light-gray bg-white"
    }
  ];

  return (
    <div className="space-y-12">
      {/* Intro section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 space-y-4">
          <span className="text-xs font-bold font-sans uppercase tracking-widest text-brand-accent">Défis & Solutions</span>
          <h2 className="font-serif font-bold text-3xl sm:text-4xl text-brand-text tracking-tight">Protéger Ensemble le Haut Atlas</h2>
          <p className="text-sm text-stone-600 leading-relaxed font-sans">
            La rudesse du climat montagnard et l'isolement géographique créent un équilibre de vie extrêmement fragile. Pour faire face aux pressions climatiques et humaines, l'Administration Forestière (ANEF) mène un plan d'aménagement durable en étroite concertation avec les communes et les associations locales.
          </p>
          <p className="text-sm text-stone-600 leading-relaxed font-sans">
            L'un des défis majeurs réside dans la forte consommation de bois-énergie (bois de feu) qui peut atteindre <span className="font-bold text-brand-primary">10 tonnes par ménage et par an</span> pour le chauffage hivernal. Des solutions novatrices de substitution comme l'éco-conception, les fours solaires et à gaz sont déployées pour soulager la forêt de cèdres.
          </p>
        </div>

        {/* Action guidelines side panel */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#2D342F] to-[#4A5D4E] text-stone-100 p-8 rounded-[40px] space-y-5 shadow-lg border border-brand-primary/20">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-sans tracking-widest text-brand-accent font-bold block">
              Vision d'Avenir
            </span>
            <h3 className="font-serif font-bold text-xl text-white">Résultats Attendus à Long Terme</h3>
          </div>
          <ul className="space-y-3 text-xs text-stone-200 font-sans leading-relaxed">
            <li className="flex items-start space-x-2.5">
              <span className="h-1.5 w-1.5 bg-brand-accent rounded-full mt-1.5 shrink-0"></span>
              <span>Protection absolue des habitats de faune sensibles (zones de quiétude).</span>
            </li>
            <li className="flex items-start space-x-2.5">
              <span className="h-1.5 w-1.5 bg-brand-accent rounded-full mt-1.5 shrink-0"></span>
              <span>Restauration des écosystèmes et reconstitution des cédraies dégradées.</span>
            </li>
            <li className="flex items-start space-x-2.5">
              <span className="h-1.5 w-1.5 bg-brand-accent rounded-full mt-1.5 shrink-0"></span>
              <span>Valorisation de la filière éco-touristique solidaire et des produits du terroir.</span>
            </li>
            <li className="flex items-start space-x-2.5">
              <span className="h-1.5 w-1.5 bg-brand-accent rounded-full mt-1.5 shrink-0"></span>
              <span>Amélioration pérenne des revenus des ménages et de la gouvernance locale.</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Grid of Main Threats with solutions tabs */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-brand-accent uppercase tracking-widest text-xs font-bold font-sans">Facteurs de Menaces</span>
          <h3 className="font-serif font-bold text-2xl sm:text-3xl text-brand-text tracking-tight">Les Menaces Majeures Pesant sur le Parc</h3>
          <p className="text-sm text-stone-500 font-sans">
            Comprendre les facteurs de dégradation pour mieux adapter les solutions d'aménagement sylvicole et social.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {THREATS_DATA.map((threat) => (
            <div
              key={threat.id}
              className="bg-white border border-brand-light-gray rounded-[28px] p-6 shadow-sm space-y-4 flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[10px] font-sans font-bold px-2.5 py-1 rounded-full border ${
                    threat.type === 'naturel' ? 'bg-brand-sand text-brand-primary border-brand-light-gray' : 'bg-rose-50 text-rose-800 border border-rose-100'
                  }`}>
                    Origine {threat.type === 'naturel' ? 'Naturelle' : 'Anthropique'}
                  </span>
                  <span className={`text-[10px] font-sans font-bold px-2.5 py-1 rounded-full border ${
                    threat.impactLevel === 'Élevé' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                    threat.impactLevel === 'Moyen' ? 'bg-brand-sand text-brand-primary border-brand-light-gray' :
                    'bg-stone-50 text-stone-700 border-stone-200'
                  }`}>
                    Impact {threat.impactLevel}
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="font-serif font-bold text-lg text-brand-text tracking-tight leading-snug">
                    {threat.title}
                  </h4>
                  <p className="text-xs text-stone-600 leading-relaxed font-sans">
                    {threat.description}
                  </p>
                </div>
              </div>

              {/* Action/Solutions box */}
              <div className="bg-brand-sand/40 p-4 rounded-[20px] border border-brand-light-gray mt-4 space-y-2">
                <div className="flex items-center space-x-1.5 text-stone-500">
                  <Lightbulb className="h-4 w-4 text-brand-accent shrink-0" />
                  <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-brand-accent">Axe d'intervention</span>
                </div>
                <ul className="space-y-1.5 text-xs text-stone-700 font-sans leading-normal">
                  {threat.solutions.map((sol, idx) => (
                    <li key={idx} className="flex items-start space-x-1.5">
                      <span className="text-brand-accent font-bold shrink-0">&middot;</span>
                      <span>{sol}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Official ANEF Strategic orientations */}
      <section className="bg-brand-sand/30 border border-brand-light-gray rounded-[40px] p-6 sm:p-10 space-y-8">
        <div className="space-y-1 text-center max-w-xl mx-auto">
          <span className="text-xs font-bold font-sans uppercase tracking-widest text-brand-accent">Le Plan d'Aménagement</span>
          <h3 className="font-serif font-bold text-2xl sm:text-3xl text-brand-text tracking-tight">Les 3 Orientations et 6 Axes Stratégiques</h3>
          <p className="text-sm text-stone-500 font-sans">
            La politique officielle de préservation concertée mise en place pour concilier la protection des milieux et le bien-être humain.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {strategicOrientations.map((orientation) => (
            <div
              key={orientation.num}
              className={`border border-brand-light-gray bg-white rounded-3xl p-6 space-y-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow`}
            >
              <div className="space-y-3.5">
                <div className="flex items-center space-x-3">
                  <span className="bg-[#2D342F] text-brand-sand h-7 w-7 rounded-lg flex items-center justify-center font-serif font-bold text-sm">
                    {orientation.num}
                  </span>
                  <h4 className="font-serif font-bold text-base text-brand-text tracking-tight">
                    {orientation.title}
                  </h4>
                </div>
                <ul className="space-y-2 text-xs text-stone-600 font-sans leading-relaxed">
                  {orientation.axes.map((axe, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-brand-accent font-bold shrink-0 mt-0.5">&bull;</span>
                      <span>{axe}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Pledge section (Charte de l'éco-voyageur) */}
      <section className="bg-[#2D342F] text-stone-100 p-6 sm:p-10 rounded-[40px] space-y-6 shadow-xl relative overflow-hidden border border-brand-primary/20">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-brand-accent/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="bg-brand-accent/15 p-3 rounded-full border border-brand-accent/20 text-brand-accent">
              <HeartHandshake className="h-6 w-6" />
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-sans font-bold tracking-widest text-brand-accent block">Engagement Citoyen</span>
              <h3 className="font-serif font-bold text-2xl text-white tracking-tight leading-tight">La Charte Civique du Voyageur</h3>
            </div>
          </div>
          
          <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-full font-sans text-xs text-stone-300 flex items-center space-x-2">
            <span>Pacte Éco-Voyageur</span>
          </div>
        </div>

        <p className="text-xs text-stone-300 max-w-2xl leading-relaxed font-sans">
          Chaque visiteur laisse une empreinte sur ces milieux fragiles. Devenez un acteur de la préservation en signant notre charte d'engagement éco-citoyen. Cochez chaque engagement pour obtenir votre badge officiel de soutien au parc.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch pt-2">
          {/* Commitments checklist */}
          <div className="lg:col-span-7 space-y-3">
            {/* Box 1 */}
            <button
              onClick={() => toggleCommitment('noWaste')}
              className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start space-x-3.5 ${
                commitments.noWaste
                  ? 'bg-brand-primary border-brand-primary text-white shadow-md'
                  : 'bg-white/5 border-white/10 text-stone-300 hover:text-white'
              }`}
            >
              <div className={`mt-0.5 h-4.5 w-4.5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                commitments.noWaste ? 'bg-brand-accent border-brand-accent' : 'border-white/20'
              }`}>
                {commitments.noWaste && <CheckCircle className="h-3.5 w-3.5 text-white" />}
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-bold font-sans block text-white">Zéro Déchet Plastique</span>
                <span className="text-[11px] font-sans block text-stone-300">Je m'engage à ramener tous mes déchets hors des sites naturels et des lacs Isly & Tislit.</span>
              </div>
            </button>

            {/* Box 2 */}
            <button
              onClick={() => toggleCommitment('saveWater')}
              className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start space-x-3.5 ${
                commitments.saveWater
                  ? 'bg-brand-primary border-brand-primary text-white shadow-md'
                  : 'bg-white/5 border-white/10 text-stone-300 hover:text-white'
              }`}
            >
              <div className={`mt-0.5 h-4.5 w-4.5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                commitments.saveWater ? 'bg-brand-accent border-brand-accent' : 'border-white/20'
              }`}>
                {commitments.saveWater && <CheckCircle className="h-3.5 w-3.5 text-white" />}
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-bold font-sans block text-white">Respect Absolu de l'Eau</span>
                <span className="text-[11px] font-sans block text-stone-300">Je n'utiliserai aucun produit chimique ou polluant à proximité des oueds ou des rives lacustres.</span>
              </div>
            </button>

            {/* Box 3 */}
            <button
              onClick={() => toggleCommitment('localGuides')}
              className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start space-x-3.5 ${
                commitments.localGuides
                  ? 'bg-brand-primary border-brand-primary text-white shadow-md'
                  : 'bg-white/5 border-white/10 text-stone-300 hover:text-white'
              }`}
            >
              <div className={`mt-0.5 h-4.5 w-4.5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                commitments.localGuides ? 'bg-brand-accent border-brand-accent' : 'border-white/20'
              }`}>
                {commitments.localGuides && <CheckCircle className="h-3.5 w-3.5 text-white" />}
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-bold font-sans block text-white">Soutien aux Guides Locaux</span>
                <span className="text-[11px] font-sans block text-stone-300">Pour ma sécurité et l'emploi local, je ferai appel à des guides certifiés issus des tribus locales.</span>
              </div>
            </button>

            {/* Box 4 */}
            <button
              onClick={() => toggleCommitment('respectWildlife')}
              className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start space-x-3.5 ${
                commitments.respectWildlife
                  ? 'bg-brand-primary border-brand-primary text-white shadow-md'
                  : 'bg-white/5 border-white/10 text-stone-300 hover:text-white'
              }`}
            >
              <div className={`mt-0.5 h-4.5 w-4.5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                commitments.respectWildlife ? 'bg-brand-accent border-brand-accent' : 'border-white/20'
              }`}>
                {commitments.respectWildlife && <CheckCircle className="h-3.5 w-3.5 text-white" />}
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-bold font-sans block text-white">Tranquillité de la Faune Sauvage</span>
                <span className="text-[11px] font-sans block text-stone-300">Je ne perturberai aucun nid, ne ferai aucun feu sauvage et observerai le Mouflon à distance.</span>
              </div>
            </button>

            {/* Box 5 */}
            <button
              onClick={() => toggleCommitment('supportLocal')}
              className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start space-x-3.5 ${
                commitments.supportLocal
                  ? 'bg-brand-primary border-brand-primary text-white shadow-md'
                  : 'bg-white/5 border-white/10 text-stone-300 hover:text-white'
              }`}
            >
              <div className={`mt-0.5 h-4.5 w-4.5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                commitments.supportLocal ? 'bg-brand-accent border-brand-accent' : 'border-white/20'
              }`}>
                {commitments.supportLocal && <CheckCircle className="h-3.5 w-3.5 text-white" />}
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-bold font-sans block text-white">Économie Circulaire Solidaire</span>
                <span className="text-[11px] font-sans block text-stone-300">Je logerai chez l'habitant et achèterai directement l'artisanat ou miel aux coopératives du parc.</span>
              </div>
            </button>
          </div>

          {/* Interactive Badge Reward */}
          <div className="lg:col-span-5 flex flex-col justify-center items-center text-center p-6 bg-white/5 rounded-3xl border border-white/10 self-stretch min-h-[300px]">
            <AnimatePresence mode="wait">
              {allCommitted ? (
                <motion.div
                  key="badge-won"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="space-y-5"
                >
                  <div className="inline-flex bg-brand-accent/15 p-5 rounded-full border border-brand-accent/30 text-brand-accent relative">
                    <ShieldCheck className="h-16 w-16 text-brand-accent animate-pulse" />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="absolute inset-0 border border-brand-accent/20 rounded-full"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="font-serif font-bold text-xl text-brand-accent leading-tight">Merci, Éco-Citoyen !</h4>
                    <p className="text-xs text-stone-300 font-sans max-w-[240px] mx-auto leading-relaxed">
                      Vous avez signé la charte. Vous faites désormais partie des gardiens bénévoles de la biodiversité du PNHAO.
                    </p>
                  </div>

                  <div className="bg-brand-accent text-white px-5 py-2 rounded-full text-[10px] font-sans uppercase tracking-widest font-bold inline-block shadow-md">
                    Badge Éco-Citoyen Actif
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="badge-locked"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="inline-flex bg-white/5 p-5 rounded-full border border-white/10 text-white/25">
                    <ShieldCheck className="h-16 w-16" />
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="font-serif font-bold text-base text-stone-300">Signez la Charte</h4>
                    <p className="text-xs text-stone-400 font-sans max-w-[200px] mx-auto leading-relaxed">
                      Cochez les 5 engagements civiques pour valider votre pacte éco-responsable et débloquer votre badge.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </div>
  );
}
