<template>
  <VerticalLayout>
    <div class="container-fluid">
      <PageTitle title="Gestion des bulletins" />
      
      <!-- Filtres -->
      <div class="row g-3 mb-4">
        <div class="col-12 col-md-3">
          <label class="form-label">Année scolaire</label>
          <select v-model="filters.annee" class="form-select">
            <option value="">Toutes les années</option>
            <option value="2023-2024">2023-2024</option>
            <option value="2024-2025">2024-2025</option>
          </select>
        </div>
        <div class="col-12 col-md-3">
          <label class="form-label">Trimestre</label>
          <select v-model="filters.trimestre" class="form-select">
            <option value="">Tous les trimestres</option>
            <option value="1">1er Trimestre</option>
            <option value="2">2ème Trimestre</option>
            <option value="3">3ème Trimestre</option>
          </select>
        </div>
        <div class="col-12 col-md-3">
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
        <div class="col-12 col-md-3">
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
              v-if="canGenerate"
              variant="success"
              @click="generateBulletins"
              :loading="generating"
            >
              <i class="bx bx-plus-circle me-1"></i> Générer bulletins
            </LoadingButton>
            <LoadingButton
              v-if="canExport && selectedBulletins.length > 0"
              variant="primary"
              @click="exportSelected"
            >
              <i class="bx bx-download me-1"></i> Télécharger sélectionnés ({{ selectedBulletins.length }})
            </LoadingButton>
          </div>
          <ExportButton
            v-if="canExport"
            :data="filteredBulletins"
            filename="bulletins"
            label="Exporter tout"
          />
        </div>
      </div>

      <!-- Statistiques -->
      <div class="row g-3 mb-4">
        <div class="col-md-3">
          <div class="card border-primary">
            <div class="card-body text-center">
              <h3 class="text-primary mb-1">{{ filteredBulletins.length }}</h3>
              <p class="text-muted mb-0">Bulletins trouvés</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-success">
            <div class="card-body text-center">
              <h3 class="text-success mb-1">{{ bulletinsGeneres }}</h3>
              <p class="text-muted mb-0">Bulletins générés</p>
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

      <!-- Tableau des bulletins -->
      <div class="card">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="card-title mb-0">Liste des bulletins</h5>
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
                  <th>Trimestre</th>
                  <th>Année</th>
                  <th>Moyenne</th>
                  <th>Rang</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="bulletin in paginatedBulletins" :key="bulletin.id">
                  <td>
                    <input 
                      type="checkbox" 
                      class="form-check-input"
                      :value="bulletin.id"
                      v-model="selectedBulletins"
                    >
                  </td>
                  <td>
                    <div class="d-flex align-items-center">
                      <div class="avatar-sm me-2">
                        <div class="avatar-title bg-primary-subtle text-primary rounded-circle">
                          {{ bulletin.apprenant.nom.charAt(0) }}{{ bulletin.apprenant.prenom.charAt(0) }}
                        </div>
                      </div>
                      <div>
                        <h6 class="mb-0">{{ bulletin.apprenant.nom }} {{ bulletin.apprenant.prenom }}</h6>
                        <small class="text-muted">{{ bulletin.apprenant.email }}</small>
                      </div>
                    </div>
                  </td>
                  <td>{{ bulletin.classe.nom }}</td>
                  <td>
                    <span class="badge" :class="getTrimestreBadge(bulletin.trimestre)">
                      {{ bulletin.trimestre }}{{ getTrimestreOrdinal(bulletin.trimestre) }} Trimestre
                    </span>
                  </td>
                  <td>{{ bulletin.annee_scolaire }}</td>
                  <td>
                    <span class="fw-bold" :class="getMoyenneColor(bulletin.moyenne)">
                      {{ bulletin.moyenne.toFixed(2) }}/20
                    </span>
                  </td>
                  <td>
                    <span class="badge bg-secondary">{{ bulletin.rang }}/{{ bulletin.classe.effectif }}</span>
                  </td>
                  <td>
                    <span class="badge" :class="getStatutBadge(bulletin.moyenne)">
                      {{ getStatut(bulletin.moyenne) }}
                    </span>
                  </td>
                  <td>
                    <div class="d-flex gap-1">
                      <button
                        class="btn btn-sm btn-soft-info"
                        @click="previewBulletin(bulletin)"
                        title="Prévisualiser"
                      >
                        <i class="bx bx-show"></i>
                      </button>
                      <button
                        v-if="canDownload"
                        class="btn btn-sm btn-soft-primary"
                        @click="downloadBulletin(bulletin)"
                        title="Télécharger"
                      >
                        <i class="bx bx-download"></i>
                      </button>
                      <button
                        v-if="canUpdate && bulletin.statut !== 'Validé'"
                        class="btn btn-sm btn-soft-warning"
                        @click="editBulletin(bulletin)"
                        title="Modifier"
                      >
                        <i class="bx bx-pencil"></i>
                      </button>
                      <button
                        v-if="canDelete"
                        class="btn btn-sm btn-soft-danger"
                        @click="deleteBulletin(bulletin)"
                        title="Supprimer"
                      >
                        <i class="bx bx-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="filteredBulletins.length === 0">
                  <td colspan="9" class="text-center py-4">
                    <div class="d-flex flex-column align-items-center">
                      <i class="bx bx-file display-4 text-muted mb-2"></i>
                      <p class="text-muted">Aucun bulletin trouvé pour les critères sélectionnés</p>
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

    <!-- Modal de prévisualisation -->
    <b-modal
      v-model="showPreviewModal"
      title="Prévisualisation du bulletin"
      size="xl"
      @hidden="selectedBulletin = null"
      :hide-footer="false"
      :ok-title="'Télécharger'"
      :cancel-title="'Fermer'"
      @ok="downloadBulletin(selectedBulletin)"
    >
      <div v-if="selectedBulletin" class="bulletin-preview">
        <!-- En-tête du bulletin -->
        <div class="text-center mb-4">
          <h4 class="mb-1">BULLETIN SCOLAIRE</h4>
          <p class="text-muted">{{ selectedBulletin.trimestre }}{{ getTrimestreOrdinal(selectedBulletin.trimestre) }} Trimestre - {{ selectedBulletin.annee_scolaire }}</p>
        </div>

        <!-- Informations apprenant -->
        <div class="row mb-4">
          <div class="col-md-6">
            <div class="card bg-light">
              <div class="card-body">
                <h6 class="card-title">Informations de l'apprenant</h6>
                <p class="mb-1"><strong>Nom :</strong> {{ selectedBulletin.apprenant.nom }}</p>
                <p class="mb-1"><strong>Prénom :</strong> {{ selectedBulletin.apprenant.prenom }}</p>
                <p class="mb-1"><strong>Classe :</strong> {{ selectedBulletin.classe.nom }}</p>
                <p class="mb-0"><strong>Année scolaire :</strong> {{ selectedBulletin.annee_scolaire }}</p>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="card bg-light">
              <div class="card-body">
                <h6 class="card-title">Résultats</h6>
                <p class="mb-1"><strong>Moyenne générale :</strong> <span class="fw-bold text-primary">{{ selectedBulletin.moyenne.toFixed(2) }}/20</span></p>
                <p class="mb-1"><strong>Rang :</strong> {{ selectedBulletin.rang }}/{{ selectedBulletin.classe.effectif }}</p>
                <p class="mb-0"><strong>Statut :</strong> <span :class="getStatutColor(selectedBulletin.moyenne)">{{ getStatut(selectedBulletin.moyenne) }}</span></p>
              </div>
            </div>
          </div>
        </div>

        <!-- Notes par matière -->
        <div class="card">
          <div class="card-header">
            <h6 class="mb-0">Détail des moyennes par matière</h6>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th>Matière</th>
                    <th>Coefficient</th>
                    <th>Moyenne/20</th>
                    <th>Moyenne coefficiée</th>
                    <th>Appréciation</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="note in selectedBulletin.notes" :key="note.matiere">
                    <td>{{ note.matiere }}</td>
                    <td>{{ note.coefficient }}</td>
                    <td>
                      <span class="fw-bold" :class="getMoyenneColor(note.note)">
                        {{ note.note.toFixed(2) }}
                      </span>
                    </td>
                    <td>{{ (note.note * note.coefficient).toFixed(2) }}</td>
                    <td>
                      <small class="text-muted">{{ note.appreciation }}</small>
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr class="table-active">
                    <th>Total</th>
                    <th>{{ selectedBulletin.totalCoefficients }}</th>
                    <th colspan="2" class="fw-bold text-primary">
                      {{ selectedBulletin.moyenne.toFixed(2) }}/20
                    </th>
                    <th></th>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        <!-- Appréciation générale -->
        <div class="card mt-3">
          <div class="card-header">
            <h6 class="mb-0">Appréciation générale</h6>
          </div>
          <div class="card-body">
            <p class="mb-0">{{ selectedBulletin.appreciationGenerale }}</p>
          </div>
        </div>
      </div>
    </b-modal>

    <!-- Modal de génération de bulletins -->
    <b-modal
      v-model="showGenerateModal"
      title="Générer des bulletins"
      @hidden="resetGenerateForm"
      :ok-disabled="generating"
      :ok-title="generating ? 'Génération...' : 'Générer'"
      :cancel-title="'Annuler'"
      @ok="handleGenerate"
    >
      <form>
        <div class="mb-3">
          <label class="form-label">Année scolaire</label>
          <select v-model="generateForm.annee" class="form-select" required>
            <option value="">Sélectionner une année</option>
            <option value="2023-2024">2023-2024</option>
            <option value="2024-2025">2024-2025</option>
          </select>
        </div>
        <div class="mb-3">
          <label class="form-label">Trimestre</label>
          <select v-model="generateForm.trimestre" class="form-select" required>
            <option value="">Sélectionner un trimestre</option>
            <option value="1">1er Trimestre</option>
            <option value="2">2ème Trimestre</option>
            <option value="3">3ème Trimestre</option>
          </select>
        </div>
        <div class="mb-3">
          <label class="form-label">Classe</label>
          <select v-model="generateForm.classe" class="form-select" required>
            <option value="">Sélectionner une classe</option>
            <option value="6A">6ème A</option>
            <option value="6B">6ème B</option>
            <option value="5A">5ème A</option>
            <option value="4A">4ème A</option>
            <option value="3A">3ème A</option>
          </select>
        </div>
      </form>
    </b-modal>
  </VerticalLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
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
  generate: ['bulletin:generate'],
  update: ['bulletin:update'],
  delete: ['bulletin:delete'],
  export: ['bulletin:export'],
  download: ['bulletin:download']
};

