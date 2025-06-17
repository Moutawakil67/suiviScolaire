// services/rapport.service.ts
import HttpClient from '@/helpers/http-client';
import type { AxiosResponse } from 'axios';
import { showSuccessMessage, showErrorMessage } from '@/helpers/notification';

export interface Rapport {
  id: number;
  objet: string;
  description: string;
  campagne_id: string;
}

class RapportService {
  async getAll(): Promise<Rapport[]> {
    try {
      const response: AxiosResponse<Rapport[]> = await HttpClient.get('/users/rapports/index');
      return response.data;
    } catch (error: any) {
      if (error?.response?.data) {
        throw error.response.data;
      }
      throw new Error('Erreur lors de la récupération des rappor');
    }
  }

  async getById(id: number): Promise<Rapport> {
    try {
      const response: AxiosResponse<Rapport> = await HttpClient.get(`/agents/${id}`);
      return response.data;
    } catch (error: any) {
      if (error?.response?.data) {
        throw error.response.data;
      }
      throw new Error('Erreur lors de la récupération des détails du rapport');
    }
  }

  async create(rapport: Omit<Rapport, 'id'>): Promise<Rapport> {
    try {
      const response: AxiosResponse<Rapport> = await HttpClient.post('/users/rapports/store', rapport);
      return response.data;
    } catch (error: any) {
      if (error?.response?.data) {
        throw error.response.data;
      }
      throw new Error('Erreur lors de la création de l\'rapport');
    }
  }

  async update(id: number, rapport: Partial<Rapport>): Promise<Rapport> {
    try {
      const response: AxiosResponse<Rapport> = await HttpClient.put(`users/rapports/update/${id}`, rapport);
      return response.data;
    } catch (error: any) {
      if (error?.response?.data) {
        throw error.response.data;
      }
      throw new Error('Erreur lors de la mise à jour de l\'rapport');
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await HttpClient.delete(`/users/rapports/delete/${id}`);
    } catch (error: any) {
      if (error?.response?.data) {
        throw error.response.data;
      }
      throw new Error('Erreur lors de la suppression de l\'rapport');
    }
  }
}

export const rapportService = new RapportService();
