<template>
  <VerticalLayout>
    <div class="container-fluid">
    <PageTitle title="Gestion des commanditaires" />
    <!-- En-tête avec barre de recherche et boutons -->
    <div class="row g-3 mb-4">
      <div class="col-12 col-md-6">
        <SearchBox
          v-model="searchQuery"
          placeholder="Rechercher une commanditaire..."
          class="w-100"
        />
      </div>
      <div class="col-12 col-md-6 d-flex justify-content-md-end justify-content-center gap-2">
        <LoadingButton
          v-if="canCreate"
          variant="primary"
          @click="openAddModal"
        >
          <i class="bx bx-plus me-1"></i> Ajouter
        </LoadingButton>
        <ExportButton
          v-if="canExport"
          :data="commanditaires"
          filename="commanditaires"
          label="Exporter"
          class="flex-shrink-0"
        />
      </div>
    </div>

    <!-- Tableau des commanditaires -->
    <div class="card">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-centered table-hover">
            <thead>
              <tr>
                <th>Nom complet</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="commanditaire in filteredCommanditaires" :key="commanditaire.id">
                <td>{{ commanditaire.nom }} {{ commanditaire.prenom }}</td>
                <td>{{ commanditaire.email }}</td>
                <td>{{ commanditaire.telephone }}</td>
                <td class="position-static">
                  <DropDown>
                    <a href="javascript:void(0);" class="dropdown-toggle arrow-none text-dark" data-bs-toggle="dropdown" aria-expanded="false">
                      <i class="bx bx-menu fs-18"></i>
                      
                    </a>
                    <div style="position: absolute;" class="dropdown-menu  dropdown-menu-end  custom-dropdown" >
                      <button  v-if="canUpdate"  @click="openEditModal(commanditaire)"  class="dropdown-item"> <i class="bx vbx-edit me-1"></i>Modifier </button>
                      <button  v-if="canDelete" @click="openDeleteModal(commanditaire)"  class="dropdown-item"> <i class="bx vbx-trash me-1"></i>Supprimer </button>
                      <router-link 
                        :to="{ 
                          path: `/commanditaire/${commanditaire.id}/campagnes`
                        }" 
                        class="dropdown-item"
                      >
                        <i class="bx vbx-megaphone me-1"></i>Campagnes
                      </router-link>
                      <!-- <button class="dropdown-item"> <i class="bx vbx-megaphone me-1"></i>Campages </button> -->
                      <button class="dropdown-item"> <i class="bx vbx-block me-1"></i>Spots</button>
                      <button class="dropdown-item"> <i class="bx vbx-block me-1"></i>Statistiques</button>
                    </div>
                  </DropDown>
                  <!-- <button
                    v-if="canUpdate"
                    class="btn btn-soft-primary btn-sm me-2"
                    @click="openEditModal(commanditaire)"
                  >
                    <i class="bx bx-edit"></i>
                  </button>
                  <button
                    v-if="canDelete"
                    class="btn btn-soft-danger btn-sm"
                    @click="openDeleteModal(commanditaire)"
                  >
                    <i class="bx bx-trash"></i>
                  </button> -->
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <TablePagination
          v-model:currentPage="currentPage"
          :total-items="totalItems"
          :per-page="itemsPerPage"
        />
      </div>
    </div>

    <!-- Modal d'ajout/modification -->
    <b-modal
      v-model="showModal"
      :title="isEditing ? 'Modifier le commanditaire' : 'Ajouter un commanditaire'"
      @hidden="resetForm"
      @cancel="handleCancel"
      :hide-footer="true"
    >
      <form ref="commanditaireForm" @submit.prevent="handleSubmit" novalidate>
        <div class="mb-3">
          <FormField
            v-model="form.nom"
            id="nom"
            label="Nom"
            type="text"
            required
            :error="formErrors.nom"
          />
        </div>
        <div class="mb-3">
          <FormField
            v-model="form.prenom"
            id="prenom"
            label="Prénom"
            type="text"
            required
            :error="formErrors.prenom"
          />
        </div>
        <div class="mb-3" v-if="!isEditing" >
          <FormField
            v-model="form.email"
            id="email"
            label="Email"
            type="email"
            required
            :error="formErrors.email"
          />
        </div>
        <div class="mb-3">
          <FormField
            v-model="form.password"
            id="password"
            label="Mot de passe"
            type="text"
            required
            :error="formErrors.password"
          />
        </div>
        <div class="mb-3">
          <FormField
            v-model="form.telephone"
            id="telephone"
            label="Téléphone"
            type="tel"
            required
            :error="formErrors.telephone"
          />
        </div>
        <div class="mb-3">
          <FormField
            v-model="form.adresse"
            id="adresse"
            label="Adresse"
            type="textarea"
            required
            :error="formErrors.adresse"
          />
        </div>

        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-secondary"
            @click="handleCancel"
            :disabled="loading"
          >
            Annuler
          </button>
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="loading"
          >
            <span
              v-if="loading"
              class="spinner-border spinner-border-sm me-1"
              role="status"
              aria-hidden="true"
            ></span>
            <span>{{ isEditing ? 'Modifier' : 'Ajouter' }}</span>
          </button>
        </div>
      </form>
    </b-modal>

    <!-- Modal de confirmation de suppression -->
    <b-modal
      v-model="showDeleteModal"
      title="Confirmer la suppression"
      @hidden="selectedCommanditaire = null"
      @cancel="handleCancel"
      :hide-footer="true"
    >
      <p>Êtes-vous sûr de vouloir supprimer cette commanditaire ?</p>

      <div class="modal-footer">
        <button
          type="button"
          class="btn btn-secondary"
          @click="handleCancel"
          :disabled="loading"
        >
          Annuler
        </button>
        <button
          type="button"
          class="btn btn-danger"
          @click="handleDelete"
          :disabled="loading"
        >
          <span
            v-if="loading"
            class="spinner-border spinner-border-sm me-1"
            role="status"
            aria-hidden="true"
          ></span>
          <span>{{ loading ? 'En cours...' : 'Supprimer' }}</span>
        </button>
      </div>
    </b-modal>
    </div>
   
  </VerticalLayout> 
  
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import LoadingButton from '@/components/LoadingButton.vue';
import ExportButton from '@/components/ExportButton.vue';
import VerticalLayout from '@/layouts/VerticalLayout.vue';
import PageTitle from '@/components/PageTitle.vue';
import FormField from '@/components/FormField.vue';
import TablePagination from '@/components/TablePagination.vue';
import { commanditaireService } from '@/services/commanditaire';
import { showSuccessMessage, showErrorMessage } from '@/helpers/notification';
import { usePermissionStore } from '@/stores/permissionStore';
import SearchBox from '@/components/SearchBox.vue';

