/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FloraItem, FaunaItem, VegetationStage, ThreatItem, TouristCircuit } from './types';

export const PARK_METADATA = {
  name: "Parc National du Haut Atlas Oriental",
  acronym: "PNHAO",
  location: "Province de Midelt, Région Drâa-Tafilalet, Maroc",
  creationDate: "08 Octobre 2004",
  bulletinOfficiel: "BO n°5255 du 11 Octobre 2004",
  area: "55 680 Hectares",
  altitudeMax: "3 164 m (Djebel Ayachi / Massif)",
  ramsarSite: "Lacs Isly et Tislit (depuis le 15 Janvier 2005)",
  biosphereReserve: "Réserve de Biosphère des Cédraies de l'Atlas (UNESCO)",
  population: "21 126 habitants (répartis en 3 683 ménages)",
  tribes: ["Aït H'ddidou", "Aït Yahia"],
  ctCount: "6 Communes Territoriales (Imilchil, Anemzi, Outerbat, Amouguer, Aït Yahia, Bouazmou)",
  householdsCount: 3683
};

export const VEGETATION_STAGES: VegetationStage[] = [
  {
    name: "Étage Mésoméditerranéen",
    altitude: "1654 m - 1800 m",
    percentage: 5,
    area: "2 961 ha",
    description: "Zones basses du parc. Formations à base de Genévrier rouge mélangé au Buxus balearica et Stipa tenacissima.",
    color: "#84cc16" // lime-500
  },
  {
    name: "Étage Supraméditerranéen",
    altitude: "1800 m - 2200 m",
    percentage: 28,
    area: "15 847 ha",
    description: "Transition arborée moyenne. Présence de Chêne vert (Quercus rotundifolia) associé au Genévrier de Phénicie.",
    color: "#22c55e" // green-500
  },
  {
    name: "Étage Montagnard Méditerranéen",
    altitude: "2200 m - 2700 m",
    percentage: 55,
    area: "30 554 ha",
    description: "Le cœur forestier du parc. Majestueuse futaie de Cèdre de l'Atlas (Cedrus atlantica) en association avec le Chêne vert et le Genévrier thurifère.",
    color: "#15803d" // green-700
  },
  {
    name: "Étage Oroméditerranéen",
    altitude: "2700 m - 3164 m",
    percentage: 11,
    area: "6 318 ha",
    description: "Sommets de haute montagne balayés par le gel. Végétation en coussinets épineux et pelouses d'altitude.",
    color: "#0369a1" // sky-700
  }
];

