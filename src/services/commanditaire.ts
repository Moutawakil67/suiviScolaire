// services/commanditaire.ts
import HttpClient from '@/helpers/http-client';
import type { AxiosResponse } from 'axios';
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';



export interface Commanditaire {
  id: number;
  nom: string;
  raison_social: string;
  adresse: string;
}

class CommanditaireService {
  async getAll(): Promise<Commanditaire[]> {
    try {
      const response: AxiosResponse<Commanditaire[]> = await HttpClient.get('users/commanditaires/index');
      return response.data;
    } catch (error: any) {
      if (error?.response?.data) {
        throw error.response.data;
      }
      throw new Error('Erreur lors de la récupération des commanditaires');
    }
  }

  async create(commanditaire: Omit<Commanditaire, 'id'>): Promise<Commanditaire> {
    try {
      const response: AxiosResponse<Commanditaire> = await HttpClient.post('users/commanditaires/store', commanditaire);
      return response.data;
    } catch (error: any) {
      if (error?.response?.data) {
        throw error.response.data;
      }
      throw new Error('Erreur lors de la création du commanditaire');
    }
  }

  async update(id: number, commanditaire: Partial<Commanditaire>): Promise<Commanditaire> {
    try {
      const response: AxiosResponse<Commanditaire> = await HttpClient.put(`users/commanditaires/update/${id}`, commanditaire);
      return response.data;
    } catch (error: any) {
      if (error?.response?.data) {
        throw error.response.data;
      }
      throw new Error('Erreur lors de la mise à jour du commanditaire');
    }
  }

  async deletes(id: number): Promise<void> {
    try {
      await HttpClient.delete(`users/commanditaires/delete/${id}`);
    } catch (error: any) {
      if (error?.response?.data) {
        throw error.response.data;
      }
      throw new Error('Erreur lors de la suppression du commanditaire');
    }
  }
}

export const commanditaireService = new CommanditaireService();
