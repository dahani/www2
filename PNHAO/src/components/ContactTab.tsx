/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Phone, MapPin, Send, HelpCircle, ChevronDown, ChevronUp, Clock, ShieldAlert, CheckCircle2, Building, Landmark, Compass } from 'lucide-react';
import L from 'leaflet';
import { PARK_GEOJSON } from '../geojson';
import { getAssetUrl } from '../utils';

interface FAQItem {
  question: string;
  answer: string;
}

function ParkMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [32.22, -5.35],
      zoom: 9,
      zoomControl: true,
      fullscreenControl: true,
      scrollWheelZoom: false
    } as any);

    mapInstanceRef.current = map;

    // Custom Fullscreen Control
    const FullscreenControl = L.Control.extend({
      options: {
        position: 'topleft'
      },
      onAdd: function() {
        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-fullscreen');
        const button = L.DomUtil.create('a', 'leaflet-control-fullscreen-button', container);
        button.href = '#';
        button.title = 'Plein écran';
        button.role = 'button';
        button.style.width = '30px';
        button.style.height = '30px';
        button.style.lineHeight = '30px';
        button.style.display = 'flex';
        button.style.alignItems = 'center';
        button.style.justifyContent = 'center';
        button.style.backgroundColor = 'white';
        
        const updateIcon = () => {
          if (document.fullscreenElement) {
            button.innerHTML = `
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2D342F" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 14h6v6M20 10h-6V4M14 10l7-7M10 14l-7 7"/>
              </svg>
            `;
            button.title = 'Quitter le plein écran';
          } else {
            button.innerHTML = `
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2D342F" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
              </svg>
            `;
            button.title = 'Plein écran';
          }
        };

        updateIcon();

        L.DomEvent.disableClickPropagation(container);
        L.DomEvent.on(button, 'click', function(e) {
          L.DomEvent.stop(e);
          const mapEl = map.getContainer();
          if (!document.fullscreenElement) {
            if (mapEl.requestFullscreen) {
              mapEl.requestFullscreen();
            } else if ((mapEl as any).mozRequestFullScreen) {
              (mapEl as any).mozRequestFullScreen();
            } else if ((mapEl as any).webkitRequestFullscreen) {
              (mapEl as any).webkitRequestFullscreen();
            } else if ((mapEl as any).msRequestFullscreen) {
              (mapEl as any).msRequestFullscreen();
            }
          } else {
            if (document.exitFullscreen) {
              document.exitFullscreen();
            } else if ((document as any).mozCancelFullScreen) {
              (document as any).mozCancelFullScreen();
            } else if ((document as any).webkitExitFullscreen) {
              (document as any).webkitExitFullscreen();
            } else if ((document as any).msExitFullscreen) {
              (document as any).msExitFullscreen();
            }
          }
        });

        const onFullscreenChange = () => {
          updateIcon();
          // Invalidate size to force leaflet to recalculate container bounds
          setTimeout(() => {
            map.invalidateSize();
          }, 100);
        };

        document.addEventListener('fullscreenchange', onFullscreenChange);
        document.addEventListener('webkitfullscreenchange', onFullscreenChange);
        document.addEventListener('mozfullscreenchange', onFullscreenChange);
        document.addEventListener('MSFullscreenChange', onFullscreenChange);
        
        map.on('unload', () => {
          document.removeEventListener('fullscreenchange', onFullscreenChange);
          document.removeEventListener('webkitfullscreenchange', onFullscreenChange);
          document.removeEventListener('mozfullscreenchange', onFullscreenChange);
          document.removeEventListener('MSFullscreenChange', onFullscreenChange);
        });

        return container;
      }
    });

    if ((map.options as any).fullscreenControl) {
      map.addControl(new (FullscreenControl as any)());
    }

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; PNHAO- Parc National du Haut-Atlas-Oriental' ,
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);

    const geoJsonLayer = L.geoJSON(PARK_GEOJSON as any, {
      style: {
        color: '#4A5D4E',
        weight: 3,
        opacity: 0.85,
        fillColor: '#D68C67',
        fillOpacity: 0.2,
      }
    }).addTo(map);

    geoJsonLayer.bindPopup(`
      <div style="font-family: sans-serif; padding: 4px; min-width: 180px;">
        <h4 style="font-weight: bold; color: #4A5D4E; margin: 0 0 4px 0; font-size: 13px;">
          P.N. du Haut Atlas Oriental
        </h4>
        <p style="margin: 0 0 2px 0; font-size: 11px; color: #444;">
          <strong>Création :</strong> 2004
        </p>
        <p style="margin: 0; font-size: 11px; color: #444;">
          <strong>Superficie :</strong> 49 000 ha
        </p>
      </div>
    `);

    try {
      map.fitBounds(geoJsonLayer.getBounds());
    } catch (e) {
      map.setView([32.22, -5.35], 9);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
        <div className="flex items-center space-x-2">
          <Compass className="h-5 w-5 text-brand-primary" />
          <h4 className="font-serif font-bold text-lg text-brand-text">Périmètre Officiel du Parc</h4>
        </div>
        <span className="text-[10px] font-mono font-bold text-brand-accent bg-brand-accent/10 px-2.5 py-1 rounded-full w-fit">
          SIG Interactif • 49 000 Hectares
        </span>
      </div>
      <p className="text-xs text-stone-500 font-sans leading-relaxed px-1">
        Visualisez les limites officielles du Parc National du Haut Atlas Oriental (49 000 ha), s'étendant autour des lacs d'Imilchil et du massif du Djebel Ayachi.
      </p>
      <div className="w-full relative rounded-[32px] overflow-hidden border border-brand-light-gray shadow-md">
        <div 
          ref={mapRef} 
          id="leaflet-park-map"
          className="w-full h-[400px] md:h-[550px] relative z-10" 
        />
      </div>
    </div>
  );
}