const permissionStore = usePermissionStore();
const canGenerate = computed(() => permissionStore.checkPermissions(permissions.generate));
const canUpdate = computed(() => permissionStore.checkPermissions(permissions.update));
const canDelete = computed(() => permissionStore.checkPermissions(permissions.delete));
const canExport = computed(() => permissionStore.checkPermissions(permissions.export));
const canDownload = computed(() => permissionStore.checkPermissions(permissions.download));

// État
const bulletins = ref([]);
const selectedBulletins = ref([]);
const selectedBulletin = ref(null);
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = ref(10);
const showPreviewModal = ref(false);
const showGenerateModal = ref(false);
const generating = ref(false);

// Filtres
const filters = ref({
  annee: '',
  trimestre: '',
  classe: ''
});

// Formulaire de génération
const generateForm = ref({
  annee: '',
  trimestre: '',
  classe: ''
});

// Données mockées
const mockBulletins = [
  {
    id: 1,
    apprenant: { nom: 'KOUASSI', prenom: 'Jean', email: 'jean.kouassi@email.com' },
    classe: { nom: '6ème A', effectif: 25 },
    trimestre: 1,
    annee_scolaire: '2024-2025',
    moyenne: 15.75,
    rang: 3,
    statut: 'Validé',
    totalCoefficients: 22,
    appreciationGenerale: 'Très bon trimestre. Continuez vos efforts.',
    notes: [
      { matiere: 'Mathématiques', coefficient: 4, note: 16.5, appreciation: 'Très bien' },
      { matiere: 'Français', coefficient: 4, note: 14.0, appreciation: 'Bien' },
      { matiere: 'Anglais', coefficient: 3, note: 17.0, appreciation: 'Excellent' },
      { matiere: 'Histoire-Géo', coefficient: 3, note: 15.5, appreciation: 'Très bien' },
      { matiere: 'Sciences', coefficient: 3, note: 16.0, appreciation: 'Très bien' },
      { matiere: 'Sport', coefficient: 2, note: 18.0, appreciation: 'Excellent' },
      { matiere: 'Arts', coefficient: 2, note: 14.5, appreciation: 'Bien' },
      { matiere: 'Musique', coefficient: 1, note: 15.0, appreciation: 'Bien' }
    ]
  },
  {
    id: 2,
    apprenant: { nom: 'DIABATE', prenom: 'Marie', email: 'marie.diabate@email.com' },
    classe: { nom: '6ème A', effectif: 25 },
    trimestre: 1,
    annee_scolaire: '2024-2025',
    moyenne: 12.45,
    rang: 8,
    statut: 'Validé',
    totalCoefficients: 22,
    appreciationGenerale: 'Résultats satisfaisants. Peut mieux faire en mathématiques.',
    notes: [
      { matiere: 'Mathématiques', coefficient: 4, note: 10.5, appreciation: 'Insuffisant' },
      { matiere: 'Français', coefficient: 4, note: 13.5, appreciation: 'Assez bien' },
      { matiere: 'Anglais', coefficient: 3, note: 14.0, appreciation: 'Bien' },
      { matiere: 'Histoire-Géo', coefficient: 3, note: 12.0, appreciation: 'Assez bien' },
      { matiere: 'Sciences', coefficient: 3, note: 11.5, appreciation: 'Assez bien' },
      { matiere: 'Sport', coefficient: 2, note: 16.0, appreciation: 'Très bien' },
      { matiere: 'Arts', coefficient: 2, note: 13.0, appreciation: 'Assez bien' },
      { matiere: 'Musique', coefficient: 1, note: 14.0, appreciation: 'Bien' }
    ]
  },
  {
    id: 3,
    apprenant: { nom: 'TRAORE', prenom: 'Amadou', email: 'amadou.traore@email.com' },
    classe: { nom: '5ème A', effectif: 28 },
    trimestre: 2,
    annee_scolaire: '2024-2025',
    moyenne: 18.25,
    rang: 1,
    statut: 'Validé',
    totalCoefficients: 24,
    appreciationGenerale: 'Excellent trimestre ! Félicitations pour ces résultats remarquables.',
    notes: [
      { matiere: 'Mathématiques', coefficient: 4, note: 19.0, appreciation: 'Excellent' },
      { matiere: 'Français', coefficient: 4, note: 17.5, appreciation: 'Très bien' },
      { matiere: 'Anglais', coefficient: 3, note: 18.5, appreciation: 'Excellent' },
      { matiere: 'Histoire-Géo', coefficient: 3, note: 18.0, appreciation: 'Excellent' },
      { matiere: 'Sciences', coefficient: 4, note: 19.5, appreciation: 'Excellent' },
      { matiere: 'Sport', coefficient: 2, note: 17.0, appreciation: 'Très bien' },
      { matiere: 'Arts', coefficient: 2, note: 16.5, appreciation: 'Très bien' },
      { matiere: 'Musique', coefficient: 2, note: 18.0, appreciation: 'Excellent' }
    ]
  }
];