export const FLORA_DATA: FloraItem[] = [
  // Endemic Flora
  {
    id: "flo-1",
    name: "Thym du Maroc",
    scientificName: "Thymus maroccanus",
    category: "endemic",
    description: "Arbrisseau aromatique très recherché, endémique du Maroc. Il forme des coussinets denses et parfumés utilisés en phytothérapie locale.",
    status: "Espèce remarquable",
    habitat: "Rochers, steppes arbustives"
  },
  {
    id: "flo-2",
    name: "Saxifrage à longues feuilles",
    scientificName: "Saxifrage longifolia",
    category: "endemic",
    description: "Plante rupicole spectaculaire formant de grandes rosettes de feuilles argentées, produisant une inflorescence pyramidale blanche majestueuse.",
    status: "Rare et protégée",
    habitat: "Falaises calcaires calcicoles d'altitude"
  },
  {
    id: "flo-3",
    name: "Germandrée de Midelt",
    scientificName: "Teucrium mideltense",
    category: "endemic",
    description: "Plante ligneuse naine endémique de la région de Midelt et du Haut Atlas oriental. Elle est parfaitement adaptée à la rigueur des sécheresses hivernales.",
    status: "Endémique locale",
    habitat: "Pentes rocheuses et marnes d'altitude"
  },
  {
    id: "flo-4",
    name: "Marrube de Litardière",
    scientificName: "Marrubium litardierei",
    category: "endemic",
    description: "Plante herbacée tomenteuse de la famille des Lamiacées, remarquable pour son feuillage laineux gris-blanc qui la protège du rayonnement solaire extrême.",
    status: "Endémique remarquable",
    habitat: "Éboulis rocheux et clairières forestières"
  },
  {
    id: "flo-5",
    name: "Carum de l'Atlas",
    scientificName: "Carum atlanticum",
    category: "endemic",
    description: "Ombellifère endémique des hautes montagnes de l'Atlas marocain, faisant partie de la biodiversité précieuse du parc.",
    status: "Rare",
    habitat: "Pelouses d'altitude et fissures de roches"
  },
  {
    id: "flo-6",
    name: "Sabline de la Drise",
    scientificName: "Arenaria dyris",
    category: "endemic",
    description: "Petite plante en coussinet à fleurs blanches étoilées, habituée des climats rigoureux des sommets dépassant 2800 m.",
    status: "Spécifique d'altitude",
    habitat: "Pelouses oroméditerranéennes"
  },

  // Medicinal & Aromatic Plants (PAM)
  {
    id: "flo-7",
    name: "Thym à feuilles de sarriette",
    scientificName: "Thymus saturejoides",
    category: "medicinal",
    description: "Connu localement sous le nom d'Azoukni. Il est traditionnellement récolté par les populations locales d'Aït H'ddidou pour ses vertus antiseptiques et digestives exceptionnelles.",
    status: "Exploitée durablement",
    habitat: "Steppes rocailleuses de basse à moyenne altitude"
  },
  {
    id: "flo-8",
    name: "Lavande dentée",
    scientificName: "Lavandula dentata",
    category: "medicinal",
    description: "Lavande sauvage aux feuilles découpées et épis violets très parfumés. Utilisée pour l'extraction d'huiles essentielles et la médecine traditionnelle.",
    status: "Abondante",
    habitat: "Versants ensoleillés du mésoméditerranéen"
  },
  {
    id: "flo-9",
    name: "Menthe à longues feuilles",
    scientificName: "Mentha longifolia",
    category: "medicinal",
    description: "Menthe sauvage poussant le long des oueds et des zones humides. Elle possède une odeur de menthe poivrée intense très appréciée.",
    status: "Liée aux milieux humides",
    habitat: "Bords de cours d'eau, sources chaudes, ripisylves"
  },
  {
    id: "flo-10",
    name: "Buis des Baléares",
    scientificName: "Buxus balearica",
    category: "medicinal",
    description: "Arbuste persistant rare formant des peuplements remarquables dans les vallées abritées du parc. Ses feuilles contiennent des alcaloïdes précieux.",
    status: "Remarquable / Fragile",
    habitat: "Thalwegs humides et ombragés"
  },

  // Protected / Red List Flora
  {
    id: "flo-11",
    name: "Renoncule du M'goun",
    scientificName: "Ranunculus mgounicus",
    category: "protected",
    description: "Plante herbacée extrêmement rare, en danger critique d'extinction selon la liste rouge de l'UICN. Unique représentante d'une lignée alpine marocaine.",
    status: "Danger Critique d'Extinction (CR)",
    habitat: "Fissures humides des sommets rocheux calcaires"
  },
  {
    id: "flo-12",
    name: "Deverra d'Espagne",
    scientificName: "Deverra juncea",
    category: "protected",
    description: "Espèce de la liste rouge menacée par le surpâturage dans les zones semi-arides. Elle possède des tiges jonciformes vertes.",
    status: "En Danger (EN)",
    habitat: "Sols érodés et steppes de piémont"
  },
  {
    id: "flo-13",
    name: "Astragale de Maire",
    scientificName: "Astragalus maireanus",
    category: "protected",
    description: "Espèce vulnérable de légumineuse épineuse formant des coussins denses qui protègent le sol contre l'érosion éolienne et hydrique.",
    status: "Vulnérable (VU)",
    habitat: "Steppes à xérophytes épineux des sommets"
  },
  {
    id: "flo-14",
    name: "Laser d'Émilien",
    scientificName: "Laserpitium emilianum",
    category: "protected",
    description: "Grande ombellifère endémique du Haut Atlas, classée comme quasi menacée en raison de la collecte incontrôlée et du pâturage.",
    status: "Quasi menacée (NT)",
    habitat: "Clairières de cédraies et falaises calcaires"
  },
  {
    id: "flo-15",
    name: "Cèdre de l'Atlas",
    scientificName: "Cedrus atlantica",
    category: "endemic",
    description: "Arbre majestueux emblématique du Maroc, pouvant vivre plusieurs siècles. Il forme l'ossature des forêts d'altitude et constitue un refuge vital pour le singe Magot.",
    status: "En Danger (EN) / Protégé",
    habitat: "Montagnard méditerranéen (2200m - 2700m)"
  },
  {
    id: "flo-16",
    name: "Genévrier thurifère",
    scientificName: "Juniperus thurifera",
    category: "protected",
    description: "Conifère relique d'une résistance exceptionnelle, s'élevant jusqu'à la limite supérieure des arbres. Ses troncs noueux millénaires retiennent les sols face à l'érosion extrême.",
    status: "Très rare / Fortement protégé",
    habitat: "Étage oroméditerranéen de haute altitude (>2700m)"
  },
  {
    id: "flo-17",
    name: "Chêne vert de l'Atlas",
    scientificName: "Quercus ilex ssp. rotundifolia",
    category: "endemic",
    description: "Espèce forestière sempervirente dominante de la région méditerranéenne d'altitude. Son feuillage dense protège les bassins versants contre les rayonnements intenses.",
    status: "Espèce structurante",
    habitat: "Étage supraméditerranéen et transition montagnarde (1800m - 2400m)"
  },
  {
    id: "flo-18",
    name: "Sapin du Maroc",
    scientificName: "Abies maroccana",
    category: "protected",
    description: "Conifère rare d'une grande valeur biogéographique, endémique du nord du Maroc et présent dans certaines stations de l'Atlas. Il est protégé pour éviter son extinction.",
    status: "En Danger Critique (CR) / Protégé",
    habitat: "Versants ombragés frais d'altitude (>2000m)"
  },
  {
    id: "flo-19",
    name: "Genêt à balais",
    scientificName: "Spartium junceum",
    category: "medicinal",
    description: "Arbuste vigoureux à fleurs d'un jaune d'or éclatant. Il est réputé pour sa résilience et ses vertus médicinales cardiotoniques et diurétiques.",
    status: "Espèce remarquable",
    habitat: "Versants ensoleillés et lisières forestières"
  },
  {
    id: "flo-20",
    name: "Tamaris de l'Atlas",
    scientificName: "Tamarix africana",
    category: "protected",
    description: "Petit arbre ou arbuste parfaitement adapté aux sols saumâtres et humides. Ses racines stabilisent efficacement les berges des oueds.",
    status: "Espèce protectrice",
    habitat: "Lits des oueds, zones humides et salines"
  },
  {
    id: "flo-21",
    name: "Arganier",
    scientificName: "Argania spinosa",
    category: "endemic",
    description: "Arbre mythique endémique du Maroc, d'une résistance exceptionnelle à la sécheresse. Bien que typique du Sud-Ouest, des stations reliques existent dans les zones d'influence continentale.",
    status: "Patrimoine Mondial UNESCO / Protégé",
    habitat: "Zones semi-arides et thalwegs pierreux"
  }
];

