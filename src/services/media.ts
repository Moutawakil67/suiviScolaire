// services/media.service.ts
import HttpClient from '@/helpers/http-client';
import type { AxiosResponse } from 'axios';
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

export interface Media {
  id: number;
  nom_chaine: string;
  type_chaine: 'RADIO' | 'TV';
  url_stream: string;
}

class MediaService {
  async getAll(): Promise<Media[]> {
    try {
      const response: AxiosResponse<Media[]> = await HttpClient.get('/chaines/index');
      return response.data;
    } catch (error: any) {
      if (error?.response?.data) {
        throw error.response.data;
      }
      throw new Error('Erreur lors de la récupération des médias');
    }
  }

  async create(media: Omit<Media, 'id'>): Promise<Media> {
    try {
      const response: AxiosResponse<Media> = await HttpClient.post('/chaines/store', media);
      return response.data;
    } catch (error: any) {
      if (error?.response?.data) {
        throw error.response.data;
      }
      throw new Error('Erreur lors de la création du média');
    }
  }

  async update(id: number, media: Partial<Media>): Promise<Media> {
    try {
      const response: AxiosResponse<Media> = await HttpClient.put(`/chaines/update/${id}`, media);
      return response.data;
    } catch (error: any) {
      if (error?.response?.data) {
        throw error.response.data;
      }
      throw new Error('Erreur lors de la mise à jour du média');
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await HttpClient.delete(`/chaines/destroy/${id}`);
    } catch (error: any) {
      if (error?.response?.data) {
        throw error.response.data;
      }
      throw new Error('Erreur lors de la suppression du média');
    }
  }
}

export const mediaService = new MediaService();