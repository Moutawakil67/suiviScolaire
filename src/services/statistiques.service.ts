// src/services/statistiques.service.ts
import HttpClient from "@/helpers/http-client";
import type { AxiosResponse } from "axios";

export interface DiffusionsStatsType {
  label: string;
  value: number;
  color: string;
}
export interface DiffusionsStatsResponse {
  total: number;
  data: DiffusionsStatsType[];
}
export interface GlobalStatsResponse {
  commanditaires: number;
  campagnes: number;
  chaines: number;
  agents: number;
}

export interface ProgrammesStackedParMoisResponse {
  mois: string[];
  diffuses: number[];
  non_diffuses: number[];
  non_suivis: number[];
}




class StatistiquesService {
  private static instance: StatistiquesService;

  private constructor() { }

  public static getInstance(): StatistiquesService {
    if (!StatistiquesService.instance) {
      StatistiquesService.instance = new StatistiquesService();
    }
    return StatistiquesService.instance;
  }

  public async getGlobalStats(): Promise<GlobalStatsResponse> {
    const response: AxiosResponse<GlobalStatsResponse> = await HttpClient.get(
      "/statistiques/globales/cards"
    );
    return response.data;
  }

  public async getDiffusionsStatsCamembert(): Promise<DiffusionsStatsResponse> {
    const response: AxiosResponse<DiffusionsStatsResponse> =
      await HttpClient.get("/statistiques/globales/diffusions/stats-camembert");
    return response.data;
  }

  
  public async getProgrammesStackedParMois(): Promise<ProgrammesStackedParMoisResponse> {
    const response: AxiosResponse<ProgrammesStackedParMoisResponse> =
      await HttpClient.get("/statistiques/globales/diffusion/mois");
    return response.data;
  }





 
}

export const statistiquesService = StatistiquesService.getInstance();
