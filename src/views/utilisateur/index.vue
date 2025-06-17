<template>
  <VerticalLayout>
    <div class="container-fluid">
      <PageTitle title="Gestion des utilisateurs" />
      <!-- En-tête avec barre de recherche et boutons -->
      <div class="row g-3 mb-4">
        <div class="col-12 col-md-6">
          <SearchBox
            v-model="searchQuery"
            placeholder="Rechercher un utilisateur..."
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
            :data="allUsers"
            filename="utilisateurs"
            label="Exporter"
            class="flex-shrink-0"
          />
        </div>
      </div>

      <!-- Onglets pour les différents types d'utilisateurs -->
      <ul class="nav nav-tabs mb-4">
        <li class="nav-item">
          <a class="nav-link" :class="{ active: activeTab === 'enseignants' }" @click="activeTab = 'enseignants'" href="#">
            Enseignants
            <span class="badge bg-primary ms-1">{{ enseignants.length }}</span>
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" :class="{ active: activeTab === 'parents' }" @click="activeTab = 'parents'" href="#">
            Parents
            <span class="badge bg-primary ms-1">{{ parents.length }}</span>
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" :class="{ active: activeTab === 'apprenants' }" @click="activeTab = 'apprenants'" href="#">
            Apprenants
            <span class="badge bg-primary ms-1">{{ apprenants.length }}</span>
          </a>
        </li>
      </ul>

      <!-- Tableau des enseignants -->
      <div v-show="activeTab === 'enseignants'" class="card">
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-centered table-hover">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Prénom</th>
                  <th>Email</th>
                  <th>Téléphone</th>
                  <th>Matières</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="enseignant in filteredEnseignants" :key="enseignant.id">
                  <td>{{ enseignant.nom }}</td>
                  <td>{{ enseignant.prenom }}</td>
                  <td>{{ enseignant.email }}</td>
                  <td>{{ enseignant.telephone }}</td>
                  <td>
                    <span v-for="matiere in enseignant.matieres" :key="matiere" class="badge bg-soft-primary text-primary me-1">
                      {{ matiere }}
                    </span>
                  </td>
                  <td>
                    <div class="d-flex gap-2">
                      <button v-if="canUpdate" class="btn btn-sm btn-soft-primary" @click="openEditModal(enseignant)">
                        <i class="bx bx-edit"></i>
                      </button>
                      <button v-if="canDelete" class="btn btn-sm btn-soft-danger" @click="openDeleteModal(enseignant)">
                        <i class="bx bx-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Tableau des parents -->
      <div v-show="activeTab === 'parents'" class="card">
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-centered table-hover">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Prénom</th>
                  <th>Email</th>
                  <th>Téléphone</th>
                  <th>Enfants</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="parent in filteredParents" :key="parent.id">
                  <td>{{ parent.nom }}</td>
                  <td>{{ parent.prenom }}</td>
                  <td>{{ parent.email }}</td>
                  <td>{{ parent.telephone }}</td>
                  <td>
                    <span v-for="enfant in parent.enfants" :key="enfant.id" class="badge bg-soft-info text-info me-1">
                      {{ enfant.nom }} {{ enfant.prenom }}
                    </span>
                  </td>
                  <td>
                    <div class="d-flex gap-2">
                      <button v-if="canUpdate" class="btn btn-sm btn-soft-primary" @click="openEditModal(parent)">
                        <i class="bx bx-edit"></i>
                      </button>
                      <button v-if="canDelete" class="btn btn-sm btn-soft-danger" @click="openDeleteModal(parent)">
                        <i class="bx bx-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Tableau des apprenants -->
      <div v-show="activeTab === 'apprenants'" class="card">
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-centered table-hover">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Prénom</th>
                  <th>Date de naissance</th>
                  <th>Classe</th>
                  <th>Parents</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="apprenant in filteredApprenants" :key="apprenant.id">
                  <td>{{ apprenant.nom }}</td>
                  <td>{{ apprenant.prenom }}</td>
                  <td>{{ formatDate(apprenant.date_naissance) }}</td>
                  <td>
                    <span class="badge bg-soft-success text-success">
                      {{ apprenant.classe }}
                    </span>
                  </td>
                  <td>
                    <span v-for="parent in apprenant.parents" :key="parent.id" class="badge bg-soft-info text-info me-1">
                      {{ parent.nom }} {{ parent.prenom }}
                    </span>
                  </td>
                  <td>
                    <div class="d-flex gap-2">
                      <button v-if="canUpdate" class="btn btn-sm btn-soft-primary" @click="openEditModal(apprenant)">
                        <i class="bx bx-edit"></i>
                      </button>
                      <button v-if="canDelete" class="btn btn-sm btn-soft-danger" @click="openDeleteModal(apprenant)">
                        <i class="bx bx-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Pagination commune -->
      <TablePagination
        v-model:current-page="currentPage"
        v-model:items-per-page="itemsPerPage"
        :total-items="totalItems"
        :per-page="itemsPerPage"
      />
    </div>

    <!-- Modal de formulaire -->
   
    <b-modal 
      v-model="showModal"
      :title="isEditing ? 'Modifier l\'utilisateur' : 'Ajouter un utilisateur'"
      @hidden="resetForm"
      :ok-disabled="loading"
      :ok-title="buttonText"
      :cancel-title="'Annuler'"
      @ok="handleSubmit"
      @cancel="handleCancel"
      :hide-footer="false"
    >
      <form ref="agentForm" @submit.prevent="handleSubmit">
        <div class="row g-3">
          <div class="col-md-6">
            <FormField
              id="utilisateur-nom"
              v-model="formData.nom"
              label="Nom"
              type="text"
              required
              :error="formErrors?.nom?.[0]"
            />
          </div>
          <div class="col-md-6">
            <FormField
              id="utilisateur-prenom"
              v-model="formData.prenom"
              label="Prénom"
              type="text"
              required
              :error="formErrors?.prenom?.[0]"
            />
          </div>
          <div class="col-md-6" v-if="!isEditing" >
            <FormField
              id="utilisateur-email"
              v-model="formData.email"
              label="Email"
              type="email"
              required
              :error="formErrors?.email?.[0]"
            />
          </div>
          <div class="col-md-6">
            <FormField
              id="utilisateur-telephone"
              v-model="formData.telephone"
              label="Téléphone"
              type="tel"
              required
              :error="formErrors?.telephone?.[0]"
            />
          </div>
          <div class="col-md-6">
            <FormField
              id="utilisateur-telephone"
              v-model="formData.adresse"
              label="Adresse"
              type="tel"
              required
              :error="formErrors?.adresse?.[0]"
            />
          </div>
          <div class="col-md-6">
            <FormField
              id="utilisateur-telephone"
              v-model="formData.password"
              label="Mot de passe"
              type="tel"
              required
              :error="formErrors?.password?.[0]"
            />
          </div>
          
        </div>
      </form>
     
    </b-modal>

    <!-- Modal de confirmation de suppression -->
   
    <b-modal
      v-model="showDeleteModal"
      title="Confirmer la suppression"
      @hidden="selectedAgent = null"
      :ok-disabled="loading"
      :ok-title="loading ? loadingText : 'Supprimer'"
      :cancel-title="'Annuler'"
      @ok="handleDelete"
      @cancel="handleCancel"
    >
      <p>Êtes-vous sûr de vouloir supprimer cet utilisateur ?</p>
    
    </b-modal>
    <!-- </div> -->
  </VerticalLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import VerticalLayout from '@/layouts/VerticalLayout.vue';
