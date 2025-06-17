<template>
  <VerticalLayout>
    <div class="container-fluid">
      <PageTitle title="Gestion des classes" />
      <!-- En-tête avec barre de recherche et boutons -->
      <div class="row g-3 mb-4">
        <div class="col-12 col-md-6">
          <SearchBox
            v-model="searchQuery"
            placeholder="Rechercher une classe..."
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
            :data="classes"
            filename="classes"
            label="Exporter"
            class="flex-shrink-0"
          />
        </div>
      </div>

      <!-- Tableau des classes -->
      <div class="card">
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-centered table-hover">
              <thead>
                <tr>
                  <th>Nom de la classe</th>
                  <th>Niveau</th>
                  <th>Année scolaire</th>
                  <th>Nombre d'élèves</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="classe in paginatedClasses" :key="classe.id">
                  <td>
                    <div class="d-flex align-items-center">
                      <div class="avatar-sm bg-primary bg-soft rounded me-2 d-flex align-items-center justify-content-center">
                        <i class="bx bx-book text-primary"></i>
                      </div>
                      <div>
                        <h6 class="mb-0">{{ classe.nom_classe }}</h6>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="badge bg-info bg-soft text-info">{{ classe.niveau }}</span>
                  </td>
                  <td>{{ classe.annee_scolaire }}</td>
                  <td>
                    <span class="text-muted">{{ classe.nombre_eleves || 0 }} élèves</span>
                  </td>
                  <td>
                    <div class="d-flex gap-2">
                      <button
                        v-if="canUpdate"
                        class="btn btn-sm btn-soft-primary"
                        @click="openEditModal(classe)"
                        title="Modifier"
                      >
                        <i class="bx bx-pencil"></i>
                      </button>
                      <button
                        v-if="canDelete"
                        class="btn btn-sm btn-soft-danger"
                        @click="openDeleteModal(classe)"
                        title="Supprimer"
                      >
                        <i class="bx bx-trash"></i>
                      </button>
                      <button
                        class="btn btn-sm btn-soft-success"
                        @click="viewClassDetails(classe)"
                        title="Voir les détails"
                      >
                        <i class="bx bx-show"></i>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="filteredClasses.length === 0">
                  <td colspan="5" class="text-center py-4">
                    <div class="text-muted">
                      <i class="bx bx-search-alt-2 fs-4 d-block mb-2"></i>
                      Aucune classe trouvée
                    </div>
                  </td>
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
  :title="isEditing ? 'Modifier la classe' : 'Ajouter une classe'"
  @hidden="resetForm"
  @cancel="handleCancel"
  :hide-footer="true"
  size="lg"
>
  <form ref="classeForm" @submit.prevent="handleSubmit" novalidate>
    <div class="row">
      <div class="col-md-6 mb-3">
        <FormField
          v-model="form.nom_classe"
          label="Nom de la classe"
          type="text"
          required
          id="nom_classe"
          placeholder="Ex: 6ème A, CM2 B..."
        />
      </div>
      <div class="col-md-6 mb-3">
        <FormField
          v-model="form.niveau"
          label="Niveau"
          type="select"
          :options="niveauOptions"
          required
          id="niveau"
        />
      </div>
    </div>
    
    <div class="row">
      <div class="col-md-6 mb-3">
        <FormField
          v-model="form.annee_scolaire"
          label="Année scolaire"
          type="select"
          :options="anneeOptions"
          required
          id="annee_scolaire"
        />
      </div>
      <div class="col-md-6 mb-3">
        <FormField
          v-model="form.capacite_max"
          label="Capacité maximale"
          type="number"
          id="capacite_max"
          placeholder="Nombre maximum d'élèves"
          min="1"
          max="50"
        />
      </div>
    </div>

    <div class="mb-3">
      <FormField
        v-model="form.description"
        label="Description (optionnel)"
        type="textarea"
        id="description"
        placeholder="Description de la classe..."
        rows="3"
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
  @hidden="selectedClasse = null"
  @cancel="handleCancel"
  :hide-footer="true"
