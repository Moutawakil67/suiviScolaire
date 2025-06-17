// src/services/campagnes-statistiques.service.ts
import HttpClient from "@/helpers/http-client";
import type { AxiosResponse } from "axios";

// Types pour les statistiques de campagnes
export interface StatistiqueCampagne {
  campagne_id: number;
  campagne_titre: string;
  campagne_description: string;
  date_debut: string;
  date_fin: string;
  commanditaire: string;
  categorie: string;
  taux_execution: number;
  taux_diffuse: number;
  taux_diffuse_par_chaine: TauxDiffuseParChaine[];
  statistiques_detaillees: StatistiquesDetaillees;
}

export interface TauxDiffuseParChaine {
  chaine_id: number;
  chaine_nom: string;
  chaine_type: string;
  programmes_attendus: number;
  programmes_diffuses: number;
  taux_diffuse: number;
}

export interface StatistiquesDetaillees {
  total_programmes: number;
  programmes_par_statut: {
    attente: number;
    diffuse: number;
    en_retard: number;
    non_diffuse: number;
  };
  programmes_par_tranche: Record<string, number>;
  programmes_a_venir: number;
  programmes_en_cours: number;
  programmes_echus: number;
}

export interface ResumGlobal {
  total_campagnes: number;
  campagnes_actives: number;
  total_programmes: number;
  programmes_diffuses: number;
  taux_global_execution: number;
  derniere_mise_a_jour: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  total?: number;
}

export interface FiltresRecherche {
  date_debut?: string;
  date_fin?: string;
  commanditaire_id?: number;
  category_id?: number;
}

class CampagnesStatistiquesService {
  private static instance: CampagnesStatistiquesService;

  private constructor() {}

  public static getInstance(): CampagnesStatistiquesService {
    if (!CampagnesStatistiquesService.instance) {
      CampagnesStatistiquesService.instance = new CampagnesStatistiquesService();
    }
    return CampagnesStatistiquesService.instance;
  }

  // Obtenir toutes les statistiques des campagnes
  public async getStatistiquesGlobales(): Promise<StatistiqueCampagne[]> {
    const response: AxiosResponse<ApiResponse<StatistiqueCampagne[]>> = 
      await HttpClient.get("/statistiques/campagnes");
    return response.data.data;
  }

  // Obtenir les statistiques d'une campagne spécifique
  public async getStatistiquesCampagne(id: number): Promise<StatistiqueCampagne> {
    const response: AxiosResponse<ApiResponse<StatistiqueCampagne>> = 
      await HttpClient.get(`/statistiques/campagnes/${id}`);
    return response.data.data;
  }

  // Obtenir le taux d'exécution d'une campagne
  public async getTauxExecution(id: number): Promise<{ campagne_id: number; taux_execution: number }> {
    const response: AxiosResponse<ApiResponse<{ campagne_id: number; taux_execution: number }>> = 
      await HttpClient.get(`/statistiques/campagnes/${id}/execution`);
    return response.data.data;
  }

  // Obtenir le taux de diffusion d'une campagne
  public async getTauxDiffusion(id: number): Promise<{ campagne_id: number; taux_diffuse: number }> {
    const response: AxiosResponse<ApiResponse<{ campagne_id: number; taux_diffuse: number }>> = 
      await HttpClient.get(`/statistiques/campagnes/${id}/diffusion`);
    return response.data.data;
  }

  // Obtenir le taux de diffusion par chaîne
  public async getTauxDiffusionParChaine(id: number): Promise<{ campagne_id: number; taux_par_chaine: TauxDiffuseParChaine[] }> {
    const response: AxiosResponse<ApiResponse<{ campagne_id: number; taux_par_chaine: TauxDiffuseParChaine[] }>> = 
      await HttpClient.get(`/statistiques/campagnes/${id}/diffusion-par-chaine`);
    return response.data.data;
  }

  // Obtenir le résumé global
  public async getResumeGlobal(): Promise<ResumGlobal> {
    const response: AxiosResponse<ApiResponse<ResumGlobal>> = 
      await HttpClient.get("/statistiques/campagnes/resume-global");
    return response.data.data;
  }

  // Rechercher avec filtres
  public async rechercherAvecFiltres(filtres: FiltresRecherche): Promise<StatistiqueCampagne[]> {
    const params = new URLSearchParams();
    
    if (filtres.date_debut) params.append('date_debut', filtres.date_debut);
    if (filtres.date_fin) params.append('date_fin', filtres.date_fin);
    if (filtres.commanditaire_id) params.append('commanditaire_id', filtres.commanditaire_id.toString());
    if (filtres.category_id) params.append('category_id', filtres.category_id.toString());

    const response: AxiosResponse<ApiResponse<StatistiqueCampagne[]>> = 
      await HttpClient.get(`/statistiques/campagnes/recherche?${params.toString()}`);
    return response.data.data;
  }
}

export const campagnesStatistiquesService = CampagnesStatistiquesService.getInstance();