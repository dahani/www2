/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PARK_METADATA, VEGETATION_STAGES, FAUNA_DATA, FLORA_DATA, TOURIST_CIRCUITS } from '../data';
import { getAssetUrl } from '../utils';
import { FAUNA_IMAGES } from './FauneTab';
import { FLORA_IMAGES } from './FloreTab';
import animalsData from '../animals.json';
import { Mountain, Trees, Waves, Users, Calendar, Award, Compass, HelpCircle, ChevronLeft, ChevronRight, ChevronDown, Download, Bird, Leaf, Eye, ArrowRight, Heart, AlertTriangle, ShieldCheck, Sparkles, Clock, Building, MapPin, Phone, Mail, ShieldAlert, Landmark, CheckCircle2, Send } from 'lucide-react';

interface OverviewTabProps {
  setCurrentTab: (tab: string) => void;
  onOpenInteractiveMap: () => void;
}

export default function OverviewTab({ setCurrentTab, onOpenInteractiveMap }: OverviewTabProps) {
  const [selectedStage, setSelectedStage] = useState<number>(2); // Default to Montagnard Méditerranéen
  const [activeSlide, setActiveSlide] = useState<number>(0);

  // Contact Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    subject: '',
    role: 'visitor',
    message: ''
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.fullName.trim()) errors.fullName = "Veuillez entrer votre nom complet.";
    if (!formData.email.trim()) {
      errors.email = "L'adresse email est requise.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Veuillez entrer une adresse email valide.";
    }
    if (!formData.subject.trim()) errors.subject = "Veuillez préciser l'objet de votre message.";
    if (!formData.message.trim()) errors.message = "Veuillez rédiger votre message.";
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch(getAssetUrl('/send-email.php'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        setSubmitSuccess(true);
        setFormData({
          fullName: '',
          email: '',
          subject: '',
          role: 'visitor',
          message: ''
        });
      } else {
        setSubmitError(data.message || "Une erreur est survenue lors de l'envoi de l'email.");
      }
    } catch (error) {
      console.error("Error submitting contact form:", error);
      setSubmitError("Impossible de se connecter au serveur de messagerie pour envoyer votre message.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Select 3 random animals and plants on mount to keep them stable
  const [randomAnimals] = useState(() => {
    const shuffled = [...FAUNA_DATA].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  });

  const [randomPlants] = useState(() => {
    const shuffled = [...FLORA_DATA].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  });

  const [slides] = useState(() => {
    const baseSlides = [
      {
        image: "/images/isly_tislit_lake_1783949826439.jpg",
        title: "Lacs d'Isly et Tislit",
        subtitle: "Zones Humides d'importance internationale",
        description: "Découvrez les deux joyaux bleus du parc, classés Ramsar, berceau de la légendaire histoire d'amour d'Imilchil.",
        badge: "Lacs Ramsar",
        actionTab: "tourism",
        actionLabel: "Découvrir les Circuits"
      },
      {
        image: "/images/faune/mouflon_manchettes_1783949869486.jpg",
        title: "Faune Exceptionnelle",
        subtitle: "Le sanctuaire du Mouflon à manchettes",
        description: "Le parc préserve les dernières grandes populations de mouflons à manchettes et de macaques de Barbarie du Haut Atlas.",
        badge: "Faune Sauvage",
        actionTab: "faune",
        actionLabel: "Explorer la Faune"
      },
      {
        image: "/images/atlas_kasbah_village_1783949848718.jpg",
        title: "Patrimoine Culturel",
        subtitle: "Tribus rituelles Aït H'ddidou",
        description: "Une immersion solidaire au cœur des douars berbères, de leur architecture bioclimatique en pisé et de leur artisanat millénaire.",
        badge: "Culture Berbère",
        actionTab: "culture",
        actionLabel: "Découvrir la Culture"
      }
    ];

    const galleryPool = [
      {
        image: "https://ifrane.pnm.ma/wp-content/uploads/2025/11/Cedrus_atlantica1.jpg",
        title: "Forêt de Cèdres millénaires",
        subtitle: "Canton forestier de Tirrhist, 2400m",
        description: "Le Cedrus atlantica, symbole majestueux du Maroc, formant des futaies denses indispensables au climat montagnard.",
        badge: "Forêts & Cèdres",
        actionTab: "flore",
        actionLabel: "Explorer la Flore"
      },
      {
        image: "https://ifrane.pnm.ma/wp-content/uploads/2025/11/Juniperus_thurifera1.jpg",
        title: "Genévriers thurifères sur les Crêtes",
        subtitle: "Crêtes du Massif Ayachi, 2800m",
        description: "Arbre robuste d'altitude bravant le gel, la neige et les vents violents sur les versants calcaires élevés du parc.",
        badge: "Forêts & Cèdres",
        actionTab: "flore",
        actionLabel: "Explorer la Flore"
      },
      ...animalsData
        .filter((item: any) => item.id !== 'gal-fau-1') // Exclude mouflon to avoid duplicate
        .map((item: any) => {
          let actionTab = "faune";
          let actionLabel = "Explorer la Faune";
          if (item.category === "Forêts & Cèdres") {
            actionTab = "flore";
            actionLabel = "Explorer la Flore";
          } else if (item.category === "Vie Berbère & Douars") {
            actionTab = "culture";
            actionLabel = "Découvrir la Culture";
          } else if (item.category === "Lacs & Zones Humides") {
            actionTab = "tourism";
            actionLabel = "Découvrir les Circuits";
          }
          return {
            image: item.url,
            title: item.title,
            subtitle: item.location || "Faune du Haut Atlas Oriental",
            description: item.description,
            badge: item.category || "Faune Sauvage",
            actionTab,
            actionLabel
          };
        })
    ];

    // Select 3 random unique items from the gallery pool
    const shuffled = [...galleryPool].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);

    return [...baseSlides, ...selected];
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleNext = () => {
    setActiveSlide((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const stats = [
    {
      label: "Superficie Protégée",
      value: PARK_METADATA.area,
      description: "Territoire d'importance internationale",
      icon: <Award className="h-6 w-6 text-brand-primary" />,
      color: "bg-brand-sand border border-brand-light-gray"
    },
    {
      label: "Altitude Maximale",
      value: PARK_METADATA.altitudeMax,
      description: "Djebel Ayachi & hauts sommets",
      icon: <Mountain className="h-6 w-6 text-brand-accent" />,
      color: "bg-brand-sand border border-brand-light-gray"
    },
    {
      label: "Zones Humides Ramsar",
      value: "Lacs Isly & Tislit",
      description: "Lacs légendaires protégés",
      icon: <Waves className="h-6 w-6 text-brand-primary" />,
      color: "bg-brand-sand border border-brand-light-gray"
    },
    {
      label: "Population locale",
      value: PARK_METADATA.population.split(" (")[0],
      description: "Tribus Aït H'ddidou & Aït Yahia",
      icon: <Users className="h-6 w-6 text-brand-accent" />,
      color: "bg-brand-sand border border-brand-light-gray"
    }
  ];

  return (
    <div className="w-full">
      {/* Hero Section - Sliding Carousel (Fullscreen, no padding) */}
      <section className="relative h-screen w-full overflow-hidden shadow-xl flex items-center group">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0 z-0"
          >
            <img
              src={getAssetUrl(slides[activeSlide].image)}
              alt={slides[activeSlide].title}
              className="w-full h-full object-cover transform scale-100 transition-transform duration-[6000ms]"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#2D342F]/90 via-[#2D342F]/55 to-transparent"></div>
          </motion.div>
        </AnimatePresence>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-stone-100 w-full">
          <div className="max-w-4xl space-y-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSlide}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="space-y-5"
              >
                <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-brand-accent/25 border border-brand-accent/35 rounded-full text-brand-accent text-xs font-bold font-sans uppercase tracking-widest">
                  <span>{slides[activeSlide].badge}</span>
                  <span className="h-1.5 w-1.5 bg-brand-accent rounded-full animate-pulse"></span>
                  <span>PNHAO</span>
                </div>
                
                <h1 className="font-serif font-bold text-4xl sm:text-6xl tracking-tight text-white leading-tight">
                  {slides[activeSlide].title} <br />
                  <span className="italic font-normal text-brand-accent text-2xl sm:text-4xl block mt-1">{slides[activeSlide].subtitle}</span>
                </h1>

                <p className="text-sm sm:text-base text-stone-200 max-w-xl font-sans leading-relaxed">
                  {slides[activeSlide].description}
                </p>

                <div className="flex flex-wrap gap-4 pt-2">
                  <button
                    onClick={() => setCurrentTab(slides[activeSlide].actionTab)}
                    className="px-6 py-3.5 bg-brand-primary hover:bg-[#3d4d41] active:bg-[#2f3d32] text-white rounded-2xl text-xs sm:text-sm font-bold transition-all shadow-md flex items-center space-x-2 cursor-pointer"
                  >
                    <Trees className="h-4 w-4" />
                    <span>{slides[activeSlide].actionLabel}</span>
                  </button>
                  <button
                    onClick={() => setCurrentTab('tourism')}
                    className="px-6 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center space-x-2 backdrop-blur-sm cursor-pointer"
                  >
                    <Waves className="h-4 w-4" />
                    <span>Guide Pratique</span>
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Slide Controls (Arrows) */}
        <button
          onClick={handlePrev}
          className="absolute left-6 z-20 p-2.5 rounded-full bg-[#2D342F]/40 hover:bg-[#2D342F]/75 text-white transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 border border-white/15 cursor-pointer"
          aria-label="Diapositive précédente"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={handleNext}
          className="absolute right-6 z-20 p-2.5 rounded-full bg-[#2D342F]/40 hover:bg-[#2D342F]/75 text-white transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 border border-white/15 cursor-pointer"
          aria-label="Diapositive suivante"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Slide Dots */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveSlide(index)}
              className={`h-2.5 rounded-full transition-all cursor-pointer ${
                activeSlide === index ? 'w-8 bg-brand-accent' : 'w-2.5 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Aller à la diapositive ${index + 1}`}
            />
          ))}
        </div>

        {/* Bouncing Scroll Indicator */}
        <div className="absolute bottom-10 left-6 sm:left-12 z-20 hidden md:flex flex-col items-start text-white/75 animate-bounce">
          <span className="text-[9px] uppercase tracking-widest font-sans font-bold mb-1">Découvrir le parc</span>
          <ChevronDown className="h-4 w-4 text-brand-accent" />
        </div>

        {/* Floating Quick Info Card */}
        <div className="absolute bottom-10 right-6 sm:right-12 z-10 hidden xl:block bg-[#2D342F]/95 backdrop-blur-md border border-brand-primary/30 p-5 rounded-[24px] max-w-xs text-stone-200 text-xs space-y-3 shadow-xl">
          <div className="flex items-center space-x-2 text-brand-accent font-bold font-sans uppercase tracking-widest text-[10px]">
            <Calendar className="h-4 w-4" />
            <span>Fiche Technique</span>
          </div>
          <div className="space-y-1.5 font-sans">
            <p><span className="text-stone-400">Création :</span> {PARK_METADATA.creationDate}</p>
            <p><span className="text-stone-400">Superficie :</span> {PARK_METADATA.area}</p>
            <p><span className="text-stone-400">Localisation :</span> {PARK_METADATA.location}</p>
            <p><span className="text-stone-400">Statut :</span> Ramsar & Réserve de Biosphère UNESCO</p>
          </div>
        </div>
      </section>

      {/* Full-width Interactive Map Button Banner */}
      <div className="w-full bg-[#1e2320] border-b border-brand-light-gray/20 py-8 px-4 sm:px-6 lg:px-8 relative z-10 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start space-x-4">
            <div className="bg-brand-accent/10 p-3 rounded-2xl border border-brand-accent/20 text-brand-accent shrink-0">
              <Compass className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif font-bold text-lg sm:text-xl text-white leading-tight">Carte interactive PNHAO</h3>
              <p className="text-xs sm:text-sm text-stone-300 font-sans max-w-xl">
                Explorez en plein écran la cartographie interactive du Parc National (SIG, sentiers de randonnée, infrastructures d'accueil, biodiversité et zonage de protection).
              </p>
            </div>
          </div>
          <button
            onClick={onOpenInteractiveMap}
            className="w-full md:w-auto px-8 py-4 bg-brand-accent hover:bg-brand-accent/95 text-[#2D342F] font-bold font-sans text-sm rounded-2xl cursor-pointer shadow-lg active:scale-[0.98] transition-all flex items-center justify-center space-x-2.5 shrink-0 group"
          >
            <Compass className="h-4.5 w-4.5 text-[#2D342F] group-hover:rotate-45 transition-transform duration-300" />
            <span>Ouvrir la Carte Interactive</span>
          </button>
        </div>
      </div>

      {/* Main Content Sections wrapped in centered container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        {/* Key Stats Cards Section */}
        <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-brand-accent uppercase tracking-widest text-xs font-bold font-sans">Aperçu Clé</span>
          <h2 className="font-serif font-bold text-2xl sm:text-4xl text-brand-text tracking-tight">Le Parc en Quelques Chiffres</h2>
          <p className="text-sm text-stone-500 font-sans">Un espace majestueux géré de façon concertée pour la préservation et le développement.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white border border-brand-light-gray rounded-[28px] p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold font-sans tracking-widest text-brand-primary uppercase">
                  {stat.label}
                </span>
                <div className="p-3 rounded-full bg-brand-sand">
                  {stat.icon}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-xl sm:text-2xl font-serif font-bold text-brand-text tracking-tight block">
                  {stat.value}
                </span>
                <span className="text-xs text-stone-500 font-sans block leading-normal">
                  {stat.description}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Interactive Vegetation Stages Visualization */}
      <section className="bg-white border border-brand-light-gray rounded-[40px] p-6 sm:p-10 space-y-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1.5">
            <span className="text-xs font-bold font-sans uppercase tracking-widest text-brand-accent">Profil Altitudinal</span>
            <h3 className="font-serif font-bold text-2xl sm:text-3xl text-brand-text tracking-tight">Étages de Végétation du PNHAO</h3>
            <p className="text-sm text-stone-500 max-w-2xl font-sans">
              En raison de son relief accidenté de haute montagne, le parc présente un étagement remarquable de sa biodiversité. Cliquez sur un étage pour explorer sa composition.
            </p>
          </div>
          <div className="bg-brand-sand px-4 py-2 rounded-full border border-brand-light-gray text-xs text-brand-primary font-sans font-bold flex items-center space-x-2 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-brand-accent animate-pulse"></span>
            <span>Échelle interactive de 1654 m à 3164 m</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Custom Interactive SVG Graph (Mountain Pyramid) */}
          <div className="lg:col-span-7 flex justify-center">
            <div className="relative w-full max-w-md aspect-[4/3] bg-brand-bg rounded-[32px] border border-brand-light-gray p-6 shadow-inner">
              <svg viewBox="0 0 400 300" className="w-full h-full overflow-visible select-none">
                {/* Mountain peak lines */}
                <path d="M 200,20 L 50,280 L 350,280 Z" fill="#F4F1EA" stroke="#E2E8E0" strokeWidth="2" />
                <path d="M 200,20 L 160,280 L 200,280 Z" fill="#ebe6dd" />

                {/* Grid guidelines & altitudes */}
                <line x1="20" y1="20" x2="380" y2="20" stroke="#F4F1EA" strokeDasharray="3" />
                <text x="30" y="25" fill="#4A5D4E" className="text-[10px] font-sans font-bold">3164m (Sommet)</text>

                <line x1="20" y1="80" x2="380" y2="80" stroke="#F4F1EA" strokeDasharray="3" />
                <text x="30" y="85" fill="#4A5D4E" className="text-[10px] font-sans font-bold">2700m</text>

                <line x1="20" y1="160" x2="380" y2="160" stroke="#F4F1EA" strokeDasharray="3" />
                <text x="30" y="165" fill="#4A5D4E" className="text-[10px] font-sans font-bold">2200m</text>

                <line x1="20" y1="230" x2="380" y2="230" stroke="#F4F1EA" strokeDasharray="3" />
                <text x="30" y="235" fill="#4A5D4E" className="text-[10px] font-sans font-bold">1800m</text>

                <line x1="20" y1="280" x2="380" y2="280" stroke="#E2E8E0" strokeWidth="1.5" />
                <text x="30" y="295" fill="#4A5D4E" className="text-[10px] font-sans font-bold">1654m (Oueds)</text>

                {/* Interactive Horizontal Slices of the Mountain */}
                {/* 1. Oroméditerranéen (2700m - 3164m) */}
                <polygon
                  points="200,20 170,80 230,80"
                  className={`cursor-pointer transition-all duration-300 ${
                    selectedStage === 3 ? 'fill-brand-accent stroke-[#b8714b] stroke-2 filter drop-shadow-sm' : 'fill-brand-accent/40 hover:fill-brand-accent/60'
                  }`}
                  onClick={() => setSelectedStage(3)}
                />
                
                {/* 2. Montagnard Méditerranéen (2200m - 2700m) */}
                <polygon
                  points="170,80 230,80 255,160 145,160"
                  className={`cursor-pointer transition-all duration-300 ${
                    selectedStage === 2 ? 'fill-brand-primary stroke-[#3b4c3e] stroke-2 filter drop-shadow-sm' : 'fill-brand-primary/40 hover:fill-brand-primary/60'
                  }`}
                  onClick={() => setSelectedStage(2)}
                />

                {/* 3. Supraméditerranéen (1800m - 2200m) */}
                <polygon
                  points="145,160 255,160 275,230 125,230"
                  className={`cursor-pointer transition-all duration-300 ${
                    selectedStage === 1 ? 'fill-[#687C6C] stroke-[#4A5D4E] stroke-2 filter drop-shadow-sm' : 'fill-[#687C6C]/40 hover:fill-[#687C6C]/60'
                  }`}
                  onClick={() => setSelectedStage(1)}
                />

                {/* 4. Mésoméditerranéen (1654m - 1800m) */}
                <polygon
                  points="125,230 275,230 290,280 110,280"
                  className={`cursor-pointer transition-all duration-300 ${
                    selectedStage === 0 ? 'fill-[#8FA594] stroke-[#687C6C] stroke-2 filter drop-shadow-sm' : 'fill-[#8FA594]/40 hover:fill-[#8FA594]/60'
                  }`}
                  onClick={() => setSelectedStage(0)}
                />

                {/* Interactive Legend Labels on the Mountain */}
                <text x="200" y="60" textAnchor="middle" fill="#ffffff" className="text-[9px] pointer-events-none font-sans font-bold">11%</text>
                <text x="200" y="125" textAnchor="middle" fill="#ffffff" className="text-[9px] pointer-events-none font-sans font-bold">55%</text>
                <text x="200" y="195" textAnchor="middle" fill="#ffffff" className="text-[9px] pointer-events-none font-sans font-bold">28%</text>
                <text x="200" y="258" textAnchor="middle" fill="#ffffff" className="text-[9px] pointer-events-none font-sans font-bold">5%</text>
              </svg>
            </div>
          </div>

          {/* Side Info Panel detailing the Selected Stage */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-brand-sand/50 p-6 rounded-[28px] border border-brand-light-gray shadow-sm space-y-4">
              <div className="flex items-center space-x-3">
                <div
                  className="w-4.5 h-4.5 rounded-full shadow-sm"
                  style={{ backgroundColor: VEGETATION_STAGES[selectedStage].color === '#0369a1' ? '#D68C67' : VEGETATION_STAGES[selectedStage].color === '#047857' ? '#4A5D4E' : VEGETATION_STAGES[selectedStage].color === '#16a34a' ? '#687C6C' : '#8FA594' }}
                ></div>
                <span className="text-xs font-bold font-sans tracking-widest text-brand-primary uppercase">
                  {VEGETATION_STAGES[selectedStage].altitude}
                </span>
              </div>
              
              <div className="space-y-1">
                <h4 className="font-serif font-bold text-xl text-brand-text tracking-tight leading-tight">
                  {VEGETATION_STAGES[selectedStage].name}
                </h4>
                <p className="text-xs text-stone-500 font-sans font-semibold">
                  Part du parc : <span className="font-bold text-brand-primary">{VEGETATION_STAGES[selectedStage].percentage}%</span> ({VEGETATION_STAGES[selectedStage].area})
                </p>
              </div>

              <p className="text-sm text-stone-600 leading-relaxed font-sans">
                {VEGETATION_STAGES[selectedStage].description}
              </p>

              <div className="pt-3 border-t border-brand-light-gray flex items-center justify-between">
                <span className="text-[11px] text-stone-500 font-sans font-medium">Cliquez sur un autre étage de la montagne pour comparer</span>
                <HelpCircle className="h-4 w-4 text-brand-primary/40" />
              </div>
            </div>

            {/* Quick action card */}
            <div className="bg-gradient-to-br from-[#2D342F] to-[#4A5D4E] p-6 rounded-[28px] text-stone-100 flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <h5 className="text-sm font-bold text-white font-sans">Prêt à explorer les sentiers ?</h5>
                <p className="text-xs text-stone-300 max-w-[200px] font-sans">Découvrez nos itinéraires pédestres et circuits balisés.</p>
              </div>
              <button
                onClick={() => setCurrentTab('tourism')}
                className="p-3.5 bg-brand-accent hover:bg-[#c27954] rounded-full transition-colors shadow-md text-white"
              >
                <Compass className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Spotlight: Mouflon à manchettes */}
      <section className="space-y-6">
        <div className="space-y-1.5">
          <span className="text-brand-accent uppercase tracking-widest text-xs font-bold font-sans flex items-center gap-1.5">
            <Sparkles className="h-4 w-4" />
            <span>Espèce Emblématique</span>
          </span>
          <h3 className="font-serif font-bold text-2xl sm:text-3xl text-brand-text tracking-tight">
            L'Emblème du Parc : Le Mouflon à manchettes
          </h3>
          <p className="text-sm text-stone-500 max-w-2xl font-sans">
            Une espèce majestueuse protégée qui règne avec bravoure et agilité sur les hauts reliefs sédimentaires du Djebel Ayachi.
          </p>
        </div>

        <div className="bg-[#2D342F] rounded-[40px] overflow-hidden shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-6 border border-brand-primary/20">
          <div className="lg:col-span-5 h-[320px] lg:h-auto relative bg-brand-sand">
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
              <h4 className="font-serif font-bold text-3xl text-white tracking-tight">Le Mouflon à manchettes</h4>
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
                onClick={() => setCurrentTab('faune')}
                className="px-5 py-2 bg-brand-accent hover:bg-amber-600 transition-colors text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 cursor-pointer"
              >
                <Eye className="h-3.5 w-3.5" />
                <span>Découvrir l'Espace Faune</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Random Fauna Spotlight Section */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <span className="text-brand-accent uppercase tracking-widest text-xs font-bold font-sans flex items-center gap-1.5">
              <Bird className="h-4 w-4" />
              <span>Aperçu de la Biodiversité</span>
            </span>
            <h3 className="font-serif font-bold text-2xl sm:text-3xl text-brand-text tracking-tight">
              Faune Sauvage Remarquable
            </h3>
            <p className="text-sm text-stone-500 max-w-2xl font-sans">
              Le PNHAO est un sanctuaire d'espèces animales rares et protégées. Voici une sélection aléatoire d'habitants du parc.
            </p>
          </div>
          <button
            onClick={() => setCurrentTab('faune')}
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-brand-primary hover:bg-[#1f2521] text-stone-100 rounded-full text-xs font-bold tracking-wide transition-all shadow-sm shrink-0 cursor-pointer"
          >
            <span>Voir toute la faune</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {randomAnimals.map((item) => {
            const imageInfo = FAUNA_IMAGES[item.id] || { image: "/images/faune/photo-1546182990-dffeafbe841d_0037df.jpg", gallery: [] };
            return (
              <div
                key={item.id}
                className="bg-white border border-brand-light-gray rounded-[28px] overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="h-[200px] w-full relative overflow-hidden bg-brand-sand">
                    <img
                      src={getAssetUrl(imageInfo.image)}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 left-4">
                      <span className={`text-[9px] font-bold font-sans uppercase px-2.5 py-1 rounded-full border shadow-sm bg-white/90 text-brand-primary border-brand-light-gray/40`}>
                        {item.group === 'mammal' ? 'Mammifère' :
                         item.group === 'bird' ? 'Oiseau' :
                         item.group === 'reptile' ? 'Reptile' : 'Amphibien'}
                      </span>
                    </div>
                    {item.isEndemic && (
                      <div className="absolute top-4 right-4">
                        <span className="bg-brand-accent/90 text-white text-[9px] font-bold font-sans px-2.5 py-1 rounded-full border border-brand-accent/20 shadow-sm">
                          Endémique
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-5 space-y-2">
                    <div className="space-y-0.5">
                      <h4 className="font-serif font-bold text-base text-brand-text tracking-tight">
                        {item.name}
                      </h4>
                      <p className="text-[11px] font-mono text-brand-primary italic">
                        {item.scientificName}
                      </p>
                    </div>
                    <p className="text-xs text-stone-600 font-sans leading-relaxed line-clamp-3">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0 border-t border-brand-light-gray/40 mt-3 flex items-center justify-between text-[11px]">
                  <span className="font-sans text-stone-500 font-medium">Statut :</span>
                  <span className="font-sans font-bold text-brand-primary">{item.status}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Random Flora Spotlight Section */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <span className="text-brand-accent uppercase tracking-widest text-xs font-bold font-sans flex items-center gap-1.5">
              <Leaf className="h-4 w-4" />
              <span>Patrimoine Botanique</span>
            </span>
            <h3 className="font-serif font-bold text-2xl sm:text-3xl text-brand-text tracking-tight">
              Flore Sauvage et Forêts
            </h3>
            <p className="text-sm text-stone-500 max-w-2xl font-sans">
              Entre cèdres millénaires et plantes aromatiques médicinales endémiques de l'Atlas. Explorez un échantillon de notre flore.
            </p>
          </div>
          <button
            onClick={() => setCurrentTab('flore')}
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-brand-primary hover:bg-[#1f2521] text-stone-100 rounded-full text-xs font-bold tracking-wide transition-all shadow-sm shrink-0 cursor-pointer"
          >
            <span>Voir toute la flore</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {randomPlants.map((item) => {
            const imageInfo = FLORA_IMAGES[item.id] || { image: "/images/flore/photo-1501004318641-b39e6451bec6_006db8.jpg", gallery: [] };
            return (
              <div
                key={item.id}
                className="bg-white border border-brand-light-gray rounded-[28px] overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="h-[200px] w-full relative overflow-hidden bg-brand-sand">
                    <img
                      src={getAssetUrl(imageInfo.image)}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 left-4">
                      <span className={`text-[9px] font-bold font-sans uppercase px-2.5 py-1 rounded-full border shadow-sm bg-white/90 text-brand-primary border-brand-light-gray/40`}>
                        {item.category === 'endemic' ? 'Endémique' :
                         item.category === 'medicinal' ? 'Aromatique / PAM' : 'Espèce Protégée'}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <div className="space-y-0.5">
                      <h4 className="font-serif font-bold text-base text-brand-text tracking-tight">
                        {item.name}
                      </h4>
                      <p className="text-[11px] font-mono text-brand-primary italic">
                        {item.scientificName}
                      </p>
                    </div>
                    <p className="text-xs text-stone-600 font-sans leading-relaxed line-clamp-3">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0 border-t border-brand-light-gray/40 mt-3 flex items-center justify-between text-[11px]">
                  <span className="font-sans text-stone-500 font-medium">Statut :</span>
                  <span className="font-sans font-bold text-brand-primary">{item.status}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>


      {/* Preservation Partners section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-brand-sand/40 p-8 sm:p-10 rounded-[40px] border border-brand-light-gray shadow-sm">
        <div className="space-y-4">
          <span className="text-[10px] uppercase font-sans tracking-widest text-brand-primary font-bold block">
            Institution d'Excellence
          </span>
          <h3 className="font-serif font-bold text-2xl sm:text-3xl text-brand-text tracking-tight">
            Agence Nationale des Eaux et Forêts (ANEF)
          </h3>
          <p className="text-sm text-stone-600 leading-relaxed font-sans">
            La gestion du Parc National du Haut Atlas Oriental est assurée par l'ANEF, avec une double vocation fondamentale : d'une part la <span className="font-bold text-brand-primary">protection</span> et la réhabilitation des écosystèmes forestiers millénaires, et d'autre part le <span className="font-bold text-brand-primary">progrès social</span> participatif au service des populations locales. Le parc s'étend administrativement sur les cercles de Midelt et d'Imilchil (Province de Midelt, Région Drâa-Tafilalet) et regroupe <span className="font-bold text-brand-primary">quatre cantons forestiers majeurs</span> et quatre communes (Boumia, Itzer, Tonfite et Imilchil).
          </p>
          <p className="text-sm text-stone-600 leading-relaxed font-sans">
            Dans le cadre de la stratégie nationale <span className="font-bold text-brand-primary">Green-Génération (2020-2030)</span>, des actions concrètes sont menées : distribution de fours solaires/gaz pour alléger la pression sur le bois de feu, plantations d'arbres fruitiers, et formation des jeunes ruraux à l'éco-tourisme et l'artisanat.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setCurrentTab('preservation')}
              className="text-sm text-brand-primary hover:text-brand-accent font-bold inline-flex items-center space-x-1.5 underline"
            >
              <span>En savoir plus sur la charte et nos défis</span>
              <span>&rarr;</span>
            </button>
          </div>
        </div>

        {/* Scenic image side card */}
        <div className="rounded-[32px] overflow-hidden shadow-md h-[300px] relative border border-brand-light-gray">
          <img
            src={getAssetUrl("/images/atlas_kasbah_village_1783949848718.jpg")}
            alt="Habitations traditionnelles du PNHAO"
            className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2D342F]/80 via-[#2D342F]/20 to-transparent flex items-end p-6 text-white">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase font-sans tracking-widest text-brand-accent">Patrimoine Intégré</span>
              <p className="text-sm font-semibold font-serif">L'espace habité se concentre harmonieusement le long des vallées fertiles.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Recommended Circuits section (added from ecotourism page) */}
      <section className="space-y-6 pt-8 border-t border-brand-light-gray/60">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <span className="text-brand-accent uppercase tracking-widest text-xs font-bold font-sans">Itinéraires Balisés</span>
            <h3 className="font-serif font-bold text-2xl sm:text-3xl text-brand-text tracking-tight">Les Circuits Recommandés</h3>
            <p className="text-sm text-stone-500 font-sans max-w-xl">
              Des tracés officiels balisés et conseillés pour vivre pleinement l'expérience authentique de l'Atlas.
            </p>
          </div>
          <button
            onClick={() => setCurrentTab('tourism')}
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-brand-primary hover:bg-[#1f2521] text-stone-100 rounded-full text-xs font-bold tracking-wide transition-all shadow-sm shrink-0 cursor-pointer"
          >
            <span>Tous les circuits & conseils</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TOURIST_CIRCUITS.map((circuit) => (
            <div
              key={circuit.id}
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
                  <h4 className="font-serif font-bold text-base text-brand-text tracking-tight leading-snug">
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
            </div>
          ))}
        </div>
      </section>

      {/* Division Administrative & Contact Form sections (added from contact page) */}
      <section className="space-y-8 pt-8 border-t border-brand-light-gray/60">
        <div className="space-y-1.5">
          <span className="text-xs font-bold font-sans uppercase tracking-widest text-brand-accent">Formulaire de Contact & Assistance</span>
          <h2 className="font-serif font-bold text-2xl sm:text-3xl text-brand-text tracking-tight">Division Administrative & Écrivez-nous directement</h2>
          <p className="text-sm text-stone-500 max-w-2xl font-sans">
            Vous préparez une randonnée, un projet ou souhaitez poser une question ? Contactez les services administratifs de l'ANEF ou remplissez notre formulaire direct.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Side: Contact details & Administrative Structures */}
          <div className="lg:col-span-5 space-y-6">
            {/* Main Info Card */}
            <div className="bg-white border border-brand-light-gray rounded-[32px] p-6 sm:p-8 space-y-6 shadow-sm">
              <h3 className="font-serif font-bold text-lg text-brand-text flex items-center space-x-2">
                <Building className="h-5 w-5 text-brand-primary" />
                <span>Division Administrative</span>
              </h3>
              
              <div className="space-y-4 text-xs sm:text-sm font-sans text-stone-600">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-brand-accent shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-brand-primary">Direction Provinciale de l'ANEF</p>
                    <p>Service du Parc National du Haut Atlas Oriental</p>
                    <p>B.P. 53, Province de Midelt, Région Drâa-Tafilalet, Maroc</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-brand-accent shrink-0" />
                  <div>
                    <p className="font-bold text-brand-primary">Ligne Téléphonique Directe</p>
                    <p>+212 (0) 535 58 20 04 / +212 (0) 535 58 20 07</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-brand-accent shrink-0" />
                  <div>
                    <p className="font-bold text-brand-primary">Courriels Officiels</p>
                    <p className="font-semibold text-brand-primary">hao@pnm.ma</p>
                    <p>dpeflcd-midelt@anef.gov.ma</p>
                    <p>support@anef.gov.ma</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Clock className="h-5 w-5 text-brand-accent shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-brand-primary">Horaires d'Ouverture des Bureaux</p>
                    <p>Lundi au Vendredi : 8h30 - 16h30</p>
                    <p>Fermé le week-end et lors des fêtes nationales</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-brand-light-gray flex items-center space-x-2.5 text-xs text-brand-accent bg-brand-sand/50 p-3 rounded-xl border">
                <ShieldAlert className="h-5 w-5 shrink-0" />
                <span><strong>Urgence Secours :</strong> En cas de détresse en haute montagne, informez la Protection Civile locale ou la Gendarmerie Royale au <strong>150 / 19</strong>.</span>
              </div>
            </div>

          
          </div>

          {/* Right Side: Interactive Form */}
          <div className="lg:col-span-7 bg-white border border-brand-light-gray rounded-[32px] p-6 sm:p-10 shadow-sm space-y-6">
            <div className="space-y-1">
              <h3 className="font-serif font-bold text-lg sm:text-xl text-brand-text">Écrivez-nous directement</h3>
              <p className="text-xs sm:text-sm text-stone-500 font-sans">
                Remplissez le formulaire ci-dessous et nos éco-conseillers vous répondront par email sous 48 heures.
              </p>
            </div>

            {submitSuccess ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-3">
                <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto" />
                <h4 className="font-serif font-bold text-lg text-emerald-800">Message envoyé avec succès !</h4>
                <p className="text-xs sm:text-sm text-emerald-700 font-sans max-w-md mx-auto">
                  Merci d'avoir contacté le Parc National du Haut Atlas Oriental. Une copie de votre message a été transmise aux services de l'ANEF. Nous reviendrons vers vous très prochainement.
                </p>
                <button
                  onClick={() => setSubmitSuccess(false)}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold font-sans transition-all cursor-pointer shadow-sm"
                >
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {submitError && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-4 text-xs font-sans flex items-start space-x-2.5">
                    <ShieldAlert className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Erreur de transmission</p>
                      <p className="mt-0.5">{submitError}</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label htmlFor="fullNameHome" className="text-xs font-bold text-brand-primary font-sans uppercase tracking-wider block">
                      Nom complet <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="fullNameHome"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="ex: Rachid Alaoui"
                      className={`w-full bg-brand-sand/30 border rounded-xl py-2.5 px-3 text-xs sm:text-sm text-brand-text focus:outline-none focus:ring-2 transition-all ${
                        formErrors.fullName ? 'border-rose-400 focus:ring-rose-200' : 'border-brand-light-gray focus:ring-brand-primary/20 focus:border-brand-primary'
                      }`}
                    />
                    {formErrors.fullName && <p className="text-[10px] text-rose-500 font-semibold">{formErrors.fullName}</p>}
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label htmlFor="emailHome" className="text-xs font-bold text-brand-primary font-sans uppercase tracking-wider block">
                      Adresse email <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="emailHome"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="ex: rachid@domain.com"
                      className={`w-full bg-brand-sand/30 border rounded-xl py-2.5 px-3 text-xs sm:text-sm text-brand-text focus:outline-none focus:ring-2 transition-all ${
                        formErrors.email ? 'border-rose-400 focus:ring-rose-200' : 'border-brand-light-gray focus:ring-brand-primary/20 focus:border-brand-primary'
                      }`}
                    />
                    {formErrors.email && <p className="text-[10px] text-rose-500 font-semibold">{formErrors.email}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Subject */}
                  <div className="space-y-1.5">
                    <label htmlFor="subjectHome" className="text-xs font-bold text-brand-primary font-sans uppercase tracking-wider block">
                      Sujet de demande <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="subjectHome"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="ex: Réservation de guide"
                      className={`w-full bg-brand-sand/30 border rounded-xl py-2.5 px-3 text-xs sm:text-sm text-brand-text focus:outline-none focus:ring-2 transition-all ${
                        formErrors.subject ? 'border-rose-400 focus:ring-rose-200' : 'border-brand-light-gray focus:ring-brand-primary/20 focus:border-brand-primary'
                      }`}
                    />
                    {formErrors.subject && <p className="text-[10px] text-rose-500 font-semibold">{formErrors.subject}</p>}
                  </div>

                  {/* Profile Selector */}
                  <div className="space-y-1.5">
                    <label htmlFor="roleHome" className="text-xs font-bold text-brand-primary font-sans uppercase tracking-wider block">
                      Votre profil
                    </label>
                    <select
                      id="roleHome"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="w-full bg-brand-sand/30 border border-brand-light-gray rounded-xl py-2.5 px-3 text-xs sm:text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all cursor-pointer"
                    >
                      <option value="visitor">Visiteur / Touriste de passage</option>
                      <option value="researcher">Chercheur / Scientifique</option>
                      <option value="partner">Organisme Partenaire / ONG</option>
                      <option value="local">Habitant local de la province</option>
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-1.5">
                  <label htmlFor="messageHome" className="text-xs font-bold text-brand-primary font-sans uppercase tracking-wider block">
                    Contenu du message <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    id="messageHome"
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Écrivez vos questions en détail ici..."
                    className={`w-full bg-brand-sand/30 border rounded-xl py-2.5 px-3 text-xs sm:text-sm text-brand-text focus:outline-none focus:ring-2 transition-all ${
                      formErrors.message ? 'border-rose-400 focus:ring-rose-200' : 'border-brand-light-gray focus:ring-brand-primary/20 focus:border-brand-primary'
                    }`}
                  />
                  {formErrors.message && <p className="text-[10px] text-rose-500 font-semibold">{formErrors.message}</p>}
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-brand-primary hover:bg-[#3d4d41] disabled:bg-stone-300 text-white font-bold py-3 px-6 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-2 text-xs sm:text-sm shadow-md"
                >
                  {isSubmitting ? (
                    <span>Transmission en cours...</span>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Transmettre mon Message</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      </div>
    </div>
  );
}
