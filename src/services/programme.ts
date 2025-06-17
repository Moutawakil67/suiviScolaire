// services/programme.service.ts
import HttpClient from '@/helpers/http-client';
import type { AxiosResponse } from 'axios';
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

export interface Programme {
  id: number;
  date_debut: string;
  date_fin: string;
  tranche_journee: string;
  campagne_id: number;
  agent_id: number;
  spot_publicitaire_id: number;
  created_at: string;
  updated_at: string;
}

class ProgrammeService {
  async getAll(): Promise<Programme[]> {
    try {
      const response: AxiosResponse<Programme[]> = await HttpClient.get('/programmes/index');
      return response.data;
    } catch (error: any) {
      if (error?.response?.data) {
        throw error.response.data;
      }
      throw new Error('Erreur lors de la récupération des programmes');
    }
  }

  async create(programme: Omit<Programme, 'id' | 'created_at' | 'updated_at'>): Promise<Programme> {
    try {
      const response: AxiosResponse<Programme> = await HttpClient.post('/programmes-de-diffusion/store', programme);
      return response.data;
    } catch (error: any) {
      if (error?.response?.data) {
        throw error.response.data;
      }
      throw new Error('Erreur lors de la création du programme');
    }
  }

  async update(id: number, programme: Partial<Programme>): Promise<Programme> {
    try {
      const response: AxiosResponse<Programme> = await HttpClient.put(`/programmes-de-diffusion/update/${id}`, programme);
      return response.data;
    } catch (error: any) {
      if (error?.response?.data) {
        throw error.response.data;
      }
      throw new Error('Erreur lors de la mise à jour du programme');
    }
  }

  async getCampagneCategorie(id: number): Promise<Programme> {
    try {
      const response: AxiosResponse<Programme> = await HttpClient.get(`/programmes-de-diffusion/campagne/${id}`);
      return response.data;
    } catch (error: any) {
      if (error?.response?.data) {
        throw error.response.data;
      }
      throw new Error('Erreur lors de la mise à jour du programme');
    }
  }



  async delete(id: number): Promise<void> {
    try {
      await HttpClient.delete(`/programmes-de-diffusion/destroy/${id}`);
    } catch (error: any) {
      if (error?.response?.data) {
        throw error.response.data;
      }
      throw new Error('Erreur lors de la suppression du programme');
    }
  }
}

export const programmeService = new ProgrammeService();