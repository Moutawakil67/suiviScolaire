import axios from 'axios';
import type { AxiosInstance } from 'axios';
export const BASE_URL = "http://localhost:3001"

function HttpClient(): AxiosInstance {
  const instance = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json'
    }
  })

  instance.interceptors.request.use(
    (config) => {
      const rawUser = localStorage.getItem("L3-AL_USER");
      const currentUser = rawUser ? JSON.parse(rawUser) : null;

      console.log("currentUser" , currentUser);
  
      if (currentUser?.token) {
        config.headers.Authorization = `Bearer ${currentUser.token}`;
      }
      
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error.response?.status

      switch (status) {
        case 401:
          // Non autorisé - problème d'authentification
          localStorage.removeItem('token')
          const baseUrl = import.meta.env.BASE_URL || '/';
          window.location.href = `${baseUrl}auth/sign-in`;

          break
        case 403:
          // Accès interdit - problème d'autorisation
          console.error('Accès non autorisé à la ressource')
          break
        case 404:
          // Ressource non trouvée
          console.error('La ressource demandée n\'existe pas')
          break
        case 500:
          // Erreur serveur
          console.error('Une erreur serveur est survenue')
          break
        default:
          // Autres erreurs
          console.error('Une erreur est survenue:', error.message)
      }

      return Promise.reject(error)
    }
  )

  return instance
}

export default HttpClient()
