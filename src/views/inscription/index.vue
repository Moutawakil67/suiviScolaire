<template>
  <VerticalLayout>
    <div class="container-fluid">
      <PageTitle title="Gestion des inscriptions" />
      <!-- En-tête avec barre de recherche et boutons -->
      <div class="row g-3 mb-4">
        <div class="col-12 col-md-6">
          <SearchBox
            v-model="searchQuery"
            placeholder="Rechercher une inscription..."
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
            :data="inscriptions"
            filename="inscriptions"
            label="Exporter"
            class="flex-shrink-0"
          />
        </div>
      </div>

      <!-- Tableau des inscriptions -->
      <div class="card">
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-centered table-hover">
              <thead>
                <tr>
                  <th>Élève</th>
                  <th>Classe</th>
                  <th>Année scolaire</th>
                  <th>Date d'inscription</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="inscription in paginatedInscriptions" :key="inscription.id">
                  <td>
                    <div class="d-flex align-items-center">
                      <div class="avatar-sm bg-primary bg-soft rounded me-2 d-flex align-items-center justify-content-center">
                        <i class="bx bx-user text-primary"></i>
                      </div>
                      <div>
                        <h6 class="mb-0">{{ inscription.nom_apprenant }} {{ inscription.prenom_apprenant }}</h6>
                        <small class="text-muted">{{ inscription.email_apprenant }}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="badge bg-info bg-soft text-info">{{ inscription.nom_classe }}</span>
                    <br>
                    <small class="text-muted">{{ inscription.niveau_classe }}</small>
                  </td>
                  <td>{{ inscription.annee_scolaire }}</td>
                  <td>
                    <span class="text-muted">{{ formatDate(inscription.date_inscription) }}</span>
                  </td>
                  <td>
                    <span 
                      :class="getStatusBadgeClass(inscription.statut)"
                      class="badge"
                    >
                      {{ inscription.statut }}
                    </span>
                  </td>
                  <td>
                    <div class="d-flex gap-2">
                      <button
                        v-if="canUpdate"
                        class="btn btn-sm btn-soft-primary"
                        @click="openEditModal(inscription)"
                        title="Modifier"
                      >
                        <i class="bx bx-pencil"></i>
                      </button>
                      <button
                        v-if="canDelete"
                        class="btn btn-sm btn-soft-danger"
                        @click="openDeleteModal(inscription)"
                        title="Supprimer"
                      >
                        <i class="bx bx-trash"></i>
                      </button>
                      <button
                        class="btn btn-sm btn-soft-success"
                        @click="viewInscriptionDetails(inscription)"
                        title="Voir les détails"
                      >
                        <i class="bx bx-show"></i>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="filteredInscriptions.length === 0">
                  <td colspan="6" class="text-center py-4">
                    <div class="text-muted">
                      <i class="bx bx-search-alt-2 fs-4 d-block mb-2"></i>
                      Aucune inscription trouvée
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
  :title="isEditing ? 'Modifier l\'inscription' : 'Ajouter une inscription'"
  @hidden="resetForm"
  @cancel="handleCancel"
  :hide-footer="true"
  size="lg"
>
  <form ref="inscriptionForm" @submit.prevent="handleSubmit" novalidate>
    <div class="row">
      <div class="col-md-6 mb-3">
        <FormField
          v-model="form.nom_apprenant"
          label="Nom de l'élève"
          type="text"
          required
          id="nom_apprenant"
          placeholder="Nom de famille"
        />
      </div>
      <div class="col-md-6 mb-3">
        <FormField
          v-model="form.prenom_apprenant"
          label="Prénom de l'élève"
          type="text"
          required
          id="prenom_apprenant"
          placeholder="Prénom"
        />
      </div>
    </div>
    
    <div class="row">
      <div class="col-md-6 mb-3">
        <FormField
          v-model="form.email_apprenant"
          label="Email de l'élève"
          type="email"
          id="email_apprenant"
          placeholder="email@exemple.com"
        />
      </div>
      <div class="col-md-6 mb-3">
        <FormField
          v-model="form.date_naissance"
          label="Date de naissance"
          type="date"
          id="date_naissance"
        />
      </div>
    </div>

    <div class="row">
      <div class="col-md-6 mb-3">
        <FormField
          v-model="form.classe_id"
          label="Classe"
          type="select"
          :options="classeOptions"
          required
          id="classe_id"
        />
      </div>
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
    </div>

    <div class="row">
      <div class="col-md-6 mb-3">
        <FormField
          v-model="form.date_inscription"
          label="Date d'inscription"
          type="date"
          required
          id="date_inscription"
        />
      </div>
      <div class="col-md-6 mb-3">
        <FormField
          v-model="form.statut"
          label="Statut"
          type="select"
          :options="statutOptions"
          required
          id="statut"
        />
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
  @hidden="selectedInscription = null"
  @cancel="handleCancel"
  :hide-footer="true"
