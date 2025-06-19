<template>
  <VerticalLayout>
    <div class="container-fluid">
      <PageTitle title="Gestion des évaluations" />
      
      <!-- Filtres -->
      <div class="row g-3 mb-4">
        <div class="col-12 col-md-2">
          <label class="form-label">Année scolaire</label>
          <select v-model="filters.annee" class="form-select">
            <option value="">Toutes les années</option>
            <option value="2023-2024">2023-2024</option>
            <option value="2024-2025">2024-2025</option>
          </select>
        </div>
        <div class="col-12 col-md-2">
          <label class="form-label">Période</label>
          <select v-model="filters.periode" class="form-select">
            <option value="">Toutes les périodes</option>
            <option value="1">1er Trimestre</option>
            <option value="2">2ème Trimestre</option>
            <option value="3">3ème Trimestre</option>
          </select>
        </div>
        <div class="col-12 col-md-2">
          <label class="form-label">Classe</label>
          <select v-model="filters.classe" class="form-select">
            <option value="">Toutes les classes</option>
            <option value="6A">6ème A</option>
            <option value="6B">6ème B</option>
            <option value="5A">5ème A</option>
            <option value="4A">4ème A</option>
            <option value="3A">3ème A</option>
          </select>
        </div>
        <div class="col-12 col-md-2">
          <label class="form-label">Matière</label>
          <select v-model="filters.matiere" class="form-select">
            <option value="">Toutes les matières</option>
            <option value="Mathématiques">Mathématiques</option>
            <option value="Français">Français</option>
            <option value="Anglais">Anglais</option>
            <option value="Histoire-Géo">Histoire-Géo</option>
            <option value="Sciences">Sciences</option>
            <option value="Sport">Sport</option>
            <option value="Arts">Arts</option>
            <option value="Musique">Musique</option>
          </select>
        </div>
        <div class="col-12 col-md-4">
          <SearchBox
            v-model="searchQuery"
            placeholder="Rechercher un apprenant..."
            class="w-100"
          />
        </div>
      </div>

      <!-- Actions -->
      <div class="row g-3 mb-4">
        <div class="col-12 d-flex justify-content-between align-items-center">
          <div class="d-flex gap-2">
            <LoadingButton
              v-if="canCreate"
              variant="success"
              @click="createEvaluation"
              :loading="creating"
            >
              <i class="bx bx-plus-circle me-1"></i> Nouvelle évaluation
            </LoadingButton>
            <LoadingButton
              v-if="canExport && selectedEvaluations.length > 0"
              variant="primary"
              @click="exportSelected"
            >
              <i class="bx bx-download me-1"></i> Exporter sélectionnées ({{ selectedEvaluations.length }})
            </LoadingButton>
          </div>
          <ExportButton
            v-if="canExport"
            :data="filteredEvaluations"
            filename="evaluations"
            label="Exporter tout"
          />
        </div>
      </div>

      <!-- Statistiques -->
      <div class="row g-3 mb-4">
        <div class="col-md-3">
          <div class="card border-primary">
            <div class="card-body text-center">
              <h3 class="text-primary mb-1">{{ filteredEvaluations.length }}</h3>
              <p class="text-muted mb-0">Évaluations trouvées</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-success">
            <div class="card-body text-center">
              <h3 class="text-success mb-1">{{ evaluationsCorrigees }}</h3>
              <p class="text-muted mb-0">Évaluations corrigées</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-warning">
            <div class="card-body text-center">
              <h3 class="text-warning mb-1">{{ moyenneGenerale.toFixed(2) }}</h3>
              <p class="text-muted mb-0">Moyenne générale</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-info">
            <div class="card-body text-center">
              <h3 class="text-info mb-1">{{ tauxReussite }}%</h3>
              <p class="text-muted mb-0">Taux de réussite</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tableau des évaluations -->
      <div class="card">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="card-title mb-0">Liste des évaluations</h5>
            <div class="form-check">
              <input 
                class="form-check-input" 
                type="checkbox" 
                id="selectAll"
                @change="toggleSelectAll"
                :checked="isAllSelected"
              >
              <label class="form-check-label" for="selectAll">
                Tout sélectionner
              </label>
            </div>
          </div>
          
          <div class="table-responsive">
            <table class="table table-centered table-hover">
              <thead>
                <tr>
                  <th width="50">
                    <input 
                      type="checkbox" 
                      class="form-check-input"
                      @change="toggleSelectAll"
                      :checked="isAllSelected"
                    >
                  </th>
                  <th>Apprenant</th>
                  <th>Classe</th>
                  <th>Matière</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Note</th>
                  <th>Coefficient</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="evaluation in paginatedEvaluations" :key="evaluation.id">
                  <td>
                    <input 
                      type="checkbox" 
                      class="form-check-input"
                      :value="evaluation.id"
                      v-model="selectedEvaluations"
                    >
                  </td>
                  <td>
                    <div class="d-flex align-items-center">
                      <div class="avatar-sm me-2">
                        <div class="avatar-title bg-primary-subtle text-primary rounded-circle">
                          {{ evaluation.apprenant.nom.charAt(0) }}{{ evaluation.apprenant.prenom.charAt(0) }}
                        </div>
                      </div>
                      <div>
                        <h6 class="mb-0">{{ evaluation.apprenant.nom }} {{ evaluation.apprenant.prenom }}</h6>
                        <small class="text-muted">{{ evaluation.apprenant.email }}</small>
                      </div>
                    </div>
                  </td>
                  <td>{{ evaluation.classe.nom }}</td>
                  <td>
                    <span class="badge bg-secondary">{{ evaluation.matiere.nom }}</span>
                  </td>
                  <td>
                    <span class="badge" :class="getTypeBadge(evaluation.type_composition)">
                      {{ evaluation.type_composition }}
                    </span>
                  </td>
                  <td>{{ formatDate(evaluation.date_evaluation) }}</td>
                  <td>
                    <span v-if="evaluation.note !== null" class="fw-bold" :class="getNoteColor(evaluation.note)">
                      {{ evaluation.note.toFixed(2) }}/20
                    </span>
                    <span v-else class="text-muted">-</span>
                  </td>
                  <td>{{ evaluation.coefficient }}</td>
                  <td>
                    <span class="badge" :class="getStatutBadge(evaluation.statut)">
                      {{ evaluation.statut }}
                    </span>
                  </td>
                  <td>
                    <div class="d-flex gap-1">
                      <button
                        class="btn btn-sm btn-soft-info"
                        @click="previewEvaluation(evaluation)"
                        title="Détails"
                      >
                        <i class="bx bx-show"></i>
                      </button>
                      <button
                        v-if="canUpdate && evaluation.statut !== 'Corrigée'"
                        class="btn btn-sm btn-soft-warning"
                        @click="editEvaluation(evaluation)"
                        title="Noter"
                      >
                        <i class="bx bx-pencil"></i>
                      </button>
                      <button
                        v-if="canDownload && evaluation.note !== null"
                        class="btn btn-sm btn-soft-primary"
                        @click="downloadEvaluation(evaluation)"
                        title="Télécharger"
                      >
                        <i class="bx bx-download"></i>
                      </button>
                      <button
                        v-if="canDelete"
                        class="btn btn-sm btn-soft-danger"
                        @click="deleteEvaluation(evaluation)"
                        title="Supprimer"
                      >
                        <i class="bx bx-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="filteredEvaluations.length === 0">
                  <td colspan="10" class="text-center py-4">
                    <div class="d-flex flex-column align-items-center">
                      <i class="bx bx-file display-4 text-muted mb-2"></i>
                      <p class="text-muted">Aucune évaluation trouvée pour les critères sélectionnés</p>
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

    <!-- Modal de détails -->
    <b-modal
      v-model="showPreviewModal"
      title="Détails de l'évaluation"
      size="lg"
      @hidden="selectedEvaluation = null"
      :hide-footer="false"
      :ok-title="selectedEvaluation && selectedEvaluation.note !== null ? 'Télécharger' : 'Fermer'"
      :cancel-title="'Fermer'"
      @ok="selectedEvaluation && selectedEvaluation.note !== null ? downloadEvaluation(selectedEvaluation) : null"
    >
      <div v-if="selectedEvaluation" class="evaluation-preview">
        <!-- En-tête -->
        <div class="text-center mb-4">
          <h4 class="mb-1">ÉVALUATION - {{ selectedEvaluation.matiere.nom.toUpperCase() }}</h4>
          <p class="text-muted">{{ selectedEvaluation.type_composition }} - {{ formatDate(selectedEvaluation.date_evaluation) }}</p>
        </div>

        <!-- Informations -->
        <div class="row mb-4">
          <div class="col-md-6">
            <div class="card bg-light">
              <div class="card-body">
                <h6 class="card-title">Informations de l'apprenant</h6>
                <p class="mb-1"><strong>Nom :</strong> {{ selectedEvaluation.apprenant.nom }}</p>
                <p class="mb-1"><strong>Prénom :</strong> {{ selectedEvaluation.apprenant.prenom }}</p>
                <p class="mb-1"><strong>Classe :</strong> {{ selectedEvaluation.classe.nom }}</p>
                <p class="mb-0"><strong>Année scolaire :</strong> {{ selectedEvaluation.annee_scolaire }}</p>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="card bg-light">
              <div class="card-body">
                <h6 class="card-title">Détails de l'évaluation</h6>
                <p class="mb-1"><strong>Matière :</strong> {{ selectedEvaluation.matiere.nom }}</p>
                <p class="mb-1"><strong>Type :</strong> {{ selectedEvaluation.type_composition }}</p>
                <p class="mb-1"><strong>Coefficient :</strong> {{ selectedEvaluation.coefficient }}</p>
                <p class="mb-0"><strong>Statut :</strong> 
                  <span :class="getStatutColor(selectedEvaluation.statut)">{{ selectedEvaluation.statut }}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Résultat -->
        <div class="card" v-if="selectedEvaluation.note !== null">
          <div class="card-header">
            <h6 class="mb-0">Résultat</h6>
          </div>
          <div class="card-body text-center">
            <h2 class="mb-2" :class="getNoteColor(selectedEvaluation.note)">
              {{ selectedEvaluation.note.toFixed(2) }}/20
            </h2>
            <p class="mb-0 text-muted">{{ getAppreciation(selectedEvaluation.note) }}</p>
          </div>
        </div>

        <!-- En attente de correction -->
        <div class="card" v-else>
          <div class="card-body text-center">
            <i class="bx bx-time-five display-4 text-warning mb-2"></i>
            <h5 class="text-warning">En attente de correction</h5>
            <p class="text-muted mb-0">Cette évaluation n'a pas encore été corrigée.</p>
          </div>
        </div>
      </div>
    </b-modal>

    <!-- Modal de création/édition -->
    <b-modal
      v-model="showCreateModal"
      :title="editingEvaluation ? 'Modifier l\'évaluation' : 'Nouvelle évaluation'"
      @hidden="resetCreateForm"
      :ok-disabled="creating"
      :ok-title="creating ? 'Enregistrement...' : 'Enregistrer'"
      :cancel-title="'Annuler'"
      @ok="handleSave"
    >
      <form>
        <div class="mb-3">
          <label class="form-label">Classe</label>
          <select v-model="createForm.classe" class="form-select" required>
            <option value="">Sélectionner une classe</option>
            <option value="6A">6ème A</option>
            <option value="6B">6ème B</option>
            <option value="5A">5ème A</option>
            <option value="4A">4ème A</option>
            <option value="3A">3ème A</option>
          </select>
        </div>
        <div class="mb-3">
          <label class="form-label">Matière</label>
          <select v-model="createForm.matiere" class="form-select" required>
            <option value="">Sélectionner une matière</option>
            <option value="Mathématiques">Mathématiques</option>
            <option value="Français">Français</option>
            <option value="Anglais">Anglais</option>
            <option value="Histoire-Géo">Histoire-Géo</option>
            <option value="Sciences">Sciences</option>
            <option value="Sport">Sport</option>
            <option value="Arts">Arts</option>
            <option value="Musique">Musique</option>
          </select>
        </div>
        <div class="mb-3">
          <label class="form-label">Type d'évaluation</label>
          <select v-model="createForm.type" class="form-select" required>
            <option value="">Sélectionner un type</option>
            <option value="Devoir">Devoir</option>
            <option value="Composition">Composition</option>
            <option value="Contrôle">Contrôle</option>
            <option value="Interrogation">Interrogation</option>
          </select>
        </div>
        <div class="mb-3">
          <label class="form-label">Date d'évaluation</label>
          <input type="date" v-model="createForm.date" class="form-control" required>
        </div>
        <div class="mb-3">
          <label class="form-label">Coefficient</label>
          <input type="number" v-model="createForm.coefficient" class="form-control" min="1" max="5" required>
        </div>
        <div class="mb-3" v-if="editingEvaluation">
          <label class="form-label">Note (/20)</label>
          <input type="number" v-model="createForm.note" class="form-control" min="0" max="20" step="0.25">
        </div>
      </form>
    </b-modal>
  </VerticalLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted , watch} from 'vue';
