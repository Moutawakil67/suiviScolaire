import { ref } from 'vue';
import { defineStore } from 'pinia';



export const usePermissionStore = defineStore('permission', () => {
  const userPermissions = ref<string[]>(['agent:create', 'agent:update', 'agent:export', 'agent:delete', 'user:create', 'user:update', 'user:export', 'user:delete','seance:create', 'seance:update', 'seance:export', 'seance:delete', 'commanditaire:create', 'commanditaire:update', 'commanditaire:delete', 'commanditaire:export', 'campaign:create', 'campaign:update', 'campaign:delete', 'campaign:export', 'classe:create', 'classe:update', 'classe:delete', 'classe:export', 'inscription:create', 'inscription:update', 'inscription:delete', 'inscription:export', 'spot:create', 'spot:update', 'spot:delete', 'spot:export', 'categorie:create', 'categorie:update', 'categorie:delete', 'categorie:export']);

  const checkPermissions = (requiredPermissions: string[]): boolean => {
    return requiredPermissions.every(permission => userPermissions.value.includes(permission));
  };

  const setPermissions = (permissions: string[]) => {
    userPermissions.value = permissions;
  };

  return {
    userPermissions,
    checkPermissions,
    setPermissions
  };
});