// Initialisation des données
onMounted(() => {
  bulletins.value = mockBulletins;
});

// Computed
const filteredBulletins = computed(() => {
  let filtered = bulletins.value;
  
  if (filters.value.annee) {
    filtered = filtered.filter(b => b.annee_scolaire === filters.value.annee);
  }
  
  if (filters.value.trimestre) {
    filtered = filtered.filter(b => b.trimestre.toString() === filters.value.trimestre);
  }
  
  if (filters.value.classe) {
    filtered = filtered.filter(b => b.classe.nom === filters.value.classe);
  }
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(b =>
      b.apprenant.nom.toLowerCase().includes(query) ||
      b.apprenant.prenom.toLowerCase().includes(query) ||
      b.apprenant.email.toLowerCase().includes(query)
    );
  }
  
  return filtered;
});

const paginatedBulletins = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredBulletins.value.slice(start, end);
});

const totalItems = computed(() => filteredBulletins.value.length);

const isAllSelected = computed(() => {
  return paginatedBulletins.value.length > 0 && 
         paginatedBulletins.value.every(b => selectedBulletins.value.includes(b.id));
});

const bulletinsGeneres = computed(() => {
  return bulletins.value.filter(b => b.statut === 'Validé').length;
});

const moyenneGenerale = computed(() => {
  if (filteredBulletins.value.length === 0) return 0;
  const total = filteredBulletins.value.reduce((sum, b) => sum + b.moyenne, 0);
  return total / filteredBulletins.value.length;
});