import LoadingButton from '@/components/LoadingButton.vue';
import ExportButton from '@/components/ExportButton.vue';
import VerticalLayout from '@/layouts/VerticalLayout.vue';
import PageTitle from '@/components/PageTitle.vue';
import TablePagination from '@/components/TablePagination.vue';
import SearchBox from '@/components/SearchBox.vue';
import { showSuccessMessage, showErrorMessage } from '@/helpers/notification';
import { usePermissionStore } from '@/stores/permissionStore';

// Permissions
const permissions = {
  create: ['evaluation:create'],
  update: ['evaluation:update'],
  delete: ['evaluation:delete'],
  export: ['evaluation:export'],
  download: ['evaluation:download']
};

const permissionStore = usePermissionStore();
const canCreate = computed(() => permissionStore.checkPermissions(permissions.create));
const canUpdate = computed(() => permissionStore.checkPermissions(permissions.update));
const canDelete = computed(() => permissionStore.checkPermissions(permissions.delete));
const canExport = computed(() => permissionStore.checkPermissions(permissions.export));
const canDownload = computed(() => permissionStore.checkPermissions(permissions.download));

// État
const evaluations = ref([]);
const selectedEvaluations = ref([]);
const selectedEvaluation = ref(null);
const editingEvaluation = ref(null);
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = ref(10);
const showPreviewModal = ref(false);
const showCreateModal = ref(false);
const creating = ref(false);

