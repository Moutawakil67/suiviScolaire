// services/media.service.ts
import HttpClient from '@/helpers/http-client';
import type { AxiosResponse } from 'axios';
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

export interface Audio {
  id: number;
}

class AudioService {
  async playStream(id: number): Promise<Audio[]> {
    try {
      const response: AxiosResponse<Audio[]> = await HttpClient.get(`/audios/${id}/stream`);
      return response.data;
    } catch (error: any) {
      if (error?.response?.data) {
        throw error.response.data;
      }
      throw new Error("Erreur lors de la récupération de l'audio");
    }
  }

  async download(id: number): Promise<Audio[]> {
    try {
      const response: AxiosResponse<Audio[]> = await HttpClient.get(`/audios/${id}/download`);
      return response.data;
    } catch (error: any) {
      if (error?.response?.data) {
        throw error.response.data;
      }
      throw new Error("Erreur lors de la récupération de l'audio");
    }
  }

  
}

export const audioService = new AudioService();