import PageTitle from '@/components/PageTitle.vue';
import LoadingButton from '@/components/LoadingButton.vue';
import ExportButton from '@/components/ExportButton.vue';
import FormField from '@/components/FormField.vue';
import TablePagination from '@/components/TablePagination.vue';
import { showSuccessMessage, showErrorMessage } from '@/helpers/notification';
import { usePermissionStore } from '@/stores/permissionStore';
import SearchBox from '@/components/SearchBox.vue';

// Définition des permissions
const permissions = {
  create: ['user:create'],
  update: ['user:update'],
  delete: ['user:delete'],
  export: ['user:export']
};

const permissionStore = usePermissionStore();

// Vérification des permissions
const canCreate = computed(() => permissionStore.checkPermissions(permissions.create));
const canUpdate = computed(() => permissionStore.checkPermissions(permissions.update));
const canDelete = computed(() => permissionStore.checkPermissions(permissions.delete));
const canExport = computed(() => permissionStore.checkPermissions(permissions.export));

// État global
const activeTab = ref('enseignants');
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = ref(10);
const showModal = ref(false);
const showDeleteModal = ref(false);
const loading = ref(false);
const isEditing = ref(false);
const selectedUser = ref(null);
const formErrors = ref({});

// Données fictives pour le mockup
const enseignants = ref([
  {
    id: 1,
    nom: 'DOUKPON',
    prenom: 'Josué',
    email: 'josue.doupkon@ecole.fr',
    telephone: '0123456789',
    matieres: ['Mathématiques', 'Physique']
  },
  {
    id: 2,
    nom: 'TOUDONOU',
    prenom: 'Josephine',
    email: 'josephine.toudonou@ecole.fr',
    telephone: '0987654321',
    matieres: ['Français', 'Histoire']
  }
]);