// Filtres
const filters = ref({
  annee: '',
  periode: '',
  classe: '',
  matiere: ''
});

// Formulaire de création/édition
const createForm = ref({
  classe: '',
  matiere: '',
  type: '',
  date: '',
  coefficient: 1,
  note: null
});

// Données mockées
const mockEvaluations = [
  {
    id: 1,
    apprenant: { nom: 'KOUASSI', prenom: 'Jean', email: 'jean.kouassi@email.com' },
    classe: { nom: '6ème A', effectif: 25 },
    matiere: { nom: 'Mathématiques' },
    type_composition: 'Devoir',
    date_evaluation: '2024-11-15',
    periode: 1,
    annee_scolaire: '2024-2025',
    note: 15.75,
    coefficient: 3,
    statut: 'Corrigée'
  },
  {
    id: 2,
    apprenant: { nom: 'DIABATE', prenom: 'Marie', email: 'marie.diabate@email.com' },
    classe: { nom: '6ème A', effectif: 25 },
    matiere: { nom: 'Français' },
    type_composition: 'Composition',
    date_evaluation: '2024-11-18',
    periode: 1,
    annee_scolaire: '2024-2025',
    note: 12.5,
    coefficient: 4,
    statut: 'Corrigée'
  },
  {
    id: 3,
    apprenant: { nom: 'TRAORE', prenom: 'Amadou', email: 'amadou.traore@email.com' },
    classe: { nom: '5ème A', effectif: 28 },
    matiere: { nom: 'Anglais' },
    type_composition: 'Contrôle',
    date_evaluation: '2024-11-20',
    periode: 1,
    annee_scolaire: '2024-2025',
    note: 18.25,
    coefficient: 2,
    statut: 'Corrigée'
  },
  {
    id: 4,
    apprenant: { nom: 'KONE', prenom: 'Fatou', email: 'fatou.kone@email.com' },
    classe: { nom: '6ème A', effectif: 25 },
    matiere: { nom: 'Sciences' },
    type_composition: 'Interrogation',
    date_evaluation: '2024-11-22',
    periode: 1,
    annee_scolaire: '2024-2025',
    note: null,
    coefficient: 2,
    statut: 'En attente'
  },
  {
    id: 5,
    apprenant: { nom: 'OUATTARA', prenom: 'Ibrahim', email: 'ibrahim.ouattara@email.com' },
    classe: { nom: '4ème A', effectif: 26 },
    matiere: { nom: 'Histoire-Géo' },
    type_composition: 'Devoir',
    date_evaluation: '2024-11-25',
    periode: 1,
    annee_scolaire: '2024-2025',
    note: 14.0,
    coefficient: 3,
    statut: 'Corrigée'
  },
  {
    id: 6,
    apprenant: { nom: 'YAO', prenom: 'Aya', email: 'aya.yao@email.com' },
    classe: { nom: '3ème A', effectif: 24 },
    matiere: { nom: 'Mathématiques' },
    type_composition: 'Composition',
    date_evaluation: '2024-11-28',
    periode: 2,
    annee_scolaire: '2024-2025',
    note: 16.75,
    coefficient: 4,
    statut: 'Corrigée'
  },
  {
    id: 7,
    apprenant: { nom: 'BAMBA', prenom: 'Kofi', email: 'kofi.bamba@email.com' },
    classe: { nom: '5ème A', effectif: 28 },
    matiere: { nom: 'Sport' },
    type_composition: 'Contrôle',
    date_evaluation: '2024-12-01',
    periode: 2,
    annee_scolaire: '2024-2025',
    note: null,
    coefficient: 1,
    statut: 'En attente'
  },
  {
    id: 8,
    apprenant: { nom: 'SANGARE', prenom: 'Aminata', email: 'aminata.sangare@email.com' },
    classe: { nom: '6ème B', effectif: 23 },
    matiere: { nom: 'Arts' },
    type_composition: 'Devoir',
    date_evaluation: '2024-12-03',
    periode: 2,
    annee_scolaire: '2024-2025',
    note: 17.5,
    coefficient: 2,
    statut: 'Corrigée'
  }
];