export default function ContactTab() {
  // Form State
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

  // FAQ State
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);

  const faqItems: FAQItem[] = [
    {
      question: "Faut-il une autorisation préalable pour visiter le parc ?",
      answer: "L'accès aux sites d'Imilchil (Lacs Isly et Tislit) est entièrement libre et gratuit pour tous les visiteurs. En revanche, pour des ascensions de haute montagne engagées (Djebel Ayachi, Cirque de Jaffar), ou pour des expéditions de recherche scientifique, il est fortement conseillé de se déclarer auprès de la Division de l'ANEF à Midelt ou de solliciter l'aide d'un éco-guide local qualifié par mesure de sécurité."
    },
    {
      question: "Comment entrer en contact avec un éco-guide local certifié ?",
      answer: "Des guides locaux certifiés, issus des tribus Aït H'ddidou et Aït Yahia, sont disponibles à Imilchil et Tounfite. Vous pouvez les solliciter directement auprès de l'Éco-musée d'Imilchil, de la Maison du Parc, ou en contactant les coopératives d'éco-tourisme solidaire de la province de Midelt."
    },
    {
      question: "Quelle est la meilleure période de l'année pour visiter le parc ?",
      answer: "La période idéale s'étend de Mai à Octobre. Les températures y sont douces et agréables, idéales pour la randonnée et l'observation ornithologique. En Septembre, vous pourrez assister au célèbre Moussem des Fiançailles d'Imilchil. De Novembre à Avril, le climat est rude et très rigoureux avec des chutes de neige importantes bloquant certains cols routiers."
    },
    {
      question: "Le camping sauvage et le bivouac sont-ils autorisés ?",
      answer: "Le bivouac temporaire (une nuit) est toléré dans le respect strict de la charte éco-citoyenne du parc (allumage des feux interdit en forêt de cèdres, gestion rigoureuse et emport total de vos déchets, pas de camping à moins de 100m des oueds et sources pour préserver la faune et la qualité de l'eau)."
    }
  ];

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

  return (
    <div className="space-y-12">
      {/* Page Header */}
      <div className="space-y-1.5">
        <span className="text-xs font-bold font-sans uppercase tracking-widest text-brand-accent">Formulaire de Contact & Assistance</span>
        <h2 className="font-serif font-bold text-3xl sm:text-4xl text-brand-text tracking-tight">Nous Contacter & FAQ</h2>
        <p className="text-sm text-stone-500 max-w-2xl font-sans">
          Vous préparez une randonnée, une visite solidaire, un reportage ou un projet de recherche scientifique au PNHAO ? Contactez les services administratifs de l'ANEF ou écrivez-nous directement.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Contact details & Administrative Structures */}
        <div className="lg:col-span-5 space-y-6">
          {/* Main Info Card */}
          <div className="bg-white border border-brand-light-gray rounded-[32px] p-6 sm:p-8 space-y-6 shadow-sm">
            <h3 className="font-serif font-bold text-xl text-brand-text flex items-center space-x-2">
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
                  <p className="font-semibold text-brand-primary text-brand-primary">hao@pnm.ma</p>
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

          {/* Local Information (Imilchil) */}
          <div className="bg-[#2D342F] text-stone-100 rounded-[32px] p-6 sm:p-8 space-y-4 shadow-sm border border-brand-primary/20">
            <h3 className="font-serif font-bold text-xl text-white flex items-center space-x-2">
              <Landmark className="h-5 w-5 text-brand-accent" />
              <span>Éco-musée & Bureau d'Accueil</span>
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 font-sans leading-relaxed">
              Pour des informations touristiques directes de terrain sur la météo locale, l'état des pistes ou le recrutement de porteurs, visitez la <strong>Maison du Parc & Éco-musée d'Imilchil</strong>, située à l'entrée du village.
            </p>
            <div className="text-xs text-stone-300 space-y-1 font-sans">
              <p>📍 Village d'Imilchil, Province de Midelt</p>
              <p>📞 Contact Info-Guides : +212 (0) 661 58 90 22</p>
              <p>🌲 Ouvert tous les jours pendant la saison estivale</p>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Form */}
        <div className="lg:col-span-7 bg-white border border-brand-light-gray rounded-[32px] p-6 sm:p-10 shadow-sm space-y-6">
          <div className="space-y-1">
            <h3 className="font-serif font-bold text-xl sm:text-2xl text-brand-text">Écrivez-nous directement</h3>
            <p className="text-xs sm:text-sm text-stone-500 font-sans">
              Remplissez le formulaire ci-dessous et nos éco-conseillers vous répondront par email sous 48 heures.
            </p>
          </div>

          {submitSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-3"
            >
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
            </motion.div>
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
                  <label htmlFor="fullName" className="text-xs font-bold text-brand-primary font-sans uppercase tracking-wider block">
                    Nom complet <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="fullName"
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
                  <label htmlFor="email" className="text-xs font-bold text-brand-primary font-sans uppercase tracking-wider block">
                    Adresse email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
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
                  <label htmlFor="subject" className="text-xs font-bold text-brand-primary font-sans uppercase tracking-wider block">
                    Sujet de demande <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="subject"
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
                  <label htmlFor="role" className="text-xs font-bold text-brand-primary font-sans uppercase tracking-wider block">
                    Votre profil
                  </label>
                  <select
                    id="role"
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
                <label htmlFor="message" className="text-xs font-bold text-brand-primary font-sans uppercase tracking-wider block">
                  Contenu du message <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="message"
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

      {/* Interactive Park Map */}
      <ParkMap />

      {/* FAQ Accordion Section */}
      <section className="bg-white border border-brand-light-gray rounded-[40px] p-6 sm:p-10 space-y-6 shadow-sm">
        <div className="flex items-center space-x-3">
          <HelpCircle className="h-6 w-6 text-brand-accent" />
          <h3 className="font-serif font-bold text-2xl text-brand-text tracking-tight">Foire Aux Questions (FAQ)</h3>
        </div>
        <p className="text-xs sm:text-sm text-stone-500 font-sans max-w-2xl">
          Retrouvez les réponses rapides aux questions fréquemment formulées par les éco-voyageurs et randonneurs préparant leur visite dans l'Atlas.
        </p>

        <div className="space-y-4 pt-2">
          {faqItems.map((item, index) => {
            const isOpen = openFaqIdx === index;
            return (
              <div
                key={index}
                className="border border-brand-light-gray rounded-2xl overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => setOpenFaqIdx(isOpen ? null : index)}
                  className="w-full bg-brand-sand/30 hover:bg-brand-sand/60 px-5 py-4 flex items-center justify-between text-left font-serif font-bold text-sm sm:text-base text-brand-text transition-colors cursor-pointer"
                >
                  <span>{item.question}</span>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-brand-primary" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-brand-primary" />
                  )}
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden bg-white"
                    >
                      <p className="p-5 text-xs sm:text-sm text-stone-600 font-sans leading-relaxed border-t border-brand-light-gray">
                        {item.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