>
  <div class="text-center" v-if="selectedInscription">
    <div class="mb-3">
      <i class="bx bx-error-circle text-danger" style="font-size: 48px;"></i>
    </div>
    <h5 class="mb-3">Supprimer l'inscription</h5>
    <p class="text-muted mb-3">
      Êtes-vous sûr de vouloir supprimer l'inscription de 
      <strong>{{ selectedInscription.nom_apprenant }} {{ selectedInscription.prenom_apprenant }}</strong> 
      en <strong>{{ selectedInscription.nom_classe }}</strong> ?
    </p>
    <div class="alert alert-warning">
      <i class="bx bx-info-circle me-1"></i>
      Cette action est irréversible et supprimera définitivement l'inscription.
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
import { inscriptionService } from '@/services/inscription';
import { showSuccessMessage, showErrorMessage } from '@/helpers/notification';
import { usePermissionStore } from '@/stores/permissionStore';
import SearchBox from '@/components/SearchBox.vue';

const inscriptionForm = ref(null);

// Définition des permissions requises pour chaque action
const permissions = {
  create: ['inscription:create'],
  update: ['inscription:update'],
  delete: ['inscription:delete'],
  export: ['inscription:export']
};

// Utilisation du store de permissions
const permissionStore = usePermissionStore();

// Vérification des permissions
const canCreate = computed(() => permissionStore.checkPermissions(permissions.create));
const canUpdate = computed(() => permissionStore.checkPermissions(permissions.update));
const canDelete = computed(() => permissionStore.checkPermissions(permissions.delete));
const canExport = computed(() => permissionStore.checkPermissions(permissions.export));