// Initialisation des données
onMounted(() => {
  evaluations.value = mockEvaluations;
});

// Computed
const filteredEvaluations = computed(() => {
  let filtered = evaluations.value;
  
  if (filters.value.annee) {
    filtered = filtered.filter(e => e.annee_scolaire === filters.value.annee);
  }
  
  if (filters.value.periode) {
    filtered = filtered.filter(e => e.periode.toString() === filters.value.periode);
  }
  
  if (filters.value.classe) {
    filtered = filtered.filter(e => e.classe.nom === filters.value.classe);
  }
  
  if (filters.value.matiere) {
    filtered = filtered.filter(e => e.matiere.nom === filters.value.matiere);
  }
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(e =>
      e.apprenant.nom.toLowerCase().includes(query) ||
      e.apprenant.prenom.toLowerCase().includes(query) ||
      e.apprenant.email.toLowerCase().includes(query)
    );
  }
  
  return filtered;
});

const paginatedEvaluations = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredEvaluations.value.slice(start, end);
});

const totalItems = computed(() => filteredEvaluations.value.length);

const isAllSelected = computed(() => {
  return paginatedEvaluations.value.length > 0 && 
         paginatedEvaluations.value.every(e => selectedEvaluations.value.includes(e.id));
});

const evaluationsCorrigees = computed(() => {
  return evaluations.value.filter(e => e.statut === 'Corrigée').length;
});

