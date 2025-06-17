<template>
  <VerticalLayout>
    <div class="container-fluid">
    <div>
      <h2>Classes Disponibles au Secondaire</h2>
      <ul>
        <li>Classe de Seconde</li>
        <li>Classe de Première</li>
        <li>Classe de Terminale</li>
      </ul>
    </div>
      <PageTitle title="Gestion des Matières" />
      <!-- En-tête avec barre de recherche et boutons -->
      <div class="row g-3 mb-4">
        <div class="col-12 col-md-6">
          <SearchBox v-model="searchQuery" placeholder="Rechercher une catégorie..." class="w-100" />
        </div>
        <div class="col-12 col-md-6 d-flex justify-content-md-end justify-content-center gap-2">
          <LoadingButton v-if="canCreate" variant="primary" @click="openAddModal">
            <i class="bx bx-plus me-1"></i> Ajouter
          </LoadingButton>
          <ExportButton v-if="canExport" :data="categories" filename="categories" label="Exporter"
            class="flex-shrink-0" />
        </div>
      </div>

      <!-- Tableau des catégories -->
      <div class="card">
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-centered table-hover">
              <thead>
                <tr>
                  <th>Matière</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="categorie in filteredCategories" :key="categorie.id">
                  <td>{{ categorie.matiere }}</td>
                  <td>
                    <div class="d-flex gap-2">
                      <button v-if="canUpdate" class="btn btn-sm btn-soft-primary" @click="openEditModal(categorie)">
                        <i class="bx bx-pencil"></i>
                      </button>
                      <button v-if="canDelete" class="btn btn-sm btn-soft-danger" @click="openDeleteModal(categorie)">
                        <i class="bx bx-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="filteredCategories.length === 0">
                  <td colspan="2" class="text-center">Aucune catégorie trouvée</td>
                </tr>
              </tbody>
            </table>
          </div>
          <TablePagination v-model:currentPage="currentPage" :total-items="totalItems" :per-page="itemsPerPage" />
        </div>
      </div>
    </div>

    <!-- Modal d'ajout/modification -->
    <!-- <b-modal
      v-model="showModal"
      :title="isEditing ? 'Modifier la catégorie' : 'Ajouter une catégorie'"
      @hidden="resetForm"
      :ok-disabled="loading"
      :ok-title="buttonText"
      :cancel-title="'Annuler'"
      @ok="handleSubmit"
      @cancel="handleCancel"
      :hide-footer="false"
    >
      <form ref="categorieForm" @submit.prevent="handleSubmit" novalidate>
        <div class="mb-3">
          <FormField
            v-model="form.produit"
            label="Produit"
            type="text"
            required
            id="produit"
          />
        </div>
      </form>
    </b-modal>
    -->

    <!-- Modal de confirmation de suppression -->
    <!--  <b-modal
      v-model="showDeleteModal"
      title="Confirmer la suppression"
      @hidden="selectedCategorie = null"
      :ok-disabled="loading"
      :ok-title="loading ? loadingText : 'Supprimer'"
      :cancel-title="'Annuler'"
      @ok="handleDelete"
      @cancel="handleCancel"
    >
      <p>Êtes-vous sûr de vouloir supprimer cette catégorie ?</p>
    </b-modal>
     -->

    <!-- Modal d'ajout/modification -->
    <b-modal v-model="showModal" :title="isEditing ? 'Modifier la catégorie' : 'Ajouter une catégorie'"
      @hidden="resetForm" @cancel="handleCancel" :hide-footer="true">
      <form ref="categorieForm" @submit.prevent="handleSubmit" novalidate>
        <div class="mb-3">
          <FormField
            v-model="form.produit"
            label="Produit"
            type="text"
            required
            id="produit"
            :error="formErrors?.produit?.[0]"
          />
        </div>

        <!-- Footer personnalisé dans le form -->
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="handleCancel" :disabled="loading">
            Annuler
          </button>
          <button type="submit" class="btn btn-primary" :disabled="loading">
            <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            <span v-if="loading"> En cours...</span>
            <span v-else>{{ isEditing ? 'Modifier' : 'Ajouter' }}</span>
          </button>
        </div>
      </form>
    </b-modal>

    <!-- Modal de confirmation de suppression -->
    <b-modal v-model="showDeleteModal" title="Confirmer la suppression" @hidden="selectedCategorie = null"
      @cancel="handleCancel" :hide-footer="true">
      <p>Êtes-vous sûr de vouloir supprimer cette catégorie ?</p>

      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" @click="handleCancel" :disabled="loading">
          Annuler
        </button>
        <button type="button" class="btn btn-danger" @click="handleDelete" :disabled="loading">
          <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          <span v-if="loading"> En cours...</span>
          <span v-else>Supprimer</span>
        </button>
      </div>
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
import { categorieService } from '@/services/categorie';
import { showSuccessMessage, showErrorMessage } from '@/helpers/notification';
import { usePermissionStore } from '@/stores/permissionStore';
import SearchBox from '@/components/SearchBox.vue';

