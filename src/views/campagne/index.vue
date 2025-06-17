<template>
  <VerticalLayout>
    <div class="container-fluid">
      <PageTitle title="Gestion des campagnes" />
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
                  <th>Désignation</th>
                  <th>Date de début</th>
                  <th>Date de fin</th>
                  <th>Agent de suivi</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="campaign in filteredCampaigns" :key="campaign.id">
                  <td>{{ campaign.designation }}</td>
                  <td>{{ formatDate(campaign.date_debut) }}</td>
                  <td>{{ formatDate(campaign.date_fin) }}</td>
                  <td>{{ campaign.agentDeSuivi }}</td>
                  <td>
                    <div class="d-flex gap-2">
                      <button
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
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="filteredCampaigns.length === 0">
                  <td colspan="4" class="text-center">Aucune campagne trouvée</td>
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
      :ok-disabled="loading"
      :ok-title="buttonText"
      :cancel-title="'Annuler'"
      @ok="handleSubmit"
      @cancel="handleCancel"
      :hide-footer="false"
    >
      <form ref="campaignForm" @submit.prevent="handleSubmit" novalidate>
        <div class="mb-3">
          <FormField
            v-model="formData.designation"
            label="Désignation"
            type="text"
            required
            id="designation"
            :error="formErrors?.designation?.[0]"
          />
        </div>

        <div class="mb-3">
          <FormField
            v-model="formData.description"
            label="Description"
            type="text"
            required
            id="description"
            :error="formErrors?.description?.[0]"
          />
        </div>
        
        <div class="mb-3">
          <FormField
            v-model="formData.date_debut"
            label="Date de début"
            type="date"
            id="date_debut"
            required
            :error="formErrors?.date_debut?.[0]"
          />
        </div>
        <div class="mb-3">
          <FormField
            v-model="formData.date_fin"
            label="Date de fin"
            type="date"
            id="date_fin"
            required
            :error="formErrors?.date_fin?.[0]"
          />
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
import LoadingButton from '@/components/LoadingButton.vue';
import ExportButton from '@/components/ExportButton.vue';
import VerticalLayout from '@/layouts/VerticalLayout.vue';
import PageTitle from '@/components/PageTitle.vue';
import FormField from '@/components/FormField.vue';
import TablePagination from '@/components/TablePagination.vue';
import { campagneService } from '@/services/campagne';
import { showSuccessMessage, showErrorMessage } from '@/helpers/notification';
import { usePermissionStore } from '@/stores/permissionStore';
import SearchBox from '@/components/SearchBox.vue';

// Définition des permissions requises pour chaque action
const permissions = {
  create: ['campaign:create'],
  update: ['campaign:update'],
  delete: ['campaign:delete'],
  export: ['campaign:export']
};

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
const campaigns = ref([]);
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = ref(10);
const showModal = ref(false);
const showDeleteModal = ref(false);
const loading = ref(false);
const isEditing = ref(false);
const selectedCampaign = ref(null);

const formData = ref({
  designation: '',
  date_debut: '',
  date_fin: '',
  description: ''
});
const formErrors = ref({});

const resetForm = () => {
  formData.value = {
    designation: '',
    date_debut: '',
    date_fin: '',
    description: ''
  };
  formErrors.value = {};
  selectedCampaign.value = null;
};

const validateForm = () => {
  const errors = [];
  if (!formData.value.designation.trim()) errors.push('La désignation est requise');
  if (!formData.value.date_debut) errors.push('La date de début est requise');
  if (!formData.value.date_fin) errors.push('La date de fin est requise');
  return errors;
};

const handleSubmit = async () => {
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
    if (error?.response?.data?.errors) {
      formErrors.value = error.response.data.errors;
    } else {
      console.error(error);
      showErrorMessage('Une erreur est survenue');
    }
  } finally {
    loading.value = false;
  }
};

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

// Chargement initial des données
// loadCampaigns();


// Formatage de la date
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR');
};

// Filtrage des campagnes
const filteredCampaigns = computed(() => {
  const query = searchQuery.value.toLowerCase();
  return campaigns.value.filter(campaign =>
    campaign?.designation?.toLowerCase().includes(query) ||
    campaign?.date_debut?.includes(query) ||
    campaign?.date_fin?.includes(query)
  );
});

// Chargement des campagnes
const loadCampaigns = async () => {
  try {
    campaigns.value = await campagneService.getAll();
  } catch (error) {
    showErrorMessage('Erreur lors du chargement des campagnes');
  }
};

// Gestion du modal d'ajout/modification
const openAddModal = () => {
  isEditing.value = false;
  formData.value = {
    designation: '',
    date_debut: '',
    date_fin: '',
    description: ''
  };
  showModal.value = true;
};

const openEditModal = (campaign: any) => {
  isEditing.value = true;
  selectedCampaign.value = campaign;
  formData.value = {
    designation: campaign.designation,
    date_debut: campaign.date_debut,
    date_fin: campaign.date_fin,
    description: campaign.description
  };
  showModal.value = true;
};
</script>