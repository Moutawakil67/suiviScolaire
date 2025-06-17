<template>
  <VerticalLayout>
    <div class="container-fluid">
      <PageTitle title="Gestion des spots" />
      <!-- En-tête avec barre de recherche et boutons -->
      <div class="row g-3 mb-4">
        <div class="col-12 col-md-6">
          <SearchBox
            v-model="searchQuery"
            placeholder="Rechercher un spot..."
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
            :data="spots"
            filename="spots"
            label="Exporter"
            class="flex-shrink-0"
          />
        </div>
      </div>

      <!-- Tableau des spots -->
      <div class="card">
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-centered table-hover">
              <thead>
                <tr>
                  <th>Libellé</th>
                  <th>Type</th>
                  <th>Fichier de référence</th>
                  <th>Durée de référence</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="spot in filteredSpots" :key="spot.id">
                  <td>{{ spot.libelle }}</td>
                  <td>{{ spot.type }}</td>
                  <td>{{ spot.fichier_reference }}</td>
                  <td>{{ spot.duree_reference }}</td>
                  <td>
                    <div class="d-flex gap-2">
                      <button
                        v-if="canUpdate"
                        class="btn btn-sm btn-soft-primary"
                        @click="openEditModal(spot)"
                      >
                        <i class="bx bx-pencil"></i>
                      </button>
                      <button
                        v-if="canDelete"
                        class="btn btn-sm btn-soft-danger"
                        @click="openDeleteModal(spot)"
                      >
                        <i class="bx bx-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="filteredSpots.length === 0">
                  <td colspan="5" class="text-center">Aucun spot trouvé</td>
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
      :title="isEditing ? 'Modifier le spot' : 'Ajouter un spot'"
      @hidden="resetForm"
      :ok-disabled="loading"
      :ok-title="buttonText"
      :cancel-title="'Annuler'"
      @ok="handleSubmit"
      @cancel="handleCancel"
      :hide-footer="false"
    >
      <form ref="spotForm" @submit.prevent="handleSubmit" novalidate>
        <div class="mb-3">
          <FormField
            v-model="form.libelle"
            label="Libellé"
            type="text"
            required
            id="libelle"
            :error="formErrors?.libelle?.[0]"
          />
        </div>
        <div class="mb-3">
          <FormField
            v-model="form.type"
            label="Type"
            type="select"
            :options="[{ value: 'SPOT', label: 'Spot' }, { value: 'EMISSION', label: 'Émission' }]"
            required
            id="type"
            :error="formErrors?.type?.[0]"
          />
        </div>
        <div class="mb-3">
          <FormField
            v-model="form.fichier_reference"
            label="Fichier de référence"
            type="text"
            required
            id="fichier_reference"
            :error="formErrors?.fichier_reference?.[0]"
          />
        </div>
        <div class="mb-3">
          <FormField
            v-model="form.duree_reference"
            label="Durée de référence"
            type="text"
            required
            id="duree_reference"
            :error="formErrors?.duree_reference?.[0]"
          />
        </div>
      </form>
    </b-modal>

    <!-- Modal de confirmation de suppression -->
    <b-modal
      v-model="showDeleteModal"
      title="Confirmer la suppression"
      @hidden="selectedSpot = null"
      :ok-disabled="loading"
      :ok-title="loading ? loadingText : 'Supprimer'"
      :cancel-title="'Annuler'"
      @ok="handleDelete"
      @cancel="handleCancel"
    >
      <p>Êtes-vous sûr de vouloir supprimer ce spot ?</p>
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
import { spotService } from '@/services/spot';
import { showSuccessMessage, showErrorMessage } from '@/helpers/notification';
import { usePermissionStore } from '@/stores/permissionStore';
import SearchBox from '@/components/SearchBox.vue';

// Définition des permissions requises pour chaque action
const permissions = {
  create: ['spot:create'],
  update: ['spot:update'],
  delete: ['spot:delete'],
  export: ['spot:export']
};