// Définition des permissions requises pour chaque action
const permissions = {
  create: ['categorie:create'],
  update: ['categorie:update'],
  delete: ['categorie:delete'],
  export: ['categorie:export']
};

// Utilisation du store de permissions
const permissionStore = usePermissionStore();

// Vérification des permissions
const canCreate = computed(() => permissionStore.checkPermissions(permissions.create));
const canUpdate = computed(() => permissionStore.checkPermissions(permissions.update));
const canDelete = computed(() => permissionStore.checkPermissions(permissions.delete));
const canExport = computed(() => permissionStore.checkPermissions(permissions.export));

// État
const categories = ref([]);
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = ref(10);
const showModal = ref(false);
const showDeleteModal = ref(false);
const loading = ref(false);
const isEditing = ref(false);
const selectedCategorie = ref(null);

const loadingText = ref(`<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> En cours...`);

// Formulaire
const form = ref({
  produit: ''
});

const totalItems = ref(0);

// Computed properties
const filteredCategories = computed(() => {

  if(searchQuery.value){
      categories.value = categories.value.filter(categorie =>
      categorie.produit.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  }
  
 
   totalItems.value = categories.value.length;
  const startIndex =  (currentPage.value - 1) * itemsPerPage.value;
  const endIndex = startIndex + itemsPerPage.value;
  
  return categories.value.slice(startIndex, endIndex);


});




// Méthodes
const openAddModal = () => {
  isEditing.value = false;
  showModal.value = true;
};

const openEditModal = (categorie) => {
  isEditing.value = true;
  selectedCategorie.value = categorie;
  form.value = { ...categorie };
  showModal.value = true;
};

const openDeleteModal = (categorie) => {
  selectedCategorie.value = categorie;
  showDeleteModal.value = true;
};

const formErrors = ref({});

const resetForm = () => {
  form.value = {
    produit: ''
  };
  formErrors.value = {};
  selectedCategorie.value = null;
};

const validateForm = () => {
  const errors = [];
  if (!form.value.produit.trim()) errors.push('Le produit est requis');
  return errors;
};



const categorieForm = ref(null);

const handleSubmit = async (event) => {
  event.preventDefault();
  if (!categorieForm.value?.checkValidity()) {
    categorieForm.value?.reportValidity();
    return;
  }
  loading.value = true;
  try {
    const errors = validateForm();
    if (errors.length > 0) {

      showErrorMessage(errors.join('\n'));

      loading.value = false;
      return;
    }

    if (isEditing.value && selectedCategorie.value) {
      const updatedCategorie = await categorieService.update(selectedCategorie.value.id, form.value);
      const index = categories.value.findIndex(c => c.id === selectedCategorie.value.id);
      if (index !== -1) {
        categories.value[index] = updatedCategorie;
        showSuccessMessage('Catégorie modifiée avec succès');
      }
    } else {
      const newCategorie = await categorieService.create(form.value);
      categories.value.unshift(newCategorie);
      showSuccessMessage('Catégorie créée avec succès');
    }
    showModal.value = false;
    resetForm();
  } catch (error) {
    const errorMessage = error?.response?.data?.message || 'Erreur lors de la soumission';
    showErrorMessage(errorMessage);
  } finally {
    loading.value = false;
  }
};

const handleDelete = async () => {
  loading.value = true;
  try {
    await categorieService.delete(selectedCategorie.value.id);
    categories.value = categories.value.filter(c => c.id !== selectedCategorie.value?.id);
    showSuccessMessage('Catégorie supprimée avec succès');
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
  selectedCategorie.value = null;
  isEditing.value = false;
};

const loadCategories = async () => {
  loading.value = true;
  try {
    categories.value = await categorieService.getAll();
  } catch (error) {
    showErrorMessage('Erreur lors du chargement des catégories');
  } finally {
    loading.value = false;
  }
};

// Chargement initial des données
onMounted(() => {
  loadCategories();
});

const buttonText = computed(() => {
  if (loading.value) return loadingText.value;
  return isEditing.value ? 'Modifier' : 'Ajouter';
});

import { watch } from 'vue';

watch(loading, (newValue) => {
  
  if (newValue) {
   
  }
});

</script>

<style scoped>
.search-box {
  max-width: 300px;
}
</style>