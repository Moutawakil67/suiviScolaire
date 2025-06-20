<template>
  <VerticalLayout>
    <div class="container-fluid">
      <PageTitle title="Bulletins de mes enfants" />
      
      <!-- Sélection de l'enfant -->
      <div class="row g-3 mb-4">
        <div class="col-12 col-md-4">
          <label class="form-label">Sélectionner un enfant</label>
          <select v-model="selectedEnfant" class="form-select" @change="onEnfantChange">
            <option value="">Tous mes enfants</option>
            <option v-for="enfant in enfants" :key="enfant.id" :value="enfant.id">
              {{ enfant.nom }} {{ enfant.prenom }} - {{ enfant.classe }}
            </option>
          </select>
        </div>
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
        <div class="col-12 col-md-2 d-flex align-items-end">
          <button
            v-if="selectedBulletins.length > 0"
            class="btn btn-primary w-100"
            @click="downloadSelected"
          >
            <i class="bx bx-download me-1"></i> 
            Télécharger ({{ selectedBulletins.length }})
          </button>
        </div>
      </div>

      <!-- Informations sur l'enfant sélectionné -->
      <div v-if="selectedEnfantInfo" class="card mb-4">
        <div class="card-body">
          <div class="row align-items-center">
            <div class="col-md-2">
              <div class="avatar-lg mx-auto">
                <div class="avatar-title bg-primary-subtle text-primary rounded-circle fs-2">
                  {{ selectedEnfantInfo.nom.charAt(0) }}{{ selectedEnfantInfo.prenom.charAt(0) }}
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <h5 class="mb-1">{{ selectedEnfantInfo.nom }} {{ selectedEnfantInfo.prenom }}</h5>
              <p class="text-muted mb-1">Classe : {{ selectedEnfantInfo.classe }}</p>
              <p class="text-muted mb-0">{{ selectedEnfantInfo.email }}</p>
            </div>
            <div class="col-md-6">
              <div class="row g-3">
                <div class="col-4">
                  <div class="text-center">
                    <h4 class="text-primary mb-0">{{ enfantStats.bulletins }}</h4>
                    <small class="text-muted">Bulletins</small>
                  </div>
                </div>
                <div class="col-4">
                  <div class="text-center">
                    <h4 class="mb-0" :class="getMoyenneColor(enfantStats.moyenne)">{{ enfantStats.moyenne.toFixed(2) }}</h4>
                    <small class="text-muted">Moyenne</small>
                  </div>
                </div>
                <div class="col-4">
                  <div class="text-center">
                    <span class="badge fs-6" :class="getStatutBadge(enfantStats.moyenne)">
                      {{ getStatut(enfantStats.moyenne) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Statistiques globales -->
      <div class="row g-3 mb-4">
        <div class="col-md-3">
          <div class="card border-primary">
            <div class="card-body text-center">
              <h3 class="text-primary mb-1">{{ filteredBulletins.length }}</h3>
              <p class="text-muted mb-0">Bulletins disponibles</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-success">
            <div class="card-body text-center">
              <h3 class="text-success mb-1">{{ enfants.length }}</h3>
              <p class="text-muted mb-0">Enfants inscrits</p>
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
              <h3 class="text-info mb-1">{{ dernierTrimestre }}</h3>
              <p class="text-muted mb-0">Dernier trimestre</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Liste des bulletins -->
      <div class="card">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="card-title mb-0">
              {{ selectedEnfant ? `Bulletins de ${selectedEnfantInfo?.prenom}` : 'Bulletins de tous mes enfants' }}
            </h5>
            <div class="form-check" v-show="paginatedBulletins.length > 0">
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
                      v-show="paginatedBulletins.length > 0"
                    >
                  </th>
                  <th>Enfant</th>
                  <th>Classe</th>
                  <th>Trimestre</th>
                  <th>Année</th>
                  <th>Moyenne</th>
                  <th>Rang</th>
                  <th>Mention</th>
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
                  <td>
                    <span class="badge bg-info">{{ bulletin.classe.nom }}</span>
                  </td>
                  <td>
                    <span class="badge" :class="getTrimestreBadge(bulletin.trimestre)">
                      {{ bulletin.trimestre }}{{ getTrimestreOrdinal(bulletin.trimestre) }} T.
                    </span>
                  </td>
                  <td>{{ bulletin.annee_scolaire }}</td>
                  <td>
                    <span class="fw-bold fs-6" :class="getMoyenneColor(bulletin.moyenne)">
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
                        title="Consulter le bulletin"
                      >
                        <i class="bx bx-show"></i>
                      </button>
                      <button
                        class="btn btn-sm btn-soft-primary"
                        @click="downloadBulletin(bulletin)"
                        title="Télécharger le bulletin"
                      >
                        <i class="bx bx-download"></i>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="filteredBulletins.length === 0">
                  <td colspan="9" class="text-center py-5">
                    <div class="d-flex flex-column align-items-center">
                      <i class="bx bx-file display-1 text-muted mb-3"></i>
                      <h5 class="text-muted">Aucun bulletin disponible</h5>
                      <p class="text-muted mb-0">
                        {{ selectedEnfant ? 'Aucun bulletin trouvé pour cet enfant avec les critères sélectionnés.' : 'Aucun bulletin disponible pour vos enfants.' }}
                      </p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <TablePagination
            v-if="totalItems > itemsPerPage"
            v-model:currentPage="currentPage"
            :total-items="totalItems"
            :per-page="itemsPerPage"
          />
        </div>
      </div>
    </div>

    <!-- Modal de consultation du bulletin -->
    <div class="modal fade" id="bulletinModal" tabindex="-1" v-if="selectedBulletin">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bx bx-file-blank me-2"></i>
              Bulletin de {{ selectedBulletin.apprenant.prenom }} {{ selectedBulletin.apprenant.nom }}
            </h5>
            <button type="button" class="btn-close" @click="closeBulletinModal"></button>
          </div>
          <div class="modal-body">
            <div class="bulletin-preview">
              <!-- En-tête du bulletin -->
              <div class="text-center mb-4 border-bottom pb-3">
                <h3 class="text-primary mb-2">BULLETIN SCOLAIRE</h3>
                <h5 class="text-muted">{{ selectedBulletin.trimestre }}{{ getTrimestreOrdinal(selectedBulletin.trimestre) }} Trimestre - {{ selectedBulletin.annee_scolaire }}</h5>
              </div>

              <!-- Informations de l'élève -->
              <div class="row mb-4">
                <div class="col-md-6">
                  <div class="card bg-light">
                    <div class="card-body">
                      <h6 class="card-title text-primary">
                        <i class="bx bx-user me-2"></i>Informations de l'élève
                      </h6>
                      <table class="table table-borderless table-sm mb-0">
                        <tr>
                          <td class="fw-bold">Nom :</td>
                          <td>{{ selectedBulletin.apprenant.nom }}</td>
                        </tr>
                        <tr>
                          <td class="fw-bold">Prénom :</td>
                          <td>{{ selectedBulletin.apprenant.prenom }}</td>
                        </tr>
                        <tr>
                          <td class="fw-bold">Classe :</td>
                          <td>{{ selectedBulletin.classe.nom }}</td>
                        </tr>
                        <tr>
                          <td class="fw-bold">Année scolaire :</td>
                          <td>{{ selectedBulletin.annee_scolaire }}</td>
                        </tr>
                      </table>
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="card bg-light">
                    <div class="card-body">
                      <h6 class="card-title text-success">
                        <i class="bx bx-trophy me-2"></i>Résultats du trimestre
                      </h6>
                      <table class="table table-borderless table-sm mb-0">
                        <tr>
                          <td class="fw-bold">Moyenne générale :</td>
                          <td>
                            <span class="fw-bold fs-5" :class="getMoyenneColor(selectedBulletin.moyenne)">
                              {{ selectedBulletin.moyenne.toFixed(2) }}/20
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td class="fw-bold">Rang dans la classe :</td>
                          <td>
                            <span class="badge bg-secondary fs-6">
                              {{ selectedBulletin.rang }}/{{ selectedBulletin.classe.effectif }}
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td class="fw-bold">Mention :</td>
                          <td>
                            <span class="badge fs-6" :class="getStatutBadge(selectedBulletin.moyenne)">
                              {{ getStatut(selectedBulletin.moyenne) }}
                            </span>
                          </td>
                        </tr>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Détail des notes par matière -->
              <div class="card mb-4">
                <div class="card-header bg-primary text-white">
                  <h6 class="mb-0">
                    <i class="bx bx-list-ul me-2"></i>Détail des moyennes par matière
                  </h6>
                </div>
                <div class="card-body p-0">
                  <div class="table-responsive">
                    <table class="table table-striped table-hover mb-0">
                      <thead class="table-light">
                        <tr>
                          <th>Matière</th>
                          <th class="text-center">Coefficient</th>
                          <th class="text-center">Moyenne/20</th>
                          <th class="text-center">Points</th>
                          <th>Appréciation</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="note in selectedBulletin.notes" :key="note.matiere">
                          <td class="fw-bold">{{ note.matiere }}</td>
                          <td class="text-center">{{ note.coefficient }}</td>
                          <td class="text-center">
                            <span class="fw-bold fs-6" :class="getMoyenneColor(note.note)">
                              {{ note.note.toFixed(2) }}
                            </span>
                          </td>
                          <td class="text-center text-muted">
                            {{ (note.note * note.coefficient).toFixed(2) }}
                          </td>
                          <td>
                            <span class="badge" :class="getAppreciationBadge(note.note)">
                              {{ note.appreciation }}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                      <tfoot class="table-primary">
                        <tr>
                          <th>TOTAL GÉNÉRAL</th>
                          <th class="text-center">{{ selectedBulletin.totalCoefficients }}</th>
                          <th class="text-center">
                            <span class="fw-bold fs-5 text-primary">
                              {{ selectedBulletin.moyenne.toFixed(2) }}/20
                            </span>
                          </th>
                          <th class="text-center">
                            {{ (selectedBulletin.moyenne * selectedBulletin.totalCoefficients).toFixed(2) }}
                          </th>
                          <th></th>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>

              <!-- Appréciation générale -->
              <div class="card">
                <div class="card-header bg-info text-white">
                  <h6 class="mb-0">
                    <i class="bx bx-message-square-detail me-2"></i>Appréciation générale du conseil de classe
                  </h6>
                </div>
                <div class="card-body">
                  <p class="mb-0 fst-italic">{{ selectedBulletin.appreciationGenerale }}</p>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeBulletinModal">
              <i class="bx bx-x me-1"></i>Fermer
            </button>
            <button type="button" class="btn btn-primary" @click="downloadBulletin(selectedBulletin)">
              <i class="bx bx-download me-1"></i>Télécharger ce bulletin
            </button>
          </div>
        </div>
      </div>
    </div>
  </VerticalLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import VerticalLayout from '@/layouts/VerticalLayout.vue';
import PageTitle from '@/components/PageTitle.vue';
import TablePagination from '@/components/TablePagination.vue';
import { showSuccessMessage, showErrorMessage } from '@/helpers/notification';

// État
const bulletins = ref([]);
const enfants = ref([]);
const selectedEnfant = ref('');
const selectedBulletins = ref([]);
const selectedBulletin = ref(null);
const currentPage = ref(1);
const itemsPerPage = ref(10);

// Filtres
const filters = ref({
  annee: '',
  trimestre: ''
});

// Données mockées pour un parent
const mockEnfants = [
  {
    id: 1,
    nom: 'KOUASSI',
    prenom: 'Jean',
    email: 'jean.kouassi@email.com',
    classe: '6ème A',
    dateNaissance: '2012-05-15'
  },
  {
    id: 2,
    nom: 'KOUASSI',
    prenom: 'Marie',
    email: 'marie.kouassi@email.com',
    classe: '4ème A',
    dateNaissance: '2010-08-22'
  }
];

const mockBulletins = [
  {
    id: 1,
    apprenant: { 
      id: 1,
      nom: 'KOUASSI', 
      prenom: 'Jean', 
      email: 'jean.kouassi@email.com' 
    },
    classe: { nom: '6ème A', effectif: 25 },
    trimestre: 1,
    annee_scolaire: '2024-2025',
    moyenne: 15.75,
    rang: 3,
    statut: 'Validé',
    totalCoefficients: 22,
    appreciationGenerale: 'Très bon trimestre. Jean montre de belles capacités et une progression constante. Continuez vos efforts, particulièrement en mathématiques où vous avez encore des marges de progrès.',
    notes: [
      { matiere: 'Mathématiques', coefficient: 4, note: 16.5, appreciation: 'Très bien' },
      { matiere: 'Français', coefficient: 4, note: 14.0, appreciation: 'Bien' },
      { matiere: 'Anglais', coefficient: 3, note: 17.0, appreciation: 'Excellent' },
      { matiere: 'Histoire-Géographie', coefficient: 3, note: 15.5, appreciation: 'Très bien' },
      { matiere: 'Sciences', coefficient: 3, note: 16.0, appreciation: 'Très bien' },
      { matiere: 'Sport', coefficient: 2, note: 18.0, appreciation: 'Excellent' },
      { matiere: 'Arts plastiques', coefficient: 2, note: 14.5, appreciation: 'Bien' },
      { matiere: 'Musique', coefficient: 1, note: 15.0, appreciation: 'Bien' }
    ]
  },
  {
    id: 2,
    apprenant: { 
      id: 1,
      nom: 'KOUASSI', 
      prenom: 'Jean', 
      email: 'jean.kouassi@email.com' 
    },
    classe: { nom: '6ème A', effectif: 25 },
    trimestre: 2,
    annee_scolaire: '2024-2025',
    moyenne: 16.25,
    rang: 2,
    statut: 'Validé',
    totalCoefficients: 22,
    appreciationGenerale: 'Excellent deuxième trimestre ! Jean a su maintenir ses efforts et améliorer ses résultats. Félicitations pour cette progression remarquable.',
    notes: [
      { matiere: 'Mathématiques', coefficient: 4, note: 17.0, appreciation: 'Très bien' },
      { matiere: 'Français', coefficient: 4, note: 15.5, appreciation: 'Très bien' },
      { matiere: 'Anglais', coefficient: 3, note: 17.5, appreciation: 'Excellent' },
      { matiere: 'Histoire-Géographie', coefficient: 3, note: 16.0, appreciation: 'Très bien' },
      { matiere: 'Sciences', coefficient: 3, note: 16.5, appreciation: 'Très bien' },
      { matiere: 'Sport', coefficient: 2, note: 18.0, appreciation: 'Excellent' },
      { matiere: 'Arts plastiques', coefficient: 2, note: 15.0, appreciation: 'Très bien' },
      { matiere: 'Musique', coefficient: 1, note: 16.0, appreciation: 'Très bien' }
    ]
  },
  {
    id: 3,
    apprenant: { 
      id: 2,
      nom: 'KOUASSI', 
      prenom: 'Marie', 
      email: 'marie.kouassi@email.com' 
    },
    classe: { nom: '4ème A', effectif: 28 },
    trimestre: 1,
    annee_scolaire: '2024-2025',
    moyenne: 18.25,
    rang: 1,
    statut: 'Validé',
    totalCoefficients: 26,
    appreciationGenerale: 'Excellent trimestre ! Marie fait preuve d\'une grande maturité et d\'un sérieux exemplaire. Ses résultats sont remarquables dans toutes les matières. Félicitations !',
    notes: [
      { matiere: 'Mathématiques', coefficient: 4, note: 19.0, appreciation: 'Excellent' },
      { matiere: 'Français', coefficient: 4, note: 17.5, appreciation: 'Très bien' },
      { matiere: 'Anglais', coefficient: 3, note: 18.5, appreciation: 'Excellent' },
      { matiere: 'Espagnol', coefficient: 3, note: 17.0, appreciation: 'Très bien' },
      { matiere: 'Histoire-Géographie', coefficient: 3, note: 18.0, appreciation: 'Excellent' },
      { matiere: 'Sciences Physiques', coefficient: 3, note: 19.5, appreciation: 'Excellent' },
      { matiere: 'SVT', coefficient: 3, note: 18.5, appreciation: 'Excellent' },
      { matiere: 'Sport', coefficient: 2, note: 17.0, appreciation: 'Très bien' },
      { matiere: 'Arts plastiques', coefficient: 1, note: 16.5, appreciation: 'Très bien' }
    ]
  },
  {
    id: 4,
    apprenant: { 
      id: 2,
      nom: 'KOUASSI', 
      prenom: 'Marie', 
      email: 'marie.kouassi@email.com' 
    },
    classe: { nom: '4ème A', effectif: 28 },
    trimestre: 2,
    annee_scolaire: '2024-2025',
    moyenne: 17.85,
    rang: 1,
    statut: 'Validé',
    totalCoefficients: 26,
    appreciationGenerale: 'Marie maintient un excellent niveau. Son travail rigoureux et sa participation active en classe sont exemplaires. Continuez sur cette voie !',
    notes: [
      { matiere: 'Mathématiques', coefficient: 4, note: 18.5, appreciation: 'Excellent' },
      { matiere: 'Français', coefficient: 4, note: 17.0, appreciation: 'Très bien' },
      { matiere: 'Anglais', coefficient: 3, note: 18.0, appreciation: 'Excellent' },
      { matiere: 'Espagnol', coefficient: 3, note: 17.5, appreciation: 'Très bien' },
      { matiere: 'Histoire-Géographie', coefficient: 3, note: 18.5, appreciation: 'Excellent' },
      { matiere: 'Sciences Physiques', coefficient: 3, note: 19.0, appreciation: 'Excellent' },
      { matiere: 'SVT', coefficient: 3, note: 18.0, appreciation: 'Excellent' },
      { matiere: 'Sport', coefficient: 2, note: 16.5, appreciation: 'Très bien' },
      { matiere: 'Arts plastiques', coefficient: 1, note: 15.5, appreciation: 'Bien' }
    ]
  }
];

// Initialisation
onMounted(() => {
  enfants.value = mockEnfants;
  bulletins.value = mockBulletins;
});

// Computed properties
const filteredBulletins = computed(() => {
  let filtered = bulletins.value;
  
  // Filtrer par enfant sélectionné
  if (selectedEnfant.value) {
    filtered = filtered.filter(b => b.apprenant.id.toString() === selectedEnfant.value);
  }
  
  // Filtrer par année
  if (filters.value.annee) {
    filtered = filtered.filter(b => b.annee_scolaire === filters.value.annee);
  }
  
  // Filtrer par trimestre
  if (filters.value.trimestre) {
    filtered = filtered.filter(b => b.trimestre.toString() === filters.value.trimestre);
  }
  
  // Trier par année décroissante, puis par trimestre décroissant
  return filtered.sort((a, b) => {
    if (a.annee_scolaire !== b.annee_scolaire) {
      return b.annee_scolaire.localeCompare(a.annee_scolaire);
    }
    return b.trimestre - a.trimestre;
  });
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

const selectedEnfantInfo = computed(() => {
  if (!selectedEnfant.value) return null;
  return enfants.value.find(e => e.id.toString() === selectedEnfant.value);
});

const enfantStats = computed(() => {
  if (!selectedEnfant.value) return { bulletins: 0, moyenne: 0 };
  
  const bulletinsEnfant = bulletins.value.filter(b => b.apprenant.id.toString() === selectedEnfant.value);
  const moyenneEnfant = bulletinsEnfant.length > 0 
    ? bulletinsEnfant.reduce((sum, b) => sum + b.moyenne, 0) / bulletinsEnfant.length
    : 0;
  
  return {
    bulletins: bulletinsEnfant.length,
    moyenne: moyenneEnfant
  };
});

const moyenneGenerale = computed(() => {
  if (bulletins.value.length === 0) return 0;
  return bulletins.value.reduce((sum, b) => sum + b.moyenne, 0) / bulletins.value.length;
});

const dernierTrimestre = computed(() => {
  if (bulletins.value.length === 0) return '-';
  const dernierBulletin = bulletins.value.reduce((latest, current) => {
    if (current.annee_scolaire > latest.annee_scolaire) return current;
    if (current.annee_scolaire === latest.annee_scolaire && current.trimestre > latest.trimestre) return current;
    return latest;
  });
  return `${dernierBulletin.trimestre}${getTrimestreOrdinal(dernierBulletin.trimestre)} T.`;
});

// Méthodes
const onEnfantChange = () => {
  selectedBulletins.value = [];
  currentPage.value = 1;
};

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedBulletins.value = selectedBulletins.value.filter(id => 
      !paginatedBulletins.value.some(b => b.id === id)
    );
  } else {
    const newSelections = paginatedBulletins.value
      .filter(b => !selectedBulletins.value.includes(b.id))
      .map(b => b.id);
    selectedBulletins.value.push(...newSelections);
  }
};

const previewBulletin = (bulletin) => {
  selectedBulletin.value = bulletin;
  const modal = new bootstrap.Modal(document.getElementById('bulletinModal'));
  modal.show();
};

const closeBulletinModal = () => {
  const modal = bootstrap.Modal.getInstance(document.getElementById('bulletinModal'));
  if (modal) {
    modal.hide();
  }
  selectedBulletin.value = null;
};

const downloadBulletin = async (bulletin) => {
  try {
    // Simulation d'un téléchargement
    showSuccessMessage(`Téléchargement du bulletin de ${bulletin.apprenant.prenom} ${bulletin.apprenant.nom} (${bulletin.trimestre}${getTrimestreOrdinal(bulletin.trimestre)} trimestre ${bulletin.annee_scolaire})`);
    
    // Ici, vous intégreriez l'API réelle pour télécharger le bulletin
    // const response = await api.downloadBulletin(bulletin.id);
    // const blob = new Blob([response.data], { type: 'application/pdf' });
    // const url = window.URL.createObjectURL(blob);
    // const a = document.createElement('a');
    // a.href = url;
    // a.download = `bulletin_${bulletin.apprenant.nom}_${bulletin.apprenant.prenom}_T${bulletin.trimestre}_${bulletin.annee_scolaire}.pdf`;
    // a.click();
    // window.URL.revokeObjectURL(url);
  } catch (error) {
    showErrorMessage('Erreur lors du téléchargement du bulletin');
  }
};

const downloadSelected = async () => {
  if (selectedBulletins.value.length === 0) return;
  
  try {
    showSuccessMessage(`Téléchargement de ${selectedBulletins.value.length} bulletin(s) en cours...`);
    
    // Ici, vous intégreriez l'API réelle pour télécharger plusieurs bulletins
    // const response = await api.downloadMultipleBulletins(selectedBulletins.value);
    // const blob = new Blob([response.data], { type: 'application/zip' });
    // const url = window.URL.createObjectURL(blob);
    // const a = document.createElement('a');
    // a.href = url;
    // a.download = `bulletins_${new Date().toISOString().split('T')[0]}.zip`;
    // a.click();
    // window.URL.revokeObjectURL(url);
    
    selectedBulletins.value = [];
  } catch (error) {
    showErrorMessage('Erreur lors du téléchargement des bulletins');
  }
};

// Fonctions utilitaires
const getTrimestreOrdinal = (trimestre) => {
  const ordinals = { 1: 'er', 2: 'ème', 3: 'ème' };
  return ordinals[trimestre] || 'ème';
};

const getTrimestreBadge = (trimestre) => {
  const badges = {
    1: 'bg-primary',
    2: 'bg-warning',
    3: 'bg-success'
  };
  return badges[trimestre] || 'bg-secondary';
};

const getMoyenneColor = (moyenne) => {
  if (moyenne >= 16) return 'text-success';
  if (moyenne >= 14) return 'text-info';
  if (moyenne >= 12) return 'text-warning';
  if (moyenne >= 10) return 'text-primary';
  return 'text-danger';
};

const getStatut = (moyenne) => {
  if (moyenne >= 18) return 'Excellent';
  if (moyenne >= 16) return 'Très bien';
  if (moyenne >= 14) return 'Bien';
  if (moyenne >= 12) return 'Assez bien';
  if (moyenne >= 10) return 'Passable';
  return 'Insuffisant';
};

const getStatutBadge = (moyenne) => {
  if (moyenne >= 18) return 'bg-success';
  if (moyenne >= 16) return 'bg-info';
  if (moyenne >= 14) return 'bg-primary';
  if (moyenne >= 12) return 'bg-warning';
  if (moyenne >= 10) return 'bg-secondary';
  return 'bg-danger';
};

const getAppreciationBadge = (note) => {
  if (note >= 16) return 'bg-success';
  if (note >= 14) return 'bg-info';
  if (note >= 12) return 'bg-primary';
  if (note >= 10) return 'bg-warning';
  return 'bg-danger';
};
</script>