const tauxReussite = computed(() => {
  if (filteredBulletins.value.length === 0) return 0;
  const reussis = filteredBulletins.value.filter(b => b.moyenne >= 10).length;
  return Math.round((reussis / filteredBulletins.value.length) * 100);
});

// Méthodes utilitaires
const getTrimestreOrdinal = (trimestre: number) => {
  const ordinals = { 1: 'er', 2: 'ème', 3: 'ème' };
  return ordinals[trimestre] || 'ème';
};

const getTrimestreBadge = (trimestre: number) => {
  const badges = { 1: 'bg-primary', 2: 'bg-warning', 3: 'bg-success' };
  return badges[trimestre] || 'bg-secondary';
};

const getMoyenneColor = (moyenne: number) => {
  if (moyenne >= 16) return 'text-success';
  if (moyenne >= 14) return 'text-primary';
  if (moyenne >= 10) return 'text-warning';
  return 'text-danger';
};

const getStatut = (moyenne: number) => {
  if (moyenne >= 16) return 'Très bien';
  if (moyenne >= 14) return 'Bien';
  if (moyenne >= 12) return 'Assez bien';
  if (moyenne >= 10) return 'Passable';
  return 'Insuffisant';
};

const getStatutBadge = (moyenne: number) => {
  if (moyenne >= 16) return 'bg-success';
  if (moyenne >= 14) return 'bg-primary';
  if (moyenne >= 12) return 'bg-info';
  if (moyenne >= 10) return 'bg-warning';
  return 'bg-danger';
};