export const FAUNA_DATA: FaunaItem[] = [
  // Mammals
  {
    id: "fau-1",
    name: "Mouflon à manchettes",
    scientificName: "Ammotragus lervia",
    group: "mammal",
    description: "Le seigneur des falaises. Le parc abrite l'une des dernières grandes populations viables de ce bovidé sauvage au Maghreb. Ses cornes impressionnantes et sa capacité à grimper les pentes escarpées sont légendaires.",
    status: "Vulnérable (VU) / Protégé",
    isEndemic: false,
    habitat: "Reliefs accidentés, falaises, crêtes rocheuses et éboulis"
  },
  {
    id: "fau-2",
    name: "Macaque de Barbarie (Singe Magot)",
    scientificName: "Macaca sylvanus",
    group: "mammal",
    description: "Le seul macaque vivant en dehors d'Asie et le seul primate sauvage d'Europe/Afrique du Nord. Il est très attaché aux forêts de Cèdre de l'Atlas (Cedrus atlantica) où il trouve sa nourriture.",
    status: "En Danger (EN) / Annexe II CITES",
    isEndemic: true, // Endémique du Maghreb
    habitat: "Forêts de cèdres de l'Atlas et falaises adjacentes"
  },
  {
    id: "fau-3",
    name: "Gazelle de Cuvier",
    scientificName: "Gazella cuvieri",
    group: "mammal",
    description: "Petite gazelle de montagne, autrefois commune, aujourd'hui confinée aux lisières du parc et zones de steppes arborées. Elle fait l'objet d'un plan de conservation strict.",
    status: "En Danger (EN) / Annexe I CITES",
    isEndemic: true, // Endémique du Maghreb
    habitat: "Pentes semi-arides et steppes arbustives"
  },
  {
    id: "fau-4",
    name: "Loutre d'Europe",
    scientificName: "Lutra lutra",
    group: "mammal",
    description: "Une incroyable curiosité dans cette zone de haute montagne aride : la loutre a été observée de façon régulière dans les eaux des légendaires lacs de montagne Isly et Tislit.",
    status: "Vulnérable (VU) au Maroc",
    isEndemic: false,
    habitat: "Lacs de montagne et oueds permanents"
  },
  {
    id: "fau-5",
    name: "Porc-épic à crête",
    scientificName: "Hystrix cristata",
    group: "mammal",
    description: "Grand rongeur nocturne couvert de piquants bicolores. Bien que discret, il joue un rôle écologique majeur en retournant la terre à la recherche de bulbes.",
    status: "En Danger (EN) au Maroc",
    isEndemic: false,
    habitat: "Zones de buissons, thalwegs et terriers rocheux"
  },

  // Birds (Ornithologie)
  {
    id: "fau-6",
    name: "Aigle royal",
    scientificName: "Aquila chrysaetos",
    group: "bird",
    description: "Superbe rapace diurne nichant dans les falaises inaccessibles du parc. Sa population est actuellement en déclin au Maroc, faisant du parc un refuge crucial.",
    status: "Nicheur sédentaire en déclin / Protégé",
    isEndemic: false,
    habitat: "Milieux escarpés, crêtes, zones de chasse ouvertes"
  },
  {
    id: "fau-7",
    name: "Vautour fauve",
    scientificName: "Gyps fulvus",
    group: "bird",
    description: "Immense planeur qui utilise les courants thermiques des montagnes. Il est menacé de disparition au Maroc et bénéficie d'une surveillance particulière du parc.",
    status: "Menacé de disparition au Maroc",
    isEndemic: false,
    habitat: "Gorges rocheuses, hautes falaises de montagne"
  },
  {
    id: "fau-8",
    name: "Mésange noire de l'Atlas",
    scientificName: "Parus ater atlas",
    group: "bird",
    description: "Un adorable petit passereau endémique de la région du Maghreb, particulièrement vif et inféodé aux forêts de cèdres de l'Atlas.",
    status: "Endémique du Maghreb / Protégé",
    isEndemic: true,
    habitat: "Cédraies et pinèdes d'altitude"
  },
  {
    id: "fau-9",
    name: "Tadorne casarca",
    scientificName: "Tadorna ferruginea",
    group: "bird",
    description: "Magnifique canard au plumage roux orangé et tête claire. Il est une figure emblématique des oiseaux d'eaux des lacs Isly et Tislit, y nichant de manière sédentaire.",
    status: "Rare comme nicheur au Maroc",
    isEndemic: false,
    habitat: "Lacs de montagne Isly et Tislit (Ramsar)"
  },
  {
    id: "fau-10",
    name: "Vautour percnoptère",
    scientificName: "Neophron percnopterus",
    group: "bird",
    description: "Aussi appelé 'Poule de Pharaon', ce petit vautour migrateur blanc et noir à face jaune est en danger critique en Europe et menacé au Maroc.",
    status: "Menacé au Maroc / En Danger (EN) UICN",
    isEndemic: false,
    habitat: "Falaises à proximité des habitations pastorales"
  },

  // Reptiles & Amphibians
  {
    id: "fau-11",
    name: "Vipère de l'Atlas",
    scientificName: "Vipera monticola",
    group: "reptile",
    description: "Petite vipère endémique très localisée du Haut Atlas. Elle vit cachée sous les roches des sommets froids au-dessus de 2500 m d'altitude.",
    status: "Endémique du Haut Atlas / Menacée",
    isEndemic: true,
    habitat: "Steppes épineuses d'altitude et pierriers"
  },
  {
    id: "fau-12",
    name: "Lézard d'Andreanszky",
    scientificName: "Atlantolacerta andreanskyi",
    group: "reptile",
    description: "Petit lézard de haute montagne extrêmement rare, inféodé aux sommets froids du Haut Atlas. C'est un véritable relique glaciaire.",
    status: "Endémique du Haut Atlas / En Danger (EN)",
    isEndemic: true,
    habitat: "Pierriers froids de haute altitude (Oroméditerranéen)"
  },
  {
    id: "fau-13",
    name: "Discoglosse peint du Maroc",
    scientificName: "Discoglossus scovazzi",
    group: "amphibian",
    description: "Amphibien endémique du Maroc de la famille des Alytidés. Il peuple les petites mares temporaires, sources et oueds du parc.",
    status: "Endémique du Maroc / Protégé",
    isEndemic: true,
    habitat: "Sources d'eau douce, petites mares et ripisylves"
  },
  {
    id: "fau-14",
    name: "Tortue grecque",
    scientificName: "Testudo graeca",
    group: "reptile",
    description: "Tortue terrestre herbivore emblématique. Elle subit une forte pression due à la dégradation des habitats et aux prélèvements illégaux.",
    status: "Vulnérable (VU) UICN / Protégée",
    isEndemic: false,
    habitat: "Steppes arbustives sèches et friches agricoles"
  },
  {
    id: "fau-15",
    name: "Renard roux de l'Atlas",
    scientificName: "Vulpes vulpes",
    group: "mammal",
    description: "Mammifère carnivore très intelligent et adaptable, habitué des zones forestières et steppes rocheuses du parc national.",
    status: "Commun / Protégé",
    isEndemic: false,
    habitat: "Forêts de cèdres, oueds et piémonts rocheux"
  },
  {
    id: "fau-16",
    name: "Huppe fasciée",
    scientificName: "Upupa epops",
    group: "bird",
    description: "Oiseau élégant au plumage bigarré et à la huppe érectile spectaculaire. Elle affectionne les milieux ouverts et forestiers du parc, s'y nourrissant d'insectes au sol.",
    status: "Nicheur sédentaire / Protégé",
    isEndemic: false,
    habitat: "Clairières, vergers d'altitude et lisières de forêts"
  },
  {
    id: "fau-17",
    name: "Perdrix de Barbarie (Perdrix Gambra)",
    scientificName: "Alectoris barbara",
    group: "bird",
    description: "Oiseau terrestre emblématique des montagnes maghrébines. Elle peuple les versants caillouteux et les forêts claires de cèdres ou de genévriers.",
    status: "Nicheur sédentaire / Protégé",
    isEndemic: true,
    habitat: "Pentes rocheuses, garrigues et forêts de montagne"
  },
  {
    id: "fau-18",
    name: "Cerf de Barbarie",
    scientificName: "Cervus elaphus barbarus",
    group: "mammal",
    description: "Le seul cerf d'Afrique du Nord. Autrefois disparu du parc, il bénéficie de programmes de réintroduction réussis dans les forêts d'altitude de l'Atlas.",
    status: "En Danger (EN) / Protégé",
    isEndemic: true,
    habitat: "Forêts de chêne vert et clairières de cédraies"
  },
  {
    id: "fau-19",
    name: "Sanglier d'Eurasie",
    scientificName: "Sus scrofa",
    group: "mammal",
    description: "Grand mammifère omnivore très commun dans les forêts du parc. Son rôle de fouisseur aide à retourner les sols forestiers pour la germination.",
    status: "Commun",
    isEndemic: false,
    habitat: "Forêts d'altitude, fourrés et lits d'oueds"
  },
  {
    id: "fau-20",
    name: "Grand Corbeau",
    scientificName: "Corvus corax",
    group: "bird",
    description: "Oiseau d'une intelligence légendaire et d'une adaptabilité hors norme, régnant sur les sommets escarpés du massif de l'Ayachi.",
    status: "Sédentaire / Commun",
    isEndemic: false,
    habitat: "Hautes crêtes, falaises rocheuses et plateaux d'altitude"
  },
  {
    id: "fau-21",
    name: "Chouette hulotte",
    scientificName: "Strix aluco",
    group: "bird",
    description: "Rapace nocturne mystérieux et élégant, trouvant refuge dans les cavités des vieux cèdres millénaires du parc.",
    status: "Nicheur sédentaire / Protégé",
    isEndemic: false,
    habitat: "Forêts de cèdres denses et chênaies"
  },
  {
    id: "fau-22",
    name: "Pic épeiche",
    scientificName: "Dendrocopos major",
    group: "bird",
    description: "Oiseau grimpeur et tambourineur emblématique des cédraies de l'Atlas. Il creuse son nid dans le tronc des arbres sénescents.",
    status: "Nicheur sédentaire",
    isEndemic: false,
    habitat: "Forêts de conifères et forêts mixtes"
  },
  {
    id: "fau-23",
    name: "Mésange charbonnière",
    scientificName: "Parus major",
    group: "bird",
    description: "Petit passereau vif et coloré, grand consommateur de chenilles processionnaires, jouant un rôle de protecteur biologique des forêts de cèdre.",
    status: "Sédentaire / Utile aux forêts",
    isEndemic: false,
    habitat: "Forêts mixtes, jardins d'altitude et vergers"
  },
  {
    id: "fau-24",
    name: "Fennec",
    scientificName: "Vulpes zerda",
    group: "mammal",
    description: "Le renard des sables aux oreilles démesurées. Bien que typique du désert, il s'aventure parfois sur les piémonts sahariens arides en lisière sud du parc.",
    status: "Protégé / Annexe II CITES",
    isEndemic: false,
    habitat: "Zones sableuses et steppes désertiques de transition"
  },
  {
    id: "fau-25",
    name: "Mangouste ichneumon",
    scientificName: "Herpestes ichneumon",
    group: "mammal",
    description: "Mammifère carnivore agile surnommé 'rat des pharaons'. C'est un chasseur redoutable de serpents et de petits rongeurs.",
    status: "Espèce remarquable",
    isEndemic: false,
    habitat: "Bordures de cours d'eau, friches et zones arbustives"
  },
  {
    id: "fau-26",
    name: "Flamant rose",
    scientificName: "Phoenicopterus roseus",
    group: "bird",
    description: "Oiseau d'eau somptueux, de passage migratoire régulier ou hivernant sur les grands plans d'eau d'altitude du parc national.",
    status: "Migrateur remarquable / Protégé",
    isEndemic: false,
    habitat: "Lacs Isly et Tislit, zones humides d'altitude"
  },
  {
    id: "fau-27",
    name: "Goéland leucophée",
    scientificName: "Larus michahellis",
    group: "bird",
    description: "Grand oiseau aquatique opportuniste, naviguant entre les côtes marocaines et les plans d'eau intérieurs de l'Atlas.",
    status: "Visiteur régulier",
    isEndemic: false,
    habitat: "Lacs de montagne et grands réservoirs d'eau"
  },
  {
    id: "fau-28",
    name: "Balbuzard pêcheur",
    scientificName: "Pandion haliaetus",
    group: "bird",
    description: "Rapace piscivore d'une habileté spectaculaire, plongeant dans les eaux claires des lacs d'Imilchil pour capturer ses proies.",
    status: "Rare / De passage / Protégé",
    isEndemic: false,
    habitat: "Lacs de montagne, grands oueds poissonneux"
  },
  {
    id: "fau-29",
    name: "Phoque moine de Méditerranée",
    scientificName: "Monachus monachus",
    group: "mammal",
    description: "L'un des mammifères marins les plus menacés au monde. Mentionné à des fins d'éducation environnementale ou de comparaison sur les espèces côtières marocaines hautement protégées.",
    status: "En Danger Critique (CR) au Maroc",
    isEndemic: false,
    habitat: "Grottes marines et plages côtières sauvages"
  },
  {
    id: "fau-30",
    name: "Goéland d’Audouin",
    scientificName: "Ichthyaetus audouinii",
    group: "bird",
    description: "Goéland élégant de taille moyenne, endémique de la Méditerranée et de ses côtes rocheuses proches, suivi scientifiquement pour sa préservation globale au Maroc.",
    status: "Vulnérable (VU) / Suivi de près",
    isEndemic: false,
    habitat: "Milieux côtiers, estuaires et lagunes"
  },
  {
    id: "fau-31",
    name: "Outarde houbara",
    scientificName: "Chlamydotis undulata",
    group: "bird",
    description: "Grand oiseau terrestre des steppes arides. Sa présence en limite sud du parc fait l'objet d'efforts conjoints de protection des biotopes steppiques.",
    status: "Vulnérable (VU) / Plan de sauvegarde",
    isEndemic: false,
    habitat: "Plaines steppiques arides et semi-désertiques"
  },
  {
    id: "fau-32",
    name: "Hyène rayée",
    scientificName: "Hyaena hyaena",
    group: "mammal",
    description: "Grand carnivore nécrophage discret et nocturne, extrêmement rare et menacé, trouvant refuge dans les grottes les plus secrètes de l'Atlas.",
    status: "Quasi menacée (NT) / Protégée au Maroc",
    isEndemic: false,
    habitat: "Gorges rocheuses, grottes et collines escarpées"
  },
  {
    id: "fau-33",
    name: "Genette commune",
    scientificName: "Genetta genetta",
    group: "mammal",
    description: "Petit carnivore nocturne agile au pelage tacheté et à longue queue annelée, très habile pour grimper dans les chênes et les cèdres.",
    status: "Discrète / Protégée",
    isEndemic: false,
    habitat: "Forêts d'altitude, thalwegs boisés et chaos rocheux"
  },
  {
    id: "fau-34",
    name: "Salamandre du Rif (et de l'Atlas)",
    scientificName: "Salamandra algira tingitana",
    group: "amphibian",
    description: "Amphibien endémique d'Afrique du Nord aux motifs colorés spectaculaires, habitant les sous-bois forestiers humides et très sensible à l'altération de son habitat.",
    status: "Endémique du Maghreb / Protégée",
    isEndemic: true,
    habitat: "Sous-bois forestiers humides, litières et près des sources"
  }
];