// État
const inscriptions = ref([
  {
    id: 1,
    nom_apprenant: "Adjovi",
    prenom_apprenant: "Koffi",
    email_apprenant: "koffi.adjovi@email.com",
    date_naissance: "2010-05-15",
    classe_id: 1,
    nom_classe: "6ème A",
    niveau_classe: "6ème",
    annee_scolaire: "2023-2024",
    date_inscription: "2023-09-01",
    statut: "Actif"
  },
  {
    id: 2,
    nom_apprenant: "Traoré",
    prenom_apprenant: "Aminata",
    email_apprenant: "aminata.traore@email.com",
    date_naissance: "2011-03-22",
    classe_id: 2,
    nom_classe: "5ème B",
    niveau_classe: "5ème",
    annee_scolaire: "2023-2024",
    date_inscription: "2023-09-02",
    statut: "Actif"
  },
  {
    id: 3,
    nom_apprenant: "Ouattara",
    prenom_apprenant: "Moussa",
    email_apprenant: "moussa.ouattara@email.com",
    date_naissance: "2012-07-10",
    classe_id: 3,
    nom_classe: "4ème C",
    niveau_classe: "4ème",
    annee_scolaire: "2023-2024",
    date_inscription: "2023-09-01",
    statut: "En attente"
  },
  {
    id: 4,
    nom_apprenant: "Ngoma",
    prenom_apprenant: "Clarisse",
    email_apprenant: "clarisse.ngoma@email.com",
    date_naissance: "2013-01-28",
    classe_id: 4,
    nom_classe: "3ème A",
    niveau_classe: "3ème",
    annee_scolaire: "2023-2024",
    date_inscription: "2023-08-28",
    statut: "Actif"
  },
  {
    id: 5,
    nom_apprenant: "Boko",
    prenom_apprenant: "Anicet",
    email_apprenant: "anicet.boko@email.com",
    date_naissance: "2014-11-12",
    classe_id: 5,
    nom_classe: "CM2 A",
    niveau_classe: "CM2",
    annee_scolaire: "2023-2024",
    date_inscription: "2023-09-03",
    statut: "Suspendu"
  },
  {
    id: 6,
    nom_apprenant: "Mendy",
    prenom_apprenant: "Fatou",
    email_apprenant: "fatou.mendy@email.com",
    date_naissance: "2015-09-05",
    classe_id: 6,
    nom_classe: "CM1 B",
    niveau_classe: "CM1",
    annee_scolaire: "2023-2024",
    date_inscription: "2023-09-01",
    statut: "Actif"
  },
  {
    id: 7,
    nom_apprenant: "Nzeba",
    prenom_apprenant: "Jean-Claude",
    email_apprenant: "jeanclaude.nzeba@email.com",
    date_naissance: "2016-04-18",
    classe_id: 7,
    nom_classe: "CE2 A",
    niveau_classe: "CE2",
    annee_scolaire: "2023-2024",
    date_inscription: "2023-08-30",
    statut: "Actif"
  },
  {
    id: 8,
    nom_apprenant: "Yao",
    prenom_apprenant: "Prisca",
    email_apprenant: "prisca.yao@email.com",
    date_naissance: "2007-12-03",
    classe_id: 8,
    nom_classe: "2nde S",
    niveau_classe: "2nde",
    annee_scolaire: "2023-2024",
    date_inscription: "2023-09-04",
    statut: "Actif"
  },
  {
    id: 9,
    nom_apprenant: "Sanou",
    prenom_apprenant: "Abdoulaye",
    email_apprenant: "abdoulaye.sanou@email.com",
    date_naissance: "2011-08-25",
    classe_id: 2,
    nom_classe: "5ème B",
    niveau_classe: "5ème",
    annee_scolaire: "2023-2024",
    date_inscription: "2023-09-01",
    statut: "En attente"
  },
  {
    id: 10,
    nom_apprenant: "Gnakouri",
    prenom_apprenant: "Nadia",
    email_apprenant: "nadia.gnakouri@email.com",
    date_naissance: "2010-06-14",
    classe_id: 1,
    nom_classe: "6ème A",
    niveau_classe: "6ème",
    annee_scolaire: "2023-2024",
    date_inscription: "2023-08-29",
    statut: "Actif"
  }
]);

const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = ref(10);
const showModal = ref(false);
const showDeleteModal = ref(false);
const loading = ref(false);
const isEditing = ref(false);
const selectedInscription = ref(null);
const formErrors = ref({});

const loadingText = ref(`<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> En cours...`);

// Options pour les selects
const classeOptions = [
  { value: 1, label: '6ème A' },
  { value: 2, label: '5ème B' },
  { value: 3, label: '4ème C' },
  { value: 4, label: '3ème A' },
  { value: 5, label: 'CM2 A' },
  { value: 6, label: 'CM1 B' },
  { value: 7, label: 'CE2 A' },
  { value: 8, label: '2nde S' }
];

const anneeOptions = [
  { value: '2023-2024', label: '2023-2024' },
  { value: '2024-2025', label: '2024-2025' },
  { value: '2025-2026', label: '2025-2026' }
];

const statutOptions = [
  { value: 'Actif', label: 'Actif' },
  { value: 'En attente', label: 'En attente' },
  { value: 'Suspendu', label: 'Suspendu' },
  { value: 'Annulé', label: 'Annulé' }
];

// Formulaire
const form = ref({
  nom_apprenant: '',
  prenom_apprenant: '',
  email_apprenant: '',
  date_naissance: '',
  classe_id: '',
  annee_scolaire: '2023-2024',
  date_inscription: new Date().toISOString().split('T')[0],
  statut: 'En attente'
});