const getStatutColor = (moyenne: number) => {
  if (moyenne >= 16) return 'text-success fw-bold';
  if (moyenne >= 14) return 'text-primary fw-bold';
  if (moyenne >= 12) return 'text-info fw-bold';
  if (moyenne >= 10) return 'text-warning fw-bold';
  return 'text-danger fw-bold';
};

// Actions
const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedBulletins.value = selectedBulletins.value.filter(
      id => !paginatedBulletins.value.some(b => b.id === id)
    );
  } else {
    const currentIds = paginatedBulletins.value.map(b => b.id);
    selectedBulletins.value = [...new Set([...selectedBulletins.value, ...currentIds])];
  }
};

const previewBulletin = (bulletin: any) => {
  selectedBulletin.value = bulletin;
  showPreviewModal.value = true;
};

const downloadBulletin = (bulletin: any) => {
  showSuccessMessage(`Téléchargement du bulletin de ${bulletin.apprenant.nom} ${bulletin.apprenant.prenom}`);
};

const exportSelected = () => {
  showSuccessMessage(`Téléchargement de ${selectedBulletins.value.length} bulletins sélectionnés`);
};

const editBulletin = (bulletin: any) => {
  showSuccessMessage(`Édition du bulletin de ${bulletin.apprenant.nom} ${bulletin.apprenant.prenom}`);
};

const deleteBulletin = (bulletin: any) => {
  if (confirm(`Supprimer le bulletin de ${bulletin.apprenant.nom} ${bulletin.apprenant.prenom} ?`)) {
    bulletins.value = bulletins.value.filter(b => b.id !== bulletin.id);
    showSuccessMessage('Bulletin supprimé avec succès');
  }
};

const generateBulletins = () => {
  showGenerateModal.value = true;
};

const handleGenerate = async () => {
  generating.value = true;
  try {
    // Validation des champs requis
    if (!generateForm.value.annee || !generateForm.value.trimestre || !generateForm.value.classe) {
      showErrorMessage('Veuillez remplir tous les champs obligatoires');
      generating.value = false;
      return;
    }

    // Simulation de génération des bulletins
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Génération de nouveaux bulletins mockés pour la classe sélectionnée
    const nouveauxBulletins = generateMockBulletins(
      generateForm.value.classe,
      parseInt(generateForm.value.trimestre),
      generateForm.value.annee
    );
    
    // Ajout des nouveaux bulletins à la liste existante
    bulletins.value = [...bulletins.value, ...nouveauxBulletins];
    
    showSuccessMessage(`${nouveauxBulletins.length} bulletins générés pour la classe ${generateForm.value.classe}`);
    showGenerateModal.value = false;
    resetGenerateForm();
  } catch (error) {
    console.error('Erreur lors de la génération:', error);
    showErrorMessage('Erreur lors de la génération des bulletins');
  } finally {
    generating.value = false;
  }
};

const resetGenerateForm = () => {
  generateForm.value = {
    annee: '',
    trimestre: '',
    classe: ''
  };
};

