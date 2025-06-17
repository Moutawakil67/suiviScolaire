// services/agent.service.ts
import HttpClient from '@/helpers/http-client';
import type { AxiosResponse } from 'axios';
import { showSuccessMessage, showErrorMessage } from '@/helpers/notification';

export interface Agent {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse: string;
  password?: string;
}

class AgentService {
  async getAll(): Promise<Agent[]> {
    try {
      const response: AxiosResponse<Agent[]> = await HttpClient.get('/users/agents-de-suivi/index');
      return response.data;
    } catch (error: any) {
      if (error?.response?.data) {
        throw error.response.data;
      }
      throw new Error('Erreur lors de la récupération des agents');
    }
  }

  async getById(id: number): Promise<Agent> {
    try {
      const response: AxiosResponse<Agent> = await HttpClient.get(`/agents/${id}`);
      return response.data;
    } catch (error: any) {
      if (error?.response?.data) {
        throw error.response.data;
      }
      throw new Error('Erreur lors de la récupération des détails de l\'agent');
    }
  }

  async create(agent: Omit<Agent, 'id'>): Promise<Agent> {
    try {
      const response: AxiosResponse<Agent> = await HttpClient.post('/users/agents-de-suivi/store', agent);
      return response.data;
    } catch (error: any) {
      if (error?.response?.data) {
        throw error.response.data;
      }
      throw new Error('Erreur lors de la création de l\'agent');
    }
  }

  async update(id: number, agent: Partial<Agent>): Promise<Agent> {
    try {
      const response: AxiosResponse<Agent> = await HttpClient.put(`users/agents-de-suivi/update/${id}`, agent);
      return response.data;
    } catch (error: any) {
      if (error?.response?.data) {
        throw error.response.data;
      }
      throw new Error('Erreur lors de la mise à jour de l\'agent');
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await HttpClient.delete(`/users/agents-de-suivi/delete/${id}`);
    } catch (error: any) {
      if (error?.response?.data) {
        throw error.response.data;
      }
      throw new Error('Erreur lors de la suppression de l\'agent');
    }
  }
}

export const agentService = new AgentService();