export const THREATS_DATA: ThreatItem[] = [
  {
    id: "thr-1",
    title: "Le changement climatique & Sécheresse",
    type: "naturel",
    description: "Entraîne des pertes de biodiversité sévères, des pénuries d'eau et une déstabilisation des espèces qui migrent vers des altitudes encore plus élevées.",
    impactLevel: "Élevé",
    solutions: ["Suivi scientifique des écosystèmes fragiles", "Régulation des prélèvements d'eau", "Reforestation ciblée"]
  },
  {
    id: "thr-2",
    title: "La coupe excessive du bois de feu",
    type: "anthropique",
    description: "En raison du climat rigoureux de montagne, la consommation en bois-énergie peut atteindre plus de 10 tonnes par ménage et par an, ce qui ravage les forêts de cèdres.",
    impactLevel: "Élevé",
    solutions: [
      "Distribution de fours à pain et de réchauds à gaz améliorés (partenariat AMEE)",
      "Aménagement forestier rigoureux par l'ANEF",
      "Valorisation des résidus agricoles comme combustible"
    ]
  },
  {
    id: "thr-3",
    title: "Le surpâturage (Surcharge pastorale)",
    type: "anthropique",
    description: "La surcharge de bétail (ovins et caprins des tribus locales) entraîne une dégradation constante des pâturages d'altitude et empêche la régénération naturelle des forêts.",
    impactLevel: "Élevé",
    solutions: [
      "Réhabilitation de la rationalité traditionnelle de l'Agdal (mise en défens rotative ancestrale)",
      "Création de zones de protection intégrale",
      "Amélioration des revenus des éleveurs via d'autres filières"
    ]
  },
  {
    id: "thr-4",
    title: "La sédentarisation des nomades",
    type: "anthropique",
    description: "La diffusion de constructions en lisière de forêt et l'extension des cultures privatives bloquent les anciens axes de migration de la faune sauvage comme le Mouflon.",
    impactLevel: "Moyen",
    solutions: [
      "Sauvegarde des axes de mouvements des mouflons",
      "Encadrement de l'urbanisation rurale le long des vallons",
      "Planification concertée de l'espace pastoral"
    ]
  },
  {
    id: "thr-5",
    title: "La pollution touristique & Piétinement",
    type: "anthropique",
    description: "La forte affluence touristique concentrée autour des lacs Isly et Tislit génère de la pollution plastique, dégrade la qualité des eaux et détruit la flore de rive fragile.",
    impactLevel: "Modéré",
    solutions: [
      "Mise en place d'une signalétique d'interprétation et de sensibilisation",
      "Gestion des déchets et aménagement de zones de stationnement reculées",
      "Charte de l'éco-voyageur et formation des guides locaux"
    ]
  }
];

