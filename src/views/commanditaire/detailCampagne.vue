<template>
  <VerticalLayout>
    <div class="container-fluid">
      <PageTitle title="Gestion des campagnes du commanditaire" />
      <p>
        Nom du commanditaire : 
        <span class="badge bg-primary">
          {{ infoCommanditaire?.nom }}
        </span>
      </p>
      <!-- En-tête avec barre de recherche et boutons -->
      <div class="row g-3 mb-4">
        <div class="col-12 col-md-6">
          <SearchBox
            v-model="searchQuery"
            placeholder="Rechercher une campagne..."
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
            :data="campaigns"
            filename="campagnes"
            label="Exporter"
            class="flex-shrink-0"
          />
        </div>
      </div>

      <!-- Tableau des campagnes -->
      <div class="card">
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-centered table-hover">
              <thead>
                <tr>
                  <th>Titre</th>
                  <th>Description</th>
                  <th>Date de début</th>
                  <th>Date de fin</th>
                  <th>Catégorie</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="campaign in filteredCampaigns" :key="campaign.id">
                  <td>{{ campaign.titre }}</td>
                  <td>{{ campaign.description }}</td>
                  <td>{{ formatDate(campaign.date_debut) }}</td>
                  <td>{{ formatDate(campaign.date_fin) }}</td>
                  <td>{{ categories.find(cat => cat.id === campaign.category_id)?.name }}</td>
                  <td>
                   
                    <div class="d-flex gap-2">
                      <DropDown>
                        <a href="javascript:void(0);" class="dropdown-toggle arrow-none text-dark" data-bs-toggle="dropdown" aria-expanded="false">
                          <i class="bx bx-menu fs-18"></i>
                          
                        </a>
                        <div class="dropdown-menu  dropdown-menu-end  custom-dropdown" >
                          <button  v-if="canUpdate"  @click="openEditModal(campaign)"  class="dropdown-item"> <i class="bx vbx-edit me-1"></i>Modifier </button>
                          <button  v-if="canDelete" @click="openDeleteModal(campaign)"  class="dropdown-item"> <i class="bx vbx-trash me-1"></i>Supprimer </button>
                          <router-link 
                            :to="{ 
                              path: `/commanditaire/${commanditaireId}/campagnes/${campaign.id}/programmes/`
                            }" 
                            class="dropdown-item"
                          >
                            <i class="bx vbx-megaphone me-1"></i>Programmes
                          </router-link>
                          <!-- <button class="dropdown-item"> <i class="bx vbx-megaphone me-1"></i>Campages </button> -->
                          <!-- <button class="dropdown-item"> <i class="bx vbx-block me-1"></i>Spots</button>
                          <button class="dropdown-item"> <i class="bx vbx-block me-1"></i>Statistiques</button> -->
                        </div>
                      </DropDown>
                      <!-- <button
                        v-if="canUpdate"
                        class="btn btn-sm btn-soft-primary"
                        @click="openEditModal(campaign)"
                      >
                        <i class="bx bx-pencil"></i>
                      </button>
                      <button
                        v-if="canDelete"
                        class="btn btn-sm btn-soft-danger"
                        @click="openDeleteModal(campaign)"
                      >
                        <i class="bx bx-trash"></i>
                      </button> -->
                    </div>
                  </td>
                </tr>
                <tr v-if="filteredCampaigns.length === 0">
                  <td colspan="6" class="text-center">Aucune campagne trouvée</td>
                </tr>
              </tbody>
            </table>
          </div>
          <TablePagination
            v-model:currentPage="currentPage"
            :total-items="totalItems"
            :per-page="itemsPerPage"
          />
        </div>
      </div>
    </div>

    <!-- Modal d'ajout/modification -->
    <b-modal
      v-model="showModal"
      :title="isEditing ? 'Modifier la campagne' : 'Ajouter une campagne'"
      @hidden="resetForm"
      @cancel="handleCancel"
      :hide-footer="true"
    >
      <form ref="campaignForm" @submit.prevent="handleSubmit" novalidate>
        <div class="mb-3">
          <label for="titre" class="form-label">Titre</label>
          <input
            type="text"
            class="form-control"
            
            id="titre"
            v-model="formData.titre"
          />
         
        </div>

        <div class="mb-3">
          <label for="description" class="form-label">Description</label>
          <textarea
            class="form-control"
           
            id="description"
            v-model="formData.description"
            rows="3"
          ></textarea>
           
        </div>

        <div class="mb-3">
          <label for="date_debut" class="form-label">Date de début</label>
          <input
            type="date"
            class="form-control"
             
            id="date_debut"
            v-model="formData.date_debut"
          />
          
        </div>

        <div class="mb-3">
          <label for="date_fin" class="form-label">Date de fin</label>
          <input
            type="date"
            class="form-control"
            
            id="date_fin"
            v-model="formData.date_fin"
          />
           
        </div>

        <div class="mb-3">
          <label for="category_id" class="form-label">Catégorie</label>
          <select
            class="form-select"
             
            id="category_id"
            v-model="formData.category_id" 
          >
            <option value="">Sélectionnez une catégorie</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.produit }}
            </option>
          </select>
         
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
      @hidden="selectedCampaign = null"
      :ok-disabled="loading"
      :ok-title="loading ? loadingText : 'Supprimer'"
      :cancel-title="'Annuler'"
      @ok="handleDelete"
      @cancel="handleCancel"
    >
      <p>Êtes-vous sûr de vouloir supprimer cette campagne ?</p>
    </b-modal>
  </VerticalLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import LoadingButton from '@/components/LoadingButton.vue';