>
  <div class="text-center" v-if="selectedClasse">
    <div class="mb-3">
      <i class="bx bx-error-circle text-danger" style="font-size: 48px;"></i>
    </div>
    <h5 class="mb-3">Supprimer la classe</h5>
    <p class="text-muted mb-3">
      Êtes-vous sûr de vouloir supprimer la classe 
      <strong>{{ selectedClasse.nom_classe }}</strong> ?
    </p>
    <div class="alert alert-warning" v-if="selectedClasse.nombre_eleves > 0">
      <i class="bx bx-info-circle me-1"></i>
      Cette classe contient {{ selectedClasse.nombre_eleves }} élève(s). 
      La suppression affectera ces inscriptions.
    </div>
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
import { classeService } from '@/services/classe';
import { showSuccessMessage, showErrorMessage } from '@/helpers/notification';
import { usePermissionStore } from '@/stores/permissionStore';
import SearchBox from '@/components/SearchBox.vue';
const classeForm = ref(null);

// Définition des permissions requises pour chaque action
const permissions = {
  create: ['classe:create'],
  update: ['classe:update'],
  delete: ['classe:delete'],
  export: ['classe:export']
};

// Utilisation du store de permissions
const permissionStore = usePermissionStore();

// Vérification des permissions
const canCreate = computed(() => permissionStore.checkPermissions(permissions.create));
const canUpdate = computed(() => permissionStore.checkPermissions(permissions.update));
const canDelete = computed(() => permissionStore.checkPermissions(permissions.delete));
const canExport = computed(() => permissionStore.checkPermissions(permissions.export));

// État
const classes = ref([
  // Données mockées pour la démonstration
  {
    id: 1,
    nom_classe: "6ème A",
    niveau: "6ème",
    annee_scolaire: "2023-2024",
    nombre_eleves: 28,
    capacite_max: 30,
    description: "Classe de sixième section A"
  },
  {
    id: 2,
    nom_classe: "5ème B",
    niveau: "5ème",
    annee_scolaire: "2023-2024",
    nombre_eleves: 25,
    capacite_max: 30,
    description: "Classe de cinquième section B"
  },
  {
    id: 3,
    nom_classe: "4ème C",
    niveau: "4ème",
    annee_scolaire: "2023-2024",
    nombre_eleves: 30,
    capacite_max: 30,
    description: "Classe de quatrième section C"
  },
  {
    id: 4,
    nom_classe: "3ème A",
    niveau: "3ème",
    annee_scolaire: "2023-2024",
    nombre_eleves: 27,
    capacite_max: 30,
    description: "Classe de troisième section A - Préparation au brevet"
  },
  {
    id: 5,
    nom_classe: "CM2 A",
    niveau: "CM2",
    annee_scolaire: "2023-2024",
    nombre_eleves: 24,
    capacite_max: 25,
    description: "Classe de CM2 section A"
  },
  {
    id: 6,
    nom_classe: "CM1 B",
    niveau: "CM1",
    annee_scolaire: "2023-2024",
    nombre_eleves: 23,
    capacite_max: 25,
    description: "Classe de CM1 section B"
  },
  {
    id: 7,
    nom_classe: "CE2 A",
    niveau: "CE2",
    annee_scolaire: "2023-2024",
    nombre_eleves: 22,
    capacite_max: 25,
    description: "Classe de CE2 section A"
  },
  {
    id: 8,
    nom_classe: "2nde S",
    niveau: "2nde",
    annee_scolaire: "2023-2024",
    nombre_eleves: 32,
    capacite_max: 35,
    description: "Classe de seconde scientifique"
  }
]);

const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = ref(10);
const showModal = ref(false);
const showDeleteModal = ref(false);
const loading = ref(false);
const isEditing = ref(false);
const selectedClasse = ref(null);
const formErrors = ref({});

const loadingText = ref(`<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> En cours...`);

// Options pour les selects
const niveauOptions = [
  { value: 'CP', label: 'CP' },
  { value: 'CE1', label: 'CE1' },
  { value: 'CE2', label: 'CE2' },
  { value: 'CM1', label: 'CM1' },
  { value: 'CM2', label: 'CM2' },
  { value: '6ème', label: '6ème' },
  { value: '5ème', label: '5ème' },
  { value: '4ème', label: '4ème' },
  { value: '3ème', label: '3ème' },
  { value: '2nde', label: '2nde' },
  { value: '1ère', label: '1ère' },
  { value: 'Terminale', label: 'Terminale' }
];