export const TOURIST_CIRCUITS: TouristCircuit[] = [
  {
    id: "cir-1",
    title: "La Route des Lacs Légendaires (Isly & Tislit)",
    duration: "1 à 2 Jours",
    difficulty: "Facile",
    distance: "45 km (Boucle ou itinéraire)",
    description: "Découvrez les deux joyaux bleus du parc, classés Ramsar. C'est l'itinéraire idéal pour l'observation ornithologique et la découverte de la culture d'Imilchil.",
    stops: ["Village d'Imilchil", "Lac Tislit", "Lac Isly", "Mausolée de Sidi Ahmed Oulmeghni"],
    highlights: ["Légende tragique d'amour des deux lacs", "Observation du Tadorne casarca", "Architecture des Ksour en terre cuite"]
  },
  {
    id: "cir-2",
    title: "Le Trek du Djebel Ayachi & Cirque de Jaffar",
    duration: "2 à 3 Jours",
    difficulty: "Difficile",
    distance: "32 km (Randonnée pédestre)",
    description: "Un parcours sportif exceptionnel traversant les impressionnantes gorges du Cirque de Jaffar pour monter vers les crêtes glaciaires du Djebel Ayachi.",
    stops: ["Midelt (départ)", "Cirque de Jaffar", "Gorges de Jaffar", "Sommet Ayachi (3164 m)", "Village de Tounfite"],
    highlights: ["Paysages de canyons vertigineux", "Forêts de cèdres millénaires", "Rencontre avec le Mouflon à manchettes et les aigles"]
  },
  {
    id: "cir-3",
    title: "L'Échappée Verte de Tirrhist et Anefgou",
    duration: "1 Jour",
    difficulty: "Moyen",
    distance: "18 km",
    description: "Une immersion au cœur des plus belles cédraies d'altitude du parc, le long des vallées fertiles où vivent les tribus Aït Yahia.",
    stops: ["Canton forestier de Tirrhist", "Village fortifié d'Anefgou", "Oued Outerbate"],
    highlights: ["Futaies denses de Cèdre de l'Atlas", "Architecture authentique des kasbahs", "Artisanat du tissage de la laine berbere"]
  }
];