// Définition des permissions requises pour chaque action
const permissions = {
  create: ['commanditaire:create'],
  update: ['commanditaire:update'],
  delete: ['commanditaire:delete'],
  export: ['commanditaire:export']
};

const campaignForm = ref(null)

// Utilisation du store de permissions
const permissionStore = usePermissionStore();

// Vérification des permissions
const canCreate = computed(() => permissionStore.checkPermissions(permissions.create));
const canUpdate = computed(() => permissionStore.checkPermissions(permissions.update));
const canDelete = computed(() => permissionStore.checkPermissions(permissions.delete));
const canExport = computed(() => permissionStore.checkPermissions(permissions.export));

// État
const commanditaires = ref([]);
const searchQuery = ref('');

// S'assurer que commanditaires.value est toujours un tableau
const ensureCommanditairesArray = (data) => {
  
  return Array.isArray(data) ? data : [];
};
const currentPage = ref(1);
const itemsPerPage = ref(10);
const showModal = ref(false);
const showDeleteModal = ref(false);
const loading = ref(false);
const isEditing = ref(false);
const selectedCommanditaire = ref(null);

const loadingText = ref(`<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> En cours...`) 

// Formulaire
const form = ref({
  nom: '',
  prenom: '',
  email: '',
  password: '',
  telephone: '',
  adresse: ''
});

// Computed properties
const filteredCommanditaires = computed(() => {
  return commanditaires.value.filter(commanditaire =>
    commanditaire?.nom?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    commanditaire?.prenom?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    commanditaire?.email?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    commanditaire?.telephone?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    commanditaire?.adresse?.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const totalItems = computed(() => filteredCommanditaires.value.length);
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value);
const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage.value, totalItems.value));

// Méthodes
const openAddModal = () => {
  isEditing.value = false;
  showModal.value = true;
};

const openEditModal = (commanditaire) => {
  isEditing.value = true;
  selectedCommanditaire.value = commanditaire;
  form.value = { ...commanditaire };
  showModal.value = true;
};

const openDeleteModal = (commanditaire) => {
  selectedCommanditaire.value = commanditaire;
  showDeleteModal.value = true;
};

const formErrors = ref({});

const resetForm = () => {
  form.value = {
    nom: '',
    prenom: '',
    email: '',
    password: '',
    telephone: '',
    adresse: ''
  };
  formErrors.value = {};
  selectedCommanditaire.value = null;
};