// Utilisation du store de permissions
const permissionStore = usePermissionStore();

// Vérification des permissions
const canCreate = computed(() => permissionStore.checkPermissions(permissions.create));
const canUpdate = computed(() => permissionStore.checkPermissions(permissions.update));
const canDelete = computed(() => permissionStore.checkPermissions(permissions.delete));
const canExport = computed(() => permissionStore.checkPermissions(permissions.export));

// État
const spots = ref([]);
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = ref(10);
const showModal = ref(false);
const showDeleteModal = ref(false);
const loading = ref(false);
const isEditing = ref(false);
const selectedSpot = ref(null);

const loadingText = ref(`<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> En cours...`);

// Formulaire
const form = ref({
  libelle: '',
  type: 'SPOT',
  fichier_reference: '',
  duree_reference: ''
});

// Computed properties
const filteredSpots = computed(() => {
  return spots.value.filter(spot =>
    spot.libelle.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    spot.type.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    spot.fichier_reference.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    spot.duree_reference.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const totalItems = computed(() => filteredSpots.value.length);
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value);
const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage.value, totalItems.value));

// Méthodes
const openAddModal = () => {
  isEditing.value = false;
  showModal.value = true;
};

const openEditModal = (spot) => {
  isEditing.value = true;
  selectedSpot.value = spot;
  form.value = { ...spot };
  showModal.value = true;
};

const openDeleteModal = (spot) => {
  selectedSpot.value = spot;
  showDeleteModal.value = true;
};

const formErrors = ref({});

const resetForm = () => {
  form.value = {
    libelle: '',
    type: 'SPOT',
    fichier_reference: '',
    duree_reference: ''
  };
  formErrors.value = {};
  selectedSpot.value = null;
};

const validateForm = () => {
  const errors = [];
  if (!form.value.libelle.trim()) errors.push('Le libellé est requis');
  if (!form.value.type) errors.push('Le type est requis');
  if (!form.value.fichier_reference.trim()) errors.push('Le fichier de référence est requis');
  if (!form.value.duree_reference.trim()) errors.push('La durée de référence est requise');
  return errors;
};

const handleSubmit = async () => {
  try {
    loading.value = true;
    formErrors.value = {};
    const errors = validateForm();
    if (errors.length > 0) {
      showErrorMessage(errors.join('\n'));
      loading.value = false;
      return;
    }

    if (isEditing.value) {
      await spotService.update(selectedSpot.value.id, form.value);
      showSuccessMessage('Spot modifié avec succès');
    } else {
      await spotService.create(form.value);
      showSuccessMessage('Spot ajouté avec succès');
    }
    showModal.value = false;
    loadSpots();
  } catch (error) {
    if (error?.response?.data?.errors) {
      formErrors.value = error.response.data.errors;
    } else {
      showErrorMessage('Erreur lors de l\'enregistrement');
    }
  } finally {
    loading.value = false;
  }
};

const handleDelete = async () => {
  loading.value = true;
  try {
    await spotService.delete(selectedSpot.value.id);
    spots.value = spots.value.filter(c => c.id !== selectedSpot.value?.id);
    showSuccessMessage('Spot supprimé avec succès');
    showDeleteModal.value = false;
  } catch (error) {
    showErrorMessage('Erreur lors de la suppression');
  } finally {
    loading.value = false;
  }
};

const handleCancel = () => {
  showModal.value = false;
  showDeleteModal.value = false;
  resetForm();
  selectedSpot.value = null;
  isEditing.value = false;
};

const loadSpots = async () => {
  loading.value = true;
  try {
    spots.value = await spotService.getAll();
  } catch (error) {
    showErrorMessage('Erreur lors du chargement des spots');
  } finally {
    loading.value = false;
  }
};

// Chargement initial des données
onMounted(() => {
  loadSpots();
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
</style>