const moyenneGenerale = computed(() => {
  const evaluationsCorrigees = filteredEvaluations.value.filter(e => e.note !== null);
  if (evaluationsCorrigees.length === 0) return 0;
  const total = evaluationsCorrigees.reduce((sum, e) => sum + e.note, 0);
  return total / evaluationsCorrigees.length;
});

const tauxReussite = computed(() => {
  const evaluationsCorrigees = filteredEvaluations.value.filter(e => e.note !== null);
  if (evaluationsCorrigees.length === 0) return 0;
  const reussies = evaluationsCorrigees.filter(e => e.note >= 10).length;
  return Math.round((reussies / evaluationsCorrigees.length) * 100);
});

// Méthodes utilitaires
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR');
};

const getTypeBadge = (type: string) => {
  const badges = {
    'Devoir': 'bg-primary',
    'Composition': 'bg-success',
    'Contrôle': 'bg-warning',
    'Interrogation': 'bg-info'
  };
  return badges[type] || 'bg-secondary';
};

const getNoteColor = (note: number) => {
  if (note >= 16) return 'text-success';
  if (note >= 14) return 'text-primary';
  if (note >= 10) return 'text-warning';
  return 'text-danger';
};

const getStatutBadge = (statut: string) => {
  const badges = {
    'Corrigée': 'bg-success',
    'En attente': 'bg-warning',
    'Brouillon': 'bg-secondary'
  };
  return badges[statut] || 'bg-secondary';
};

