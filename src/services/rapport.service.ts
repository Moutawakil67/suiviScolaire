// src/services/rapport.service.ts
import HttpClient from "@/helpers/http-client";
import type { AxiosResponse } from "axios";

// Types/Interfaces
export interface Rapport {
  id: number;
  objet: string;
  description: string;
  campagne_id: number;
  created_at?: string;
  updated_at?: string;
  // Relations
  campagne?: {
    id: number;
    titre: string;
    description: string;
    date_debut: string;
    date_fin: string;
    commanditaire_id: string;
  };
  created_by?: {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    adresse: string;
  };
  fichiers?: FichierRapport[];
}

export interface FichierRapport {
  id: number;
  nom_original: string;
  nom_fichier: string;
  chemin: string;
  type_mime: string;
  extension: string;
  taille_octets: number;
  url_publique?: string;
  description?: string;
  tags?: string;
  rapport_id: number;
  created_at: string;
  updated_at: string;
}

export interface CreateRapportRequest {
  objet: string;
  description: string;
  campagne_id: number;
}

export interface UpdateRapportRequest {
  objet?: string;
  description?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

export interface UploadMultipleResult {
  success_count: number;
  error_count: number;
  uploaded_files: FichierRapport[];
  errors: string[];
}

export interface FichierStatistiques {
  total_fichiers: number;
  taille_totale_octets: number;
  taille_totale_mb: number;
  types_mime: Record<string, number>;
  extensions: Record<string, number>;
  fichier_plus_lourd: FichierRapport | null;
  fichier_plus_recent: FichierRapport | null;
}

class RapportService {
  private readonly baseUrl = "/rapports";

  // CRUD Operations
  async getAll(): Promise<Rapport[]> {
    try {
      const response: AxiosResponse<ApiResponse<Rapport[]>> =
        await HttpClient.get(`${this.baseUrl}/index`);
      return response.data.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des rapports:", error);
      throw this.handleError(error);
    }
  }

  async getById(id: number): Promise<Rapport> {
    try {
      const response: AxiosResponse<ApiResponse<Rapport>> =
        await HttpClient.get(`${this.baseUrl}/show/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du rapport ${id}:`, error);
      throw this.handleError(error);
    }
  }

  async create(data: CreateRapportRequest): Promise<Rapport> {
    try {
      const response: AxiosResponse<ApiResponse<Rapport>> =
        await HttpClient.post(`${this.baseUrl}/store`, data);
      return response.data.data;
    } catch (error) {
      console.error("Erreur lors de la création du rapport:", error);
      throw this.handleError(error);
    }
  }

  async update(id: number, data: UpdateRapportRequest): Promise<Rapport> {
    try {
      const response: AxiosResponse<ApiResponse<Rapport>> =
        await HttpClient.put(`${this.baseUrl}/update/${id}`, data);
      return response.data.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du rapport ${id}:`, error);
      throw this.handleError(error);
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await HttpClient.delete(`${this.baseUrl}/destroy/${id}`);
      return true;
    } catch (error) {
      console.error(`Erreur lors de la suppression du rapport ${id}:`, error);
      throw this.handleError(error);
    }
  }

  // Méthodes spécialisées
  async getByCampagne(campagneId: number): Promise<Rapport[]> {
    try {
      const response: AxiosResponse<ApiResponse<Rapport[]>> =
        await HttpClient.get(`${this.baseUrl}/campagne/${campagneId}`);
      return response.data.data;
    } catch (error) {
      console.error(
        `Erreur lors de la récupération des rapports de la campagne ${campagneId}:`,
        error
      );
      throw this.handleError(error);
    }
  }

  async getByCreator(userId: number): Promise<Rapport[]> {
    try {
      const response: AxiosResponse<ApiResponse<Rapport[]>> =
        await HttpClient.get(`${this.baseUrl}/createur/${userId}`);
      return response.data.data;
    } catch (error) {
      console.error(
        `Erreur lors de la récupération des rapports du créateur ${userId}:`,
        error
      );
      throw this.handleError(error);
    }
  }

  async sendMail(id: number): Promise<{ success: boolean; message: string }> {
  const response = await HttpClient.post(
    `${this.baseUrl}/${id}/send-mail`,
    {},
    {
      timeout: 30000 
    }
  );
  return response.data;
}

  // Méthodes d'export
  async exportJson(id: number): Promise<Rapport> {
    try {
      const response: AxiosResponse<
        ApiResponse<Rapport> & { exported_at: string }
      > = await HttpClient.get(`${this.baseUrl}/export/json/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Erreur lors de l'export JSON du rapport ${id}:`, error);
      throw this.handleError(error);
    }
  }

