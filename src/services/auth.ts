import HttpClient from '@/helpers/http-client';
import type { AxiosResponse } from 'axios';
import type { User } from '@/types/auth';
import { computed, ref } from 'vue';

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface PasswordChangeData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export class AuthService {
  private static instance: AuthService;

  private constructor() { }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public async signIn(credentials: AuthCredentials): Promise<User> {
    const response: AxiosResponse<User> = await HttpClient.post('/connexion', credentials);
    // if (response.data.token) {
    //   localStorage.setItem('token', response.data.token);

    // }
    return response.data;
  }


  public async resetPassword(email: string): Promise<void> {
    await HttpClient.post('/auth/password/forgot/', { email });
  }


  //quand le client à oublié son mot de passe
  public async changePassword(data: PasswordChangeData): Promise<void> {
    await HttpClient.post('/auth/password/reset', data);
  }


  // quand le client vient pour la première ois
  public async password_update(data: PasswordChangeData): Promise<any> {
    const response = await HttpClient.post('/auth/password/reset', data);
    return response.data;
  }


  public async signOut(email: string): Promise<any> {
     
    const response = await HttpClient.post('/auth/deconnexion', { email });
    localStorage.removeItem('token');
    return response;
  }

}

export const authService = AuthService.getInstance();