// services/spot.service.ts
import HttpClient from '@/helpers/http-client';
import type { AxiosResponse } from 'axios';
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

export interface Spot {
  id: number;
  libelle: string;
  type: 'SPOT' | 'EMISSION';
  fichier_reference: string;
  duree_reference: string;
}

class SpotService {
  async getAll(): Promise<Spot[]> {
    try {
      const response: AxiosResponse<Spot[]> = await HttpClient.get('/spots');
      return response.data;
    } catch (error: any) {
      if (error?.response?.data) {
        throw error.response.data;
      }
      throw new Error('Erreur lors de la récupération des spots');
    }
  }

  async getCommanditaireSpot(id : number): Promise<Spot[]> {
    try {
      const response: AxiosResponse<Spot[]> = await HttpClient.get(`/spots-publicitaires/commanditaire/${id}`);
      return response.data;
    } catch (error: any) {
      if (error?.response?.data) {
        throw error.response.data;
      }
      throw new Error('Erreur lors de la récupération des spots');
    }
  }

  async create(spot: FormData): Promise<Spot> {
    try {
      const response: AxiosResponse<Spot> = await HttpClient.post('/spots-publicitaires/store', spot, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error: any) {
      if (error?.response?.data) {
        throw error.response.data;
      }
      throw new Error('Erreur lors de la création du spot');
    }
  }

  async update(id: number, spot: FormData): Promise<Spot> {
    try {
      const response: AxiosResponse<Spot> = await HttpClient.post(`/spots-publicitaires/update/${id}`, spot , {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error: any) {
      if (error?.response?.data) {
        throw error.response.data;
      }
      throw new Error('Erreur lors de la mise à jour du spot');
    }
  }

  async getAudioSpot(spotPublicitaireId: number ): Promise<Spot> {
    try {
      const response: AxiosResponse<Spot[]> = await HttpClient.get(`/spots-publicitaires/${spotPublicitaireId}/audios`);
      return response.data;
    } catch (error: any) {
      if (error?.response?.data) {
        throw error.response.data;
      }
      throw new Error('Erreur lors de la mise à jour du spot');
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await HttpClient.delete(`/spots-publicitaires/destroy/${id}`);
    } catch (error: any) {
      if (error?.response?.data) {
        throw error.response.data;
      }
      throw new Error('Erreur lors de la suppression du spot');
    }
  }
}

export const spotService = new SpotService();