const validateForm = () => {
  const errors = {};
  if (!form.value.nom.trim()) errors.nom = 'Le nom est requis';
  if (!form.value.prenom.trim()) errors.prenom = 'Le prénom est requis';
  if (!form.value.email.trim()) errors.email = 'L\'email est requis';
  if (!form.value.password.trim()) errors.password = 'Le mot de passe est requis';
  if (!form.value.telephone.trim()) errors.telephone = 'Le téléphone est requis';
  if (!form.value.adresse.trim()) errors.adresse = 'L\'adresse est requise';
  return errors;
};

const handleSubmit = async (event) => {
  event.preventDefault();
  if (!commanditaireForm.value?.checkValidity()) {
    commanditaireForm.value?.reportValidity();
    return;
  }
  loading.value = true;
  formErrors.value = {};
  try {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      formErrors.value = errors;
      showErrorMessage(Object.values(errors).join('\n'));
      loading.value = false;
      return;
    }

    if (isEditing.value && selectedCommanditaire.value) {
      let payload = {
        adresse : form.value.adresse,
        nom : form.value.nom,
        password : form.value.password,
        prenom : form.value.prenom,
        telephone : form.value.telephone,
      }
      const updatedCommanditaire = await commanditaireService.update(selectedCommanditaire.value.id, payload);
      const index = commanditaires.value.findIndex(c => c.id === selectedCommanditaire.value.id);
      if (index !== -1) {
        commanditaires.value[index] = updatedCommanditaire;
        showSuccessMessage('Commanditaire modifié avec succès');
      }
    } else {
      const newCommanditaire = await commanditaireService.create(form.value);
      commanditaires.value.unshift(newCommanditaire);
      showSuccessMessage('Commanditaire ajouté avec succès');
    }
    loadCommanditaires();
    showModal.value = false;
    resetForm();
  } catch (error) {
    console.error(error);
    if (error?.response?.data?.errors) {
      formErrors.value = error.response.data.errors;
    } else {
      const errorMessage = error?.response?.data?.message || 'Erreur lors de la soumission';
      showErrorMessage(errorMessage);
    }
  } finally {
    loading.value = false;
  }
};

const commanditaireForm = ref(null);

// const handleSubmit = async (event) => {
//   event.preventDefault();
//   if (!campaignForm.value?.checkValidity()) {
//     campaignForm.value?.reportValidity();
//     return;
//   }
//   loading.value = true;
//   try {
//     const errors = validateForm();
//     if (errors.length > 0) {
//       showErrorMessage(errors.join('\n'));
//       loading.value = false;
//       return;
//     }

//     if (isEditing.value && selectedCampaign.value) {
//       const updatedCampaign = await campagneService.update(selectedCampaign.value.id, form.value);
//       const index = campaigns.value.findIndex(c => c.id === selectedCampaign.value.id);
//       if (index !== -1) {
//         campaigns.value[index] = updatedCampaign;
//         showSuccessMessage('Campagne modifiée avec succès');
//       }
//     } else {
//       const newCampaign = await campagneService.create(form.value);
//       campaigns.value.unshift(newCampaign);
//       showSuccessMessage('Campagne créée avec succès');
//     }
//     showModal.value = false;
//     resetForm();
//   } catch (error) {
//     const errorMessage = error?.response?.data?.message || 'Erreur lors de la soumission';
//     showErrorMessage(errorMessage);
//   } finally {
//     loading.value = false;
//   }
// };



const handleDelete = async () => {
  loading.value = true;
  try {
    await commanditaireService.deletes(selectedCommanditaire.value.id);
    commanditaires.value = commanditaires.value.filter(c => c.id !== selectedCommanditaire.value?.id);
    showSuccessMessage('Commanditaire supprimé avec succès');
    showDeleteModal.value = false;
  } catch (error) {
    console.error(error);
    showErrorMessage(error?.response?.data?.message || 'Erreur lors de la suppression');
  } finally {
    loading.value = false;
  }
};

const handleCancel = () => {
  showModal.value = false;
  showDeleteModal.value = false;
  resetForm();
  selectedCommanditaire.value = null;
  isEditing.value = false;
};
// Chargement initial des données
const loadCommanditaires = async () => {
  loading.value = true;
  try {
    const response = await commanditaireService.getAll();
    let commanditairesData = response?.commanditaires;
    commanditaires.value = ensureCommanditairesArray(commanditairesData);
  } catch (error) {
    console.error(error);
    showErrorMessage(error?.response?.data?.message || 'Erreur lors du chargement des commanditaires');
    commanditaires.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadCommanditaires();
});
const buttonText = computed(() => {
  if (loading.value) return loadingText.value;
  return isEditing.value ? 'Modifier' : 'Ajouter';
});
</script>

<style scoped>
.search-box {
  max-width: 300px;
}
.table-responsive {
  overflow: visible !important;
}

.position-static {
  position: static !important;
}
</style>


 