import ExportButton from '@/components/ExportButton.vue';
import VerticalLayout from '@/layouts/VerticalLayout.vue';
import PageTitle from '@/components/PageTitle.vue';
import FormField from '@/components/FormField.vue';
import TablePagination from '@/components/TablePagination.vue';
import { campagneService } from '@/services/campagne';
import { categorieService } from '@/services/categorie';
import { showSuccessMessage, showErrorMessage } from '@/helpers/notification';
import { useRoute } from 'vue-router';
import { usePermissionStore } from '@/stores/permissionStore';
import SearchBox from '@/components/SearchBox.vue';



// Définition des permissions requises pour chaque action
const permissions = {
  create: ['campaign:create'],
  update: ['campaign:update'],
  delete: ['campaign:delete'],
  export: ['campaign:export']
};

const campaignForm = ref(null)

const totalItems = computed(() => filteredCampaigns.value.length);
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value);
const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage.value, totalItems.value));

// Utilisation du store de permissions
const permissionStore = usePermissionStore();

// Vérification des permissions
const canCreate = computed(() => permissionStore.checkPermissions(permissions.create));
const canUpdate = computed(() => permissionStore.checkPermissions(permissions.update));
const canDelete = computed(() => permissionStore.checkPermissions(permissions.delete));
const canExport = computed(() => permissionStore.checkPermissions(permissions.export));

// État
const route = useRoute();
const commanditaireId = computed(() => route.params.id as string);



const campaigns = ref([]);
const categories = ref([]);
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = ref(10);
const showModal = ref(false);
const showDeleteModal = ref(false);
const loading = ref(false);
const isEditing = ref(false);
const selectedCampaign = ref(null);

const formData = ref({
  titre: '',
  description: '',
  date_debut: '',
  date_fin: '',
  category_id: '',
  commanditaire_id: ""
});

const rules = {
  titre: { required },
  description: { required },
  date_debut: { required },
  date_fin: { required },
  category_id: { required },
  commanditaire_id: { required }
};

const v$ = useVuelidate(rules, formData);
const formErrors = ref({});

const resetForm = () => {
  formData.value = {
    titre: '',
    description: '',
    date_debut: '',
    date_fin: '',
    category_id: '',
    commanditaire_id: ''
  };
  formErrors.value = {};
  selectedCampaign.value = null;
  v$.value.$reset();
};