const anneeOptions = [
  { value: '2023-2024', label: '2023-2024' },
  { value: '2024-2025', label: '2024-2025' },
  { value: '2025-2026', label: '2025-2026' }
];

// Formulaire
const form = ref({
  nom_classe: '',
  niveau: '',
  annee_scolaire: '2023-2024',
  capacite_max: 30,
  description: ''
});

// Computed properties
const filteredClasses = computed(() => {
  return classes.value.filter(classe =>
    classe.nom_classe.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    classe.niveau.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    classe.annee_scolaire.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const totalItems = computed(() => filteredClasses.value.length);
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value);
const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage.value, totalItems.value));

const paginatedClasses = computed(() => {
  return filteredClasses.value.slice(startIndex.value, endIndex.value);
});

// Méthodes
const openAddModal = () => {
  isEditing.value = false;
  showModal.value = true;
};

const openEditModal = (classe) => {
  isEditing.value = true;
  selectedClasse.value = classe;
  form.value = { ...classe };
  showModal.value = true;
};

const openDeleteModal = (classe) => {
  selectedClasse.value = classe;
  showDeleteModal.value = true;
};

const viewClassDetails = (classe) => {
  // Logique pour voir les détails de la classe
  console.log('Voir détails classe:', classe);
  // Redirection vers la page des détails ou ouverture d'un modal détaillé
};

const resetForm = () => {
  form.value = {
    nom_classe: '',
    niveau: '',
    annee_scolaire: '2023-2024',
    capacite_max: 30,
    description: ''
  };
  formErrors.value = {};
  selectedClasse.value = null;
};

const validateForm = () => {
  const errors = [];
  if (!form.value.nom_classe.trim()) errors.push('Le nom de la classe est requis');
  if (!form.value.niveau) errors.push('Le niveau est requis');
  if (!form.value.annee_scolaire) errors.push('L\'année scolaire est requise');
  if (form.value.capacite_max && form.value.capacite_max < 1) errors.push('La capacité maximale doit être positive');
  return errors;
};

const handleSubmit = async (event) => {
  event.preventDefault();
  if (!classeForm.value?.checkValidity()) {
    classeForm.value?.reportValidity();
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

    if (isEditing.value && selectedClasse.value) {
      // Simulation d'une mise à jour
      const index = classes.value.findIndex(c => c.id === selectedClasse.value.id);
      if (index !== -1) {
        classes.value[index] = { ...form.value, id: selectedClasse.value.id, nombre_eleves: selectedClasse.value.nombre_eleves };
        showSuccessMessage('Classe modifiée avec succès');
      }
    } else {
      // Simulation d'une création
      const newClasse = { 
        ...form.value, 
        id: Date.now(), 
        nombre_eleves: 0 
      };
      classes.value.unshift(newClasse);
      showSuccessMessage('Classe créée avec succès');
    }
    showModal.value = false;
    resetForm();
  } catch (error) {
    console.error(error);
    const errorMessage = error?.response?.data?.message || 'Erreur lors de la soumission';
    showErrorMessage(errorMessage);
  } finally {
    loading.value = false;
  }
};

const handleDelete = async () => {
  loading.value = true;
  try {
    // Simulation de la suppression
    classes.value = classes.value.filter(c => c.id !== selectedClasse.value?.id);
    showSuccessMessage('Classe supprimée avec succès');
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
  selectedClasse.value = null;
  isEditing.value = false;
};

// Chargement initial des données
onMounted(async () => {
  loading.value = true;
  try {
    // Simulation du chargement - les données sont déjà dans le ref classes
    // classes.value = await classeService.getAll();
  } catch (error) {
    showErrorMessage('Erreur lors du chargement des classes');
  } finally {
    loading.value = false;
  }
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

.avatar-sm {
  width: 40px;
  height: 40px;
}

.bg-soft {
  background-color: rgba(var(--bs-primary-rgb), 0.1) !important;
}

.table-centered td {
  vertical-align: middle;
}

.badge.bg-soft {
  background-color: rgba(var(--bs-info-rgb), 0.1) !important;
  color: var(--bs-info) !important;
}
</style>