// Fonction pour générer des bulletins mockés
const generateMockBulletins = (classe, trimestre, annee) => {
  const prenoms = ['Koffi', 'Adjoua', 'Yao', 'Akissi', 'Kouame', 'Aya', 'Kouassi', 'Affoue', 'N\'Guessan', 'Mariam'];
  const noms = ['KOUAME', 'DIABATE', 'TRAORE', 'OUATTARA', 'KONE', 'YAO', 'KOUASSI', 'BAMBA', 'DIOUF', 'SANGARE'];
  const matieres = [
    { nom: 'Mathématiques', coefficient: 4 },
    { nom: 'Français', coefficient: 4 },
    { nom: 'Anglais', coefficient: 3 },
    { nom: 'Histoire-Géo', coefficient: 3 },
    { nom: 'Sciences', coefficient: 3 },
    { nom: 'Sport', coefficient: 2 },
    { nom: 'Arts', coefficient: 2 },
    { nom: 'Musique', coefficient: 1 }
  ];

  const effectifs = {
    '6A': 25, '6B': 23, '5A': 28, '4A': 26, '3A': 24
  };

  const nombreEleves = Math.floor(Math.random() * 5) + 15; // Entre 15 et 20 élèves
  const nouveauxBulletins = [];

  for (let i = 0; i < nombreEleves; i++) {
    const prenom = prenoms[Math.floor(Math.random() * prenoms.length)];
    const nom = noms[Math.floor(Math.random() * noms.length)];
    const email = `${prenom.toLowerCase()}.${nom.toLowerCase()}@email.com`;

    // Génération des notes par matière
    const notes = matieres.map(matiere => {
      const note = Math.random() * 20; // Note entre 0 et 20
      let appreciation = '';
      
      if (note >= 16) appreciation = 'Excellent';
      else if (note >= 14) appreciation = 'Très bien';
      else if (note >= 12) appreciation = 'Bien';
      else if (note >= 10) appreciation = 'Assez bien';
      else appreciation = 'Insuffisant';

      return {
        matiere: matiere.nom,
        coefficient: matiere.coefficient,
        note: parseFloat(note.toFixed(2)),
        appreciation: appreciation
      };
    });

    // Calcul de la moyenne générale
    const totalPoints = notes.reduce((sum, note) => sum + (note.note * note.coefficient), 0);
    const totalCoefficients = notes.reduce((sum, note) => sum + note.coefficient, 0);
    const moyenne = totalPoints / totalCoefficients;

    // Génération de l'appréciation générale
    let appreciationGenerale = '';
    if (moyenne >= 16) {
      appreciationGenerale = 'Excellent trimestre ! Félicitations pour ces résultats remarquables.';
    } else if (moyenne >= 14) {
      appreciationGenerale = 'Très bon trimestre. Continuez vos efforts.';
    } else if (moyenne >= 12) {
      appreciationGenerale = 'Bon trimestre dans l\'ensemble. Quelques améliorations à apporter.';
    } else if (moyenne >= 10) {
      appreciationGenerale = 'Résultats satisfaisants. Peut mieux faire dans certaines matières.';
    } else {
      appreciationGenerale = 'Résultats insuffisants. Un effort supplémentaire est nécessaire.';
    }

    const bulletin = {
      id: Date.now() + i, // ID unique basé sur le timestamp
      apprenant: {
        nom: nom,
        prenom: prenom,
        email: email
      },
      classe: {
        nom: classe,
        effectif: effectifs[classe] || 25
      },
      trimestre: trimestre,
      annee_scolaire: annee,
      moyenne: parseFloat(moyenne.toFixed(2)),
      rang: i + 1, // Sera recalculé plus tard
      statut: 'Validé',
      totalCoefficients: totalCoefficients,
      appreciationGenerale: appreciationGenerale,
      notes: notes
    };

    nouveauxBulletins.push(bulletin);
  }

  // Tri par moyenne décroissante et attribution des rangs
  nouveauxBulletins.sort((a, b) => b.moyenne - a.moyenne);
  nouveauxBulletins.forEach((bulletin, index) => {
    bulletin.rang = index + 1;
  });

  return nouveauxBulletins;
};

// Fonction utilitaire pour recalculer les rangs après génération
const recalculateRangs = () => {
  // Grouper par classe et trimestre
  const groupes = {};
  bulletins.value.forEach(bulletin => {
    const key = `${bulletin.classe.nom}-${bulletin.trimestre}-${bulletin.annee_scolaire}`;
    if (!groupes[key]) {
      groupes[key] = [];
    }
    groupes[key].push(bulletin);
  });

  // Recalculer les rangs pour chaque groupe
  Object.values(groupes).forEach(groupe => {
    groupe.sort((a, b) => b.moyenne - a.moyenne);
    groupe.forEach((bulletin, index) => {
      bulletin.rang = index + 1;
    });
  });
};

</script>