const parents = ref([
  {
    id: 1,
    nom: 'ZINSOU',
    prenom: 'Christophe',
    email: 'christophe.zinsou@email.com',
    telephone: '0123456789',
    enfants: [
      { id: 1, nom: 'ZINSOU', prenom: 'Lucas' },
      { id: 2, nom: 'ZINSOU', prenom: 'Emma' }
    ]
  },
  {
    id: 2,
    nom: 'HAGNON',
    prenom: 'Sophie',
    email: 'sophie.hagnon@email.com',
    telephone: '0987654321',
    enfants: [
      { id: 3, nom: 'HAGNON', prenom: 'Thomas' }
    ]
  }
]);

const apprenants = ref([
  {
    id: 1,
    nom: 'HAGNON',
    prenom: 'Thomas',
    date_naissance: '2010-05-15',
    classe: '6ème A',
    parents: [
      { id: 1, nom: 'HAGNON', prenom: 'Sophie' }
    ]
  },
  {
    id: 2,
    nom: 'ZINSOU',
    prenom: 'Lucas',
    date_naissance: '2012-03-20',
    classe: 'CM2',
    parents: [
      { id: 1, nom: 'ZINSOU', prenom: 'Christophe' }
    ]
  }
]);

// Computed properties pour le filtrage
const filteredEnseignants = computed(() => {
  const query = searchQuery.value.toLowerCase();
  return enseignants.value.filter(enseignant =>
    enseignant.nom.toLowerCase().includes(query) ||
    enseignant.prenom.toLowerCase().includes(query) ||
    enseignant.email.toLowerCase().includes(query)
  );
});

const filteredParents = computed(() => {
  const query = searchQuery.value.toLowerCase();
  return parents.value.filter(parent =>
    parent.nom.toLowerCase().includes(query) ||
    parent.prenom.toLowerCase().includes(query) ||
    parent.email.toLowerCase().includes(query)
  );
});

const filteredApprenants = computed(() => {
  const query = searchQuery.value.toLowerCase();
  return apprenants.value.filter(apprenant =>
    apprenant.nom.toLowerCase().includes(query) ||
    apprenant.prenom.toLowerCase().includes(query) ||
    apprenant.classe.toLowerCase().includes(query)
  );
});

// Computed property pour le nombre total d'éléments
const totalItems = computed(() => {
  switch (activeTab.value) {
    case 'enseignants':
      return filteredEnseignants.value.length;
    case 'parents':
      return filteredParents.value.length;
    case 'apprenants':
      return filteredApprenants.value.length;
    default:
      return 0;
  }
});

// Computed property pour tous les utilisateurs (pour l'export)
const allUsers = computed(() => ({
  enseignants: enseignants.value,
  parents: parents.value,
  apprenants: apprenants.value
}));

// Formatage de la date
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('fr-FR');
};

// Gestion du formulaire
const resetForm = () => {
  formData.value = {
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    type: activeTab.value
  };
  formErrors.value = {};
  selectedUser.value = null;
};

const formData = ref({
  nom: '',
  prenom: '',
  email: '',
  telephone: '',
  type: 'enseignants'
});

const validateForm = () => {
  const errors = [];
  if (!formData.value.nom.trim()) errors.push('Le nom est requis');
  if (!formData.value.prenom.trim()) errors.push('Le prénom est requis');
  if (!formData.value.email.trim()) errors.push('L\'email est requis');
  if (!formData.value.telephone?.trim()) errors.push('Le téléphone est requis');
  return errors;
};

// Actions CRUD
const handleSubmit = async (event) => {
  event.preventDefault();
  try {
    loading.value = true;
    formErrors.value = {};
    const errors = validateForm();
    if (errors.length > 0) {
      showErrorMessage(errors.join('\n'));
      return;
    }

    // Simulation d'une requête API
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (isEditing.value) {
      showSuccessMessage('Utilisateur modifié avec succès');
    } else {
      showSuccessMessage('Utilisateur ajouté avec succès');
    }
    showModal.value = false;
  } catch (error) {
    showErrorMessage('Erreur lors de l\'enregistrement');
  } finally {
    loading.value = false;
  }
};

const openAddModal = () => {
  isEditing.value = false;
  resetForm();
  showModal.value = true;
};

const openEditModal = (user) => {
  isEditing.value = true;
  selectedUser.value = user;
  formData.value = { ...user };
  showModal.value = true;
};

const openDeleteModal = (user) => {
  selectedUser.value = user;
  showDeleteModal.value = true;
};

const handleDelete = async () => {
  try {
    loading.value = true;
    // Simulation d'une requête API
    await new Promise(resolve => setTimeout(resolve, 1000));
    showSuccessMessage('Utilisateur supprimé avec succès');
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
};

const buttonText = computed(() => {
  if (loading.value) return loadingText.value;
  return isEditing.value ? 'Modifier' : 'Ajouter';
});

const loadingText = ref(`<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> En cours...`);
</script>