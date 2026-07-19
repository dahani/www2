/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface FloraItem {
  id: string;
  name: string;
  scientificName: string;
  category: 'endemic' | 'medicinal' | 'protected';
  description: string;
  status?: string;
  habitat?: string;
}

export interface FaunaItem {
  id: string;
  name: string;
  scientificName: string;
  group: 'mammal' | 'bird' | 'reptile' | 'amphibian';
  description: string;
  status: string; // e.g., EN, VU, LC, Protégé Maroc
  isEndemic: boolean;
  habitat: string;
}

export interface StatisticCard {
  label: string;
  value: string;
  description: string;
  icon: string;
}

export interface VegetationStage {
  name: string;
  altitude: string;
  percentage: number;
  area: string;
  description: string;
  color: string;
}

export interface ThreatItem {
  id: string;
  title: string;
  type: 'naturel' | 'anthropique';
  description: string;
  impactLevel: 'Élevé' | 'Moyen' | 'Modéré';
  solutions: string[];
}

export interface TouristCircuit {
  id: string;
  title: string;
  duration: string;
  difficulty: 'Facile' | 'Moyen' | 'Difficile';
  distance: string;
  description: string;
  stops: string[];
  highlights: string[];
}
