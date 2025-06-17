// src/services/campagnes-detail-statistiques.service.ts
import HttpClient from "@/helpers/http-client";

// Types pour les données de réponse
export interface CampagneInfo {
  id: number;
  titre: string;
  description: string;
  date_debut: string;
  date_fin: string;
  commanditaire: string;
  categorie: string;
}

export interface ProgrammesData {
  par_jour: Record<string, number>;
  par_mois: Record<string, number>;
  par_an: Record<string, number>;
  total: number;
}

export interface MediaDetail {
  id: number;
  nom: string;
  type: string;
}

export interface MediasImpliques {
  total: number;
  details: MediaDetail[];
  par_type: {
    RADIO: number;
    TV: number;
  };
}

export interface AgentStatistiques {
  total_programmes: number;
  programmes_diffuses: number;
  programmes_non_diffuses: number;
  programmes_en_attente: number;
  taux_execution: number;
}



export interface AgentDetail {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  statistiques: AgentStatistiques;
}


export interface AgentsAssocies {
  total: number;
  details: AgentDetail[];
}

export interface StatistiquesDetailCampagne {
  campagne_info: CampagneInfo;
  programmes_totaux: ProgrammesData;
  programmes_diffuses: ProgrammesData;
  programmes_non_diffuses: ProgrammesData;
  programmes_non_suivis: ProgrammesData;
  spots_publicitaires: number;
  medias_impliques: MediasImpliques;
  agents_associes: AgentsAssocies;
}

export interface StatistiquesPerformance {
  total_programmes: number;
  programmes_diffuses: number;
  programmes_non_diffuses: number;
  programmes_en_attente: number;
  taux_execution: number;
  taux_non_diffusion: number;
}

export interface TrancheHoraire {
  description: string;
  nombre_programmes: number;
  programmes_diffuses: number;
}

export interface StatistiquesTrancheHoraire {
  [key: string]: TrancheHoraire;
}

export interface ResumeExecutif {
  campagne: string;
  periode: string;
  duree_jours: number;
  total_programmes_planifies: number;
  total_programmes_diffuses: number;
  taux_execution: string;
  nombre_medias: number;
  nombre_agents: number;
  nombre_spots_uniques: number;
  programmes_non_suivis: number;
}

class CampagnesDetailStatistiquesService {
  /**
   * Obtenir les statistiques détaillées d'une campagne
   */
  async getStatistiquesDetail(campagneId: number): Promise<StatistiquesDetailCampagne> {
    const response = await HttpClient.get(`/campagnes/statistiques/${campagneId}/detail`);
    return response.data;
  }

  /**
   * Obtenir les statistiques de performance d'une campagne
   */
  async getStatistiquesPerformance(campagneId: number): Promise<StatistiquesPerformance> {
    const response = await HttpClient.get(`/campagnes/statistiques/${campagneId}/performance`);
    return response.data;
  }

  /**
   * Obtenir les statistiques par tranche horaire
   */
  async getStatistiquesParTrancheHoraire(campagneId: number): Promise<StatistiquesTrancheHoraire> {
    const response = await HttpClient.get(`/campagnes/statistiques/${campagneId}/tranches`);
    return response.data;
  }

  /**
   * Obtenir le résumé exécutif d'une campagne
   */
  async getResumeExecutif(campagneId: number): Promise<ResumeExecutif> {
    const response = await HttpClient.get(`/campagnes/statistiques/${campagneId}/resume`);
    return response.data;
  }
}

export default new CampagnesDetailStatistiquesService();