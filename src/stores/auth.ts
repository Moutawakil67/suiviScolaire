import { defineStore } from "pinia";
import router from "@/router";
import { useLocalStorage  } from "@vueuse/core";
import type { User } from "@/types/auth";
import { authService } from "@/services/auth";
import { computed, ref } from 'vue';



export const useAuthStore = defineStore("auth_store", () => {
  const user = useLocalStorage<string | null>("L3-AL_USER", null);


  const currentUser = computed<User | null>({
    get() {
      return user.value ? JSON.parse(user.value) : null;
    },
    set(val: User | null) {
      user.value = val ? JSON.stringify(val) : null;
    }
  });


  const saveSession = (newUser: User) => {
    currentUser.value = newUser;

  };


  const removeSession = async () => {
    try {
      
      if (!currentUser.value || !currentUser.value.email) {
        throw new Error("Utilisateur non connecté");
      }

      const response = await authService.signOut(currentUser.value.email);

      if (response.status === 200 || response.status === 204) {
        user.value = null;
        router.push({ name: 'auth.sign-in' });
      }
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      user.value = null;
      router.push({ name: 'auth.sign-in' });
    }
  };






  function isAuthenticated(): boolean {
    return currentUser.value !== null;
  }

  return {
    user,
    saveSession,
    removeSession,
    isAuthenticated,
    currentUser
  };
});