// Computed properties
const filteredInscriptions = computed(() => {
  return inscriptions.value.filter(inscription =>
    inscription.nom_apprenant.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    inscription.prenom_apprenant.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    inscription.nom_classe.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    inscription.niveau_classe.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    inscription.email_apprenant.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    inscription.statut.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const totalItems = computed(() => filteredInscriptions.value.length);
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value);
const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage.value, totalItems.value));

const paginatedInscriptions = computed(() => {
  return filteredInscriptions.value.slice(startIndex.value, endIndex.value);
});

// Méthodes utilitaires
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR');
};

const getStatusBadgeClass = (statut) => {
  switch (statut) {
    case 'Actif':
      return 'bg-success';
    case 'En attente':
      return 'bg-warning';
    case 'Suspendu':
      return 'bg-danger';
    case 'Annulé':
      return 'bg-secondary';
    default:
      return 'bg-secondary';
  }
};

// Méthodes
const openAddModal = () => {
  isEditing.value = false;
  showModal.value = true;
};

const openEditModal = (inscription) => {
  isEditing.value = true;
  selectedInscription.value = inscription;
  form.value = { ...inscription };
  showModal.value = true;
};

const openDeleteModal = (inscription) => {
  selectedInscription.value = inscription;
  showDeleteModal.value = true;
};

const viewInscriptionDetails = (inscription) => {
  // Logique pour voir les détails de l'inscription
  console.log('Voir détails inscription:', inscription);
  // Redirection vers la page des détails ou ouverture d'un modal détaillé
};

const resetForm = () => {
  form.value = {
    nom_apprenant: '',
    prenom_apprenant: '',
    email_apprenant: '',
    date_naissance: '',
    classe_id: '',
    annee_scolaire: '2023-2024',
    date_inscription: new Date().toISOString().split('T')[0],
    statut: 'En attente'
  };
  formErrors.value = {};
  selectedInscription.value = null;
};

const validateForm = () => {
  const errors = [];
  if (!form.value.nom_apprenant.trim()) errors.push('Le nom de l\'élève est requis');
  if (!form.value.prenom_apprenant.trim()) errors.push('Le prénom de l\'élève est requis');
  if (!form.value.classe_id) errors.push('La classe est requise');
  if (!form.value.annee_scolaire) errors.push('L\'année scolaire est requise');
  if (!form.value.date_inscription) errors.push('La date d\'inscription est requise');
  if (!form.value.statut) errors.push('Le statut est requis');
  return errors;
};

const handleSubmit = async (event) => {
  event.preventDefault();
  if (!inscriptionForm.value?.checkValidity()) {
    inscriptionForm.value?.reportValidity();
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

    // Trouver le nom de la classe
    const selectedClasse = classeOptions.find(c => c.value === parseInt(form.value.classe_id));
    
    if (isEditing.value && selectedInscription.value) {
      // Simulation d'une mise à jour
      const index = inscriptions.value.findIndex(i => i.id === selectedInscription.value.id);
      if (index !== -1) {
        inscriptions.value[index] = { 
          ...form.value, 
          id: selectedInscription.value.id,
          nom_classe: selectedClasse?.label || '',
          niveau_classe: selectedClasse?.label.split(' ')[0] || ''
        };
        showSuccessMessage('Inscription modifiée avec succès');
      }
    } else {
      // Simulation d'une création
      const newInscription = { 
        ...form.value, 
        id: Date.now(),
        nom_classe: selectedClasse?.label || '',
        niveau_classe: selectedClasse?.label.split(' ')[0] || ''
      };
      inscriptions.value.unshift(newInscription);
      showSuccessMessage('Inscription créée avec succès');
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
    inscriptions.value = inscriptions.value.filter(i => i.id !== selectedInscription.value?.id);
    showSuccessMessage('Inscription supprimée avec succès');
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
  selectedInscription.value = null;
  isEditing.value = false;
};

// Chargement initial des données
onMounted(async () => {
  loading.value = true;
  try {
    // Simulation du chargement - les données sont déjà dans le ref inscriptions
    // inscriptions.value = await inscriptionService.getAll();
  } catch (error) {
    showErrorMessage('Erreur lors du chargement des inscriptions');
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