const validateForm = () => {
  const errors = [];

  if (!formData.value.titre.trim()) {
    errors.push('Le titre est requis');
  }
 
  if (!formData.value.date_debut) {
    errors.push('La date de début est requise');
  }
  if (!formData.value.date_fin) {
    errors.push('La date de fin est requise');
  }
  if (formData.value.date_debut && formData.value.date_fin) {
  const debut = new Date(formData.value.date_debut);
  const fin = new Date(formData.value.date_fin);
  if (fin < debut) {
    errors.push('La date de fin doit être postérieure à la date de début');
  }
}



  if (!formData.value.category_id) {
    errors.push('La catégorie est requise');
  }
  formData.value.commanditaire_id = commanditaireId.value;
  if (!formData.value.commanditaire_id) {
    errors.push('Le commanditaire est requis');
  }

  return errors;
};




const handleSubmit = async (event) => {
  event.preventDefault();
  if (!campaignForm.value?.checkValidity()) {
    campaignForm.value?.reportValidity();
    return;
  }
  loading.value = true;
  formErrors.value = {};

  try {
    const errors = validateForm();
   
 
    if (errors.length > 0) {
      showErrorMessage(errors.join('\n'));
      loading.value = false;
      return;
    }

  

      if (isEditing.value && selectedCampaign.value) {
        await campagneService.update(selectedCampaign.value.id, formData.value);
        showSuccessMessage('Campagne modifiée avec succès');
      } else {
        
    
        await campagneService.create(formData.value);
        
        showSuccessMessage('Campagne créée avec succès');
      }
     
      await loadCampaigns();
      showModal.value = false;
      resetForm();
  } catch (error) {
    console.error(error);
    if (error?.response?.data?.errors) {
      formErrors.value = error.response.data.errors;
    } else {
     
      showErrorMessage('Une erreur est survenue');
    }
  } finally {
    loading.value = false;
  }
}

// Gestion du modal de suppression
const openDeleteModal = (campaign: any) => {
  selectedCampaign.value = campaign;
  showDeleteModal.value = true;
};

const handleCancel = () => {
  showModal.value = false;
  showDeleteModal.value = false;
  resetForm();
  selectedCampaign.value = null;
  isEditing.value = false;
};

const loadingText = ref(`<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> En cours...`);

const buttonText = computed(() => {
  if (loading.value) return loadingText.value;
  return isEditing.value ? 'Modifier' : 'Ajouter';
});

// Suppression d'une campagne
const handleDelete = async () => {
  if (!selectedCampaign.value) return;
  
  loading.value = true;
  try {
    await campagneService.delete(selectedCampaign.value.id);
    showSuccessMessage('Campagne supprimée avec succès');
    await loadCampaigns();
    
  } catch (error) {
    showErrorMessage('Une erreur est survenue lors de la suppression');
  } finally {
    loading.value = false;
  }
};

// Chargement des catégories
const loadCategories = async () => {
  try {
    categories.value = await categorieService.getAll();
  } catch (error) {
    showErrorMessage('Erreur lors du chargement des catégories');
  }
};

onMounted(async () => {
  await Promise.all([loadCampaigns(), loadCategories()]);
  formData.value.commanditaire_id = commanditaireId.value;

});


// Formatage de la date
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR');
};

// Computed properties
const filteredCampaigns = computed(() => {
  return campaigns.value.filter(campaign =>
    campaign.titre.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    campaign.description.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const infoCommanditaire = ref({})
// Chargement des campagnes
const loadCampaigns = async () => {
  try {
    if (!commanditaireId.value) return;
  //  alert("ok")
    campaigns.value = await campagneService.getCommanditairesCampagne(commanditaireId.value);

    infoCommanditaire.value = campaigns.value[0].commanditaire;
  } catch (error) {
    showErrorMessage('Erreur lors du chargement des campagnes');
  }
};

// Gestion du modal d'ajout/modification
const openAddModal = () => {
  isEditing.value = false;
  formData.value = {
    titre: '',
    description: '',
    date_debut: '',
    date_fin: '',
    category_id: '',
    commanditaire_id: ''
  };
  showModal.value = true;
};

const openEditModal = (campaign) => {
  isEditing.value = true;
  selectedCampaign.value = campaign;
  formData.value = {
    titre: campaign.titre,
    description: campaign.description,
    date_debut: campaign.date_debut,
    date_fin: campaign.date_fin,
    commanditaire_id: commanditaireId.value,
    category_id: campaign.category_id
  };
  showModal.value = true;
};
</script>