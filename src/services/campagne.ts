// src/services/campagne.ts

import HttpClient from '@/helpers/http-client';
import type { AxiosResponse } from 'axios';
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

export interface Campagne {
  id: number;
  titre: string;
  description: string;
  date_debut: string;
  date_fin: string;
  commanditaire_id: string;
}

class CampagneService {
  async getAll(): Promise<Campagne[]> {
    try {
      const response: AxiosResponse<Campagne[]> = await HttpClient.get('/campagnes/index');
      return response.data;
    } catch (error: any) {
      if (error?.response?.data) {
        throw error.response.data;
      }
      throw new Error('Erreur lors de la récupération des campagnes');
    }
  }

  async getCommanditairesCampagne(id: number): Promise<Campagne[]> {
    try {
      const response: AxiosResponse<Campagne[]> = await HttpClient.get(`/campagnes/commanditaire/${id}`);
      return response.data;
    } catch (error: any) {
      if (error?.response?.data) {
        throw error.response.data;
      }
      throw new Error('Erreur lors de la récupération des campagnes');
    }
  }

  async create(campagne: Omit<Campagne, 'id'>): Promise<Campagne> {
    try {
      const response: AxiosResponse<Campagne> = await HttpClient.post('/campagnes/store', campagne);
      return response.data;
    } catch (error: any) {
      if (error?.response?.data) {
        throw error.response.data;
      }
      throw new Error('Erreur lors de la création de la campagne');
    }
  }

  async update(id: number, campagne: Partial<Campagne>): Promise<Campagne> {
    try {
      const response: AxiosResponse<Campagne> = await HttpClient.put(`/campagnes/update/${id}`, campagne);
      return response.data;
    } catch (error: any) {
      if (error?.response?.data) {
        throw error.response.data;
      }
      throw new Error('Erreur lors de la mise à jour de la campagne');
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await HttpClient.delete(`/campagnes/destroy/${id}`);
    } catch (error: any) {
      if (error?.response?.data) {
        throw error.response.data;
      }
      throw new Error('Erreur lors de la suppression de la campagne');
    }
  }
}

export const campagneService = new CampagneService();