export const LAKES_LEGEND = {
  title: "La Légende d'Isly et Tislit",
  content: "Selon la mémoire collective locale, deux jeunes amants de tribus rivales (les Aït Yaaza d'Aït H'ddidou et une autre fraction) s'aimaient d'un amour pur mais impossible, leurs familles respectives refusant catégoriquement leur union. Désespérés, ils s'enfuirent dans la montagne et pleurèrent tant de larmes de chagrin qu'ils créèrent deux lacs jumeaux. Isly (le fiancé) et Tislit (la fiancée) s'y noyèrent pour sceller leur union éternelle. Touchées par cette tragédie, les familles décidèrent de faire la paix et d'établir un grand rassemblement annuel — le célèbre Moussem des Fiançailles d'Imilchil — pour permettre aux jeunes des différentes tribus de se rencontrer et de se marier librement, sous la bénédiction du saint protecteur Sidi Ahmed Oulmeghni.",
  annualEvent: "Moussem des Fiançailles d'Imilchil (Chaque année en Septembre)"
};

export const CULTURAL_HERITAGE = [
  {
    title: "Le Moussem d'Imilchil",
    description: "Une célébration culturelle unique au monde. Au-delà du commerce de bétail et de laine, c'est une fête sociale de réconciliation et de mariage collectif pour les tribus Aït H'ddidou et Aït Yahia.",
    icon: "Heart"
  },
  {
    title: "La Danse d'Ahidous",
    description: "Danse collective ancestrale où hommes et femmes, épaule contre épaule en cercle, chantent des poèmes berbères rythmés par le tambour d'allure sacrée (Alloun).",
    icon: "Music"
  },
  {
    title: "Architecture des Ksour et Kasbahs",
    description: "L'habitat traditionnel est une merveille d'adaptation bioclimatique. Construit en pisé (terre crue compressée et paille) et pierres locales, il conserve la chaleur en hiver et la fraîcheur en été.",
    icon: "Home"
  },
  {
    title: "L'Artisanat & Tissage de la laine",
    description: "Les femmes berbères excellent dans la fabrication des tentes nomades, des tapis traditionnels aux motifs géométriques mystiques et du célèbre 'Handira' (cape de mariage rayée blanche et bleue).",
    icon: "Activity"
  }
];

export const PRACTICAL_INFO = {
  access: [
    { from: "Depuis Zeida & Boumia", route: "Accès direct par route goudronnée vers Tounfite et Imilchil." },
    { from: "Depuis Midelt", route: "Via la piste spectaculaire du Cirque de Jaffar (réservée aux 4x4 ou randonneurs)." },
    { from: "Depuis Rich", route: "Route sinueuse mais magnifique R706 longeant les gorges de l'oued Outerbat vers Imilchil." }
  ],
  lodging: {
    hotels: 4,
    auberges: 21,
    gites: 5,
    details: "Le logement est principalement assuré chez l'habitant, dans des gîtes ruraux labellisés ou des auberges traditionnelles, favorisant directement l'économie solidaire des familles locales."
  }
};