const getStatutColor = (statut: string) => {
  const colors = {
    'Corrigée': 'text-success fw-bold',
    'En attente': 'text-warning fw-bold',
    'Brouillon': 'text-secondary fw-bold'
  };
  return colors[statut] || 'text-secondary';
};

const getAppreciation = (note: number) => {
  if (note >= 16) return 'Excellent';
  if (note >= 14) return 'Très bien';
  if (note >= 12) return 'Bien';
  if (note >= 10) return 'Assez bien';
  return 'Insuffisant';
};

// Actions
const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedEvaluations.value = selectedEvaluations.value.filter(
      id => !paginatedEvaluations.value.some(e => e.id === id)
    );
  } else {
    const currentIds = paginatedEvaluations.value.map(e => e.id);
    selectedEvaluations.value = [...new Set([...selectedEvaluations.value, ...currentIds])];
  }
};

const previewEvaluation = (evaluation: any) => {
  selectedEvaluation.value = evaluation;
  showPreviewModal.value = true;
};

const downloadEvaluation = (evaluation: any) => {
  showSuccessMessage(`Téléchargement du bulletin d'évaluation de ${evaluation.apprenant.nom} ${evaluation.apprenant.prenom}`);
  
  // Générer et télécharger le PDF du bulletin
  const element = document.createElement('a');
  const filename = `evaluation_${evaluation.apprenant.nom}_${evaluation.apprenant.prenom}_${evaluation.matiere.nom}_${evaluation.date_evaluation}.pdf`;
  
  // Simulation du téléchargement - dans un vrai projet, cela ferait appel à une API
  const blob = new Blob(['Contenu du bulletin d\'évaluation'], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  
  element.href = url;
  element.download = filename;
  element.click();
  
  URL.revokeObjectURL(url);
};

const createEvaluation = () => {
  editingEvaluation.value = null;
  resetCreateForm();
  showCreateModal.value = true;
};

const editEvaluation = (evaluation: any) => {
  editingEvaluation.value = evaluation;
  createForm.value = {
    classe: evaluation.classe.nom,
    matiere: evaluation.matiere.nom,
    type: evaluation.type_composition,
    date: evaluation.date_evaluation,
    coefficient: evaluation.coefficient,
    note: evaluation.note
  };
  showCreateModal.value = true;
};

const deleteEvaluation = async (evaluation: any) => {
  if (confirm(`Êtes-vous sûr de vouloir supprimer l'évaluation de ${evaluation.apprenant.nom} ${evaluation.apprenant.prenom} ?`)) {
    try {
      // Simulation de suppression - dans un vrai projet, cela ferait appel à une API
      const index = evaluations.value.findIndex(e => e.id === evaluation.id);
      if (index > -1) {
        evaluations.value.splice(index, 1);
        showSuccessMessage('Évaluation supprimée avec succès');
        
        // Retirer de la sélection si nécessaire
        selectedEvaluations.value = selectedEvaluations.value.filter(id => id !== evaluation.id);
      }
    } catch (error) {
      showErrorMessage('Erreur lors de la suppression de l\'évaluation');
    }
  }
};

const exportSelected = () => {
  if (selectedEvaluations.value.length === 0) {
    showErrorMessage('Aucune évaluation sélectionnée');
    return;
  }
  
  const selectedData = evaluations.value.filter(e => selectedEvaluations.value.includes(e.id));
  
  // Préparer les données pour l'export
  const exportData = selectedData.map(e => ({
    'Nom': e.apprenant.nom,
    'Prénom': e.apprenant.prenom,
    'Email': e.apprenant.email,
    'Classe': e.classe.nom,
    'Matière': e.matiere.nom,
    'Type': e.type_composition,
    'Date': formatDate(e.date_evaluation),
    'Période': `${e.periode}${e.periode === 1 ? 'er' : 'ème'} Trimestre`,
    'Année scolaire': e.annee_scolaire,
    'Note': e.note !== null ? `${e.note.toFixed(2)}/20` : 'Non corrigée',
    'Coefficient': e.coefficient,
    'Statut': e.statut,
    'Appréciation': e.note !== null ? getAppreciation(e.note) : '-'
  }));
  
  // Convertir en CSV
  const csvContent = convertToCSV(exportData);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `evaluations_selectionnees_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  showSuccessMessage(`${selectedEvaluations.value.length} évaluations exportées avec succès`);
};

const convertToCSV = (data: any[]) => {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvHeaders = headers.join(',');
  
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header];
      // Échapper les guillemets et encapsuler dans des guillemets si nécessaire
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',');
  });
  
  return [csvHeaders, ...csvRows].join('\n');
};

const handleSave = async () => {
  if (!validateForm()) return;
  
  creating.value = true;
  
  try {
    if (editingEvaluation.value) {
      // Mise à jour d'une évaluation existante
      const index = evaluations.value.findIndex(e => e.id === editingEvaluation.value.id);
      if (index > -1) {
        evaluations.value[index] = {
          ...evaluations.value[index],
          matiere: { nom: createForm.value.matiere },
          type_composition: createForm.value.type,
          date_evaluation: createForm.value.date,
          coefficient: createForm.value.coefficient,
          note: createForm.value.note,
          statut: createForm.value.note !== null ? 'Corrigée' : 'En attente'
        };
        
        showSuccessMessage('Évaluation mise à jour avec succès');
      }
    } else {
      // Création d'une nouvelle évaluation
      // Dans un vrai projet, on récupérerait les apprenants de la classe sélectionnée
      const nouveauId = Math.max(...evaluations.value.map(e => e.id)) + 1;
      
      // Simulation : créer une évaluation pour un apprenant fictif
      const nouvelleEvaluation = {
        id: nouveauId,
        apprenant: { 
          nom: 'NOUVEAU', 
          prenom: 'Apprenant', 
          email: 'nouveau.apprenant@email.com' 
        },
        classe: { 
          nom: createForm.value.classe, 
          effectif: 25 
        },
        matiere: { nom: createForm.value.matiere },
        type_composition: createForm.value.type,
        date_evaluation: createForm.value.date,
        periode: getPeriodeFromDate(createForm.value.date),
        annee_scolaire: '2024-2025',
        note: createForm.value.note,
        coefficient: createForm.value.coefficient,
        statut: createForm.value.note !== null ? 'Corrigée' : 'En attente'
      };
      
      evaluations.value.unshift(nouvelleEvaluation);
      showSuccessMessage('Nouvelle évaluation créée avec succès');
    }
    
    showCreateModal.value = false;
    resetCreateForm();
    
  } catch (error) {
    showErrorMessage('Erreur lors de l\'enregistrement de l\'évaluation');
  } finally {
    creating.value = false;
  }
};

const validateForm = () => {
  if (!createForm.value.classe) {
    showErrorMessage('Veuillez sélectionner une classe');
    return false;
  }
  
  if (!createForm.value.matiere) {
    showErrorMessage('Veuillez sélectionner une matière');
    return false;
  }
  
  if (!createForm.value.type) {
    showErrorMessage('Veuillez sélectionner un type d\'évaluation');
    return false;
  }
  
  if (!createForm.value.date) {
    showErrorMessage('Veuillez sélectionner une date d\'évaluation');
    return false;
  }
  
  if (!createForm.value.coefficient || createForm.value.coefficient < 1 || createForm.value.coefficient > 5) {
    showErrorMessage('Le coefficient doit être compris entre 1 et 5');
    return false;
  }
  
  if (createForm.value.note !== null && (createForm.value.note < 0 || createForm.value.note > 20)) {
    showErrorMessage('La note doit être comprise entre 0 et 20');
    return false;
  }
  
  return true;
};

const resetCreateForm = () => {
  createForm.value = {
    classe: '',
    matiere: '',
    type: '',
    date: '',
    coefficient: 1,
    note: null
  };
  editingEvaluation.value = null;
};

const getPeriodeFromDate = (dateString: string) => {
  const date = new Date(dateString);
  const month = date.getMonth() + 1; // getMonth() retourne 0-11
  
  if (month >= 9 && month <= 12) return 1; // Septembre à Décembre = 1er trimestre
  if (month >= 1 && month <= 3) return 2;  // Janvier à Mars = 2ème trimestre
  if (month >= 4 && month <= 6) return 3;  // Avril à Juin = 3ème trimestre
  return 1; // Par défaut
};

// Watchers pour réinitialiser la pagination lors des changements de filtres
watch([filters, searchQuery], () => {
  currentPage.value = 1;
}, { deep: true });

// Watcher pour désélectionner les éléments qui ne sont plus visibles
watch(filteredEvaluations, (newFiltered) => {
  const visibleIds = newFiltered.map(e => e.id);
  selectedEvaluations.value = selectedEvaluations.value.filter(id => visibleIds.includes(id));
});
</script>

<style scoped>
.evaluation-preview {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.evaluation-preview .card {
  border: 1px solid #e3e6f0;
  box-shadow: 0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.15);
}

.evaluation-preview .card-header {
  background-color: #f8f9fc;
  border-bottom: 1px solid #e3e6f0;
}

.evaluation-preview h2 {
  font-size: 3rem;
  font-weight: 700;
}

.evaluation-preview h4 {
  color: #5a5c69;
  font-weight: 600;
}

.evaluation-preview h6 {
  color: #3a3b45;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
}

.evaluation-preview .bg-light {
  background-color: #f8f9fc !important;
}

.evaluation-preview .text-muted {
  color: #858796 !important;
}

.table-centered td {
  vertical-align: middle;
}

.avatar-sm {
  height: 2.5rem;
  width: 2.5rem;
}

.avatar-title {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 600;
  height: 100%;
  width: 100%;
}

.card.border-primary {
  border-color: #4e73df !important;
}

.card.border-success {
  border-color: #1cc88a !important;
}

.card.border-warning {
  border-color: #f6c23e !important;
}

.card.border-info {
  border-color: #36b9cc !important;
}

.btn-soft-info {
  color: #36b9cc;
  background-color: rgba(54, 185, 204, 0.1);
  border-color: transparent;
}

.btn-soft-info:hover {
  color: #fff;
  background-color: #36b9cc;
  border-color: #36b9cc;
}

.btn-soft-warning {
  color: #f6c23e;
  background-color: rgba(246, 194, 62, 0.1);
  border-color: transparent;
}

.btn-soft-warning:hover {
  color: #fff;
  background-color: #f6c23e;
  border-color: #f6c23e;
}

.btn-soft-primary {
  color: #4e73df;
  background-color: rgba(78, 115, 223, 0.1);
  border-color: transparent;
}

.btn-soft-primary:hover {
  color: #fff;
  background-color: #4e73df;
  border-color: #4e73df;
}

.btn-soft-danger {
  color: #e74a3b;
  background-color: rgba(231, 74, 59, 0.1);
  border-color: transparent;
}

.btn-soft-danger:hover {
  color: #fff;
  background-color: #e74a3b;
  border-color: #e74a3b;
}

.bg-primary-subtle {
  background-color: rgba(78, 115, 223, 0.1) !important;
}

@media (max-width: 768px) {
  .evaluation-preview h2 {
    font-size: 2rem;
  }
  
  .table-responsive {
    font-size: 0.875rem;
  }
  
  .btn-sm {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
  }
}</style>