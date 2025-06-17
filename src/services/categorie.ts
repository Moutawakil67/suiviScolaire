// services/categorie.ts
import HttpClient from '@/helpers/http-client';
import type { AxiosResponse } from 'axios';
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

export interface Categorie {
  id: number;
  produit: string;
}

class CategorieService {
  async getAll(): Promise<Categorie[]> {
    try {
      const response: AxiosResponse<Categorie[]> = await HttpClient.get('/categories/index');
      return response.data;
    } catch (error: any) {
      if (error?.response?.data) {
        throw error.response.data;
      }
      throw new Error('Erreur lors de la récupération des catégories');
    }
  }

  async create(categorie: Omit<Categorie, 'id'>): Promise<Categorie> {
    try {
      const response: AxiosResponse<Categorie> = await HttpClient.post('/categories/store', categorie);
      return response.data;
    } catch (error: any) {
      if (error?.response?.data) {
        throw error.response.data;
      }
      throw new Error('Erreur lors de la création de la catégorie');
    }
  }

  async update(id: number, categorie: Partial<Categorie>): Promise<Categorie> {
    try {
      const response: AxiosResponse<Categorie> = await HttpClient.put(`/categories/update/${id}`, categorie);
      return response.data;
    } catch (error: any) {
      if (error?.response?.data) {
        throw error.response.data;
      }
      throw new Error('Erreur lors de la mise à jour de la catégorie');
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await HttpClient.delete(`/categories/destroy/${id}`);
    } catch (error: any) {
      if (error?.response?.data) {
        throw error.response.data;
      }
      throw new Error('Erreur lors de la suppression de la catégorie');
    }
  }
}

export const categorieService = new CategorieService();