  async exportPdf(id: number): Promise<Blob> {
    try {
      const response: AxiosResponse<Blob> = await HttpClient.get(
        `${this.baseUrl}/export/pdf/${id}`,
        {
          responseType: "blob",
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de l'export PDF du rapport ${id}:`, error);
      throw this.handleError(error);
    }
  }

  async exportExcel(id: number): Promise<Blob> {
    try {
      const response: AxiosResponse<Blob> = await HttpClient.get(
        `${this.baseUrl}/export/excel/${id}`,
        {
          responseType: "blob",
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de l'export Excel du rapport ${id}:`, error);
      throw this.handleError(error);
    }
  }

  // Méthodes utilitaires pour les exports
  downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  async downloadPdf(id: number, filename?: string): Promise<void> {
    try {
      const blob = await this.exportPdf(id);
      const finalFilename =
        `rapport_${filename}_${new Date().toISOString().slice(0, 10)}.pdf`||
        `rapport_${id}_${new Date().toISOString().slice(0, 10)}.pdf`;
      this.downloadFile(blob, finalFilename);
    } catch (error) {
      console.error("Erreur lors du téléchargement PDF:", error);
      throw error;
    }
  }

  async downloadExcel(id: number, filename?: string): Promise<void> {
    try {
      const blob = await this.exportExcel(id);
      const finalFilename =
        filename ||
        `rapport_${id}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      this.downloadFile(blob, finalFilename);
    } catch (error) {
      console.error("Erreur lors du téléchargement Excel:", error);
      throw error;
    }
  }

  // Gestion des erreurs
  private handleError(error: any): Error {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    if (error.message) {
      return new Error(error.message);
    }
    return new Error("Une erreur inattendue s'est produite");
  }
}

// Service pour la gestion des fichiers de rapports
class RapportFichierService {
  private readonly baseUrl = "/rapports";

  async uploadSingle(
    rapportId: number,
    file: File,
    additionalData?: { description?: string; tags?: string }
  ): Promise<FichierRapport> {
    try {
      const formData = new FormData();
      formData.append("fichier", file);

      if (additionalData?.description) {
        formData.append("description", additionalData.description);
      }
      if (additionalData?.tags) {
        formData.append("tags", additionalData.tags);
      }

      const response: AxiosResponse<ApiResponse<FichierRapport>> =
        await HttpClient.post(
          `${this.baseUrl}/${rapportId}/fichiers/upload`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      return response.data.data;
    } catch (error) {
      console.error("Erreur lors de l'upload du fichier:", error);
      throw this.handleError(error);
    }
  }

  async uploadMultiple(
    rapportId: number,
    files: File[],
    additionalData?: { description?: string; tags?: string }
  ): Promise<UploadMultipleResult> {
    try {
      const formData = new FormData();

      files.forEach((file) => {
        formData.append("fichiers[]", file);
      });

      if (additionalData?.description) {
        formData.append("description", additionalData.description);
      }
      if (additionalData?.tags) {
        formData.append("tags", additionalData.tags);
      }

      const response: AxiosResponse<ApiResponse<UploadMultipleResult>> =
        await HttpClient.post(
          `${this.baseUrl}/${rapportId}/fichiers/upload-multiple`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      return response.data.data;
    } catch (error) {
      console.error("Erreur lors de l'upload multiple:", error);
      throw this.handleError(error);
    }
  }

  async getFichiers(rapportId: number): Promise<FichierRapport[]> {
    try {
      const response: AxiosResponse<
        ApiResponse<FichierRapport[]> & { count: number }
      > = await HttpClient.get(`${this.baseUrl}/${rapportId}/fichiers`);
      return response.data.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des fichiers:", error);
      throw this.handleError(error);
    }
  }

  // Télécharger un fichier individuel
  async downloadFichier(
    rapportId: number,
    fichierId: number,
    filename: string
  ): Promise<void> {
    try {
      const response = await HttpClient.get(
        `${this.baseUrl}/${rapportId}/fichiers/${fichierId}/download`,
        {
          responseType: "blob",
        }
      );

      const contentDisposition = response.headers["content-disposition"];

      filename = decodeURIComponent(filename);

      // Créer le lien de téléchargement
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erreur lors du téléchargement du fichier:", error);
      throw this.handleError(error);
    }
  }

  async deleteFichier(rapportId: number, fichierId: number): Promise<boolean> {
    try {
      await HttpClient.delete(
        `${this.baseUrl}/${rapportId}/fichiers/${fichierId}`
      );
      return true;
    } catch (error) {
      console.error("Erreur lors de la suppression du fichier:", error);
      throw this.handleError(error);
    }
  }

  async checkFichierExists(
    rapportId: number,
    fichierId: number
  ): Promise<boolean> {
    try {
      const response: AxiosResponse<
        ApiResponse<boolean> & { exists: boolean }
      > = await HttpClient.get(
        `${this.baseUrl}/${rapportId}/fichiers/${fichierId}/exists`
      );
      return response.data.exists;
    } catch (error) {
      console.error("Erreur lors de la vérification du fichier:", error);
      throw this.handleError(error);
    }
  }

  async getStatistiques(rapportId: number): Promise<FichierStatistiques> {
    try {
      const response: AxiosResponse<ApiResponse<FichierStatistiques>> =
        await HttpClient.get(
          `${this.baseUrl}/${rapportId}/fichiers/statistiques`
        );
      return response.data.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques:", error);
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    if (error.message) {
      return new Error(error.message);
    }
    return new Error("Une erreur inattendue s'est produite");
  }
}

// Export des services
export const rapportService = new RapportService();
export const rapportFichierService = new RapportFichierService();
