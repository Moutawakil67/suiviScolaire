<template>
  <VerticalLayout>
    <div class="container-fluid">
      <PageTitle title="Gestion des séances" />
      
      <!-- En-tête avec barre de recherche, sélecteur de vue et boutons -->
      <div class="row g-3 mb-4">
        <div class="col-12 col-md-4">
          <SearchBox
            v-model="searchQuery"
            placeholder="Rechercher une séance..."
            class="w-100"
          />
        </div>
        <div class="col-12 col-md-4">
          <div class="d-flex gap-2">
            <button
              class="btn"
              :class="viewMode === 'table' ? 'btn-primary' : 'btn-outline-primary'"
              @click="viewMode = 'table'"
            >
              <i class="bx bx-table me-1"></i> Tableau
            </button>
            <button
              class="btn"
              :class="viewMode === 'calendar' ? 'btn-primary' : 'btn-outline-primary'"
              @click="viewMode = 'calendar'"
            >
              <i class="bx bx-calendar me-1"></i> Calendrier
            </button>
          </div>
        </div>
        <div class="col-12 col-md-4 d-flex justify-content-md-end justify-content-center gap-2">
          <LoadingButton
            v-if="canCreate"
            variant="primary"
            @click="openAddModal"
          >
            <i class="bx bx-plus me-1"></i> Ajouter
          </LoadingButton>
          <ExportButton
            v-if="canExport"
            :data="seances"
            filename="seances"
            label="Exporter"
            class="flex-shrink-0"
          />
        </div>
      </div>

      <!-- Filtre de semaine pour la vue calendrier -->
      <div v-if="viewMode === 'calendar'" class="row mb-4">
        <div class="col-12 col-md-6">
          <div class="d-flex align-items-center gap-3">
            <button class="btn btn-outline-secondary btn-sm" @click="previousWeek">
              <i class="bx bx-chevron-left"></i>
            </button>
            <div class="fw-bold text-center" style="min-width: 200px;">
              Semaine du {{ formatDate(currentWeekStart) }} au {{ formatDate(currentWeekEnd) }}
            </div>
            <button class="btn btn-outline-secondary btn-sm" @click="nextWeek">
              <i class="bx bx-chevron-right"></i>
            </button>
          </div>
        </div>
        <div class="col-12 col-md-6">
          <input
            type="week"
            class="form-control"
            :value="currentWeekValue"
            @change="selectWeek"
            style="max-width: 200px; margin-left: auto;"
          />
        </div>
      </div>

      <!-- Vue Tableau -->
      <div v-if="viewMode === 'table'" class="card">
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-centered table-hover">
              <thead>
                <tr>
                  <th>Matière</th>
                  <th>Enseignant</th>
                  <th>Classe</th>
                  <th>Date & Heure</th>
                  <th>Durée</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="seance in paginatedSeances" :key="seance.id">
                  <td>
                    <div class="d-flex align-items-center">
                      <div class="avatar-sm bg-primary bg-soft rounded me-2 d-flex align-items-center justify-content-center">
                        <i class="bx bx-book text-primary"></i>
                      </div>
                      <div>
                        <h6 class="mb-0">{{ seance.nom_matiere }}</h6>
                        <small class="text-muted">{{ seance.type_seance }}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div>
                      <span class="fw-medium">{{ seance.nom_enseignant }} {{ seance.prenom_enseignant }}</span>
                      <br>
                      <small class="text-muted">{{ seance.niveau_etude_enseignant }}</small>
                    </div>
                  </td>
                  <td>
                    <span class="badge bg-info bg-soft text-info">{{ seance.nom_classe }}</span>
                    <br>
                    <small class="text-muted">{{ seance.niveau_classe }}</small>
                  </td>
                  <td>
                    <div>
                      <span class="fw-medium">{{ formatDate(seance.jour) }}</span>
                      <br>
                      <small class="text-muted">{{ seance.heure_debut_time }} - {{ seance.heure_fin_time }}</small>
                    </div>
                  </td>
                  <td>
                    <span class="badge bg-secondary bg-soft text-secondary">{{ calculateDuration(seance.heure_debut_time, seance.heure_fin_time) }}</span>
                  </td>
                  <td>
                    <span 
                      :class="getStatusBadgeClass(seance.statut)"
                      class="badge"
                    >
                      {{ seance.statut }}
                    </span>
                  </td>
                  <td>
                    <div class="d-flex gap-2">
                      <button
                        v-if="canUpdate"
                        class="btn btn-sm btn-soft-primary"
                        @click="openEditModal(seance)"
                        title="Modifier"
                      >
                        <i class="bx bx-pencil"></i>
                      </button>
                      <button
                        v-if="canDelete"
                        class="btn btn-sm btn-soft-danger"
                        @click="openDeleteModal(seance)"
                        title="Supprimer"
                      >
                        <i class="bx bx-trash"></i>
                      </button>
                      <button
                        class="btn btn-sm btn-soft-success"
                        @click="viewSeanceDetails(seance)"
                        title="Voir les détails"
                      >
                        <i class="bx bx-show"></i>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="filteredSeances.length === 0">
                  <td colspan="7" class="text-center py-4">
                    <div class="text-muted">
                      <i class="bx bx-search-alt-2 fs-4 d-block mb-2"></i>
                      Aucune séance trouvée
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

      <!-- Vue Calendrier Hebdomadaire -->
      <div v-if="viewMode === 'calendar'" class="card">
        <div class="card-body">
          <div class="calendar-week-view">
            <div class="row">
              <!-- Colonne des heures -->
              <div class="col-1 border-end">
                <div class="hour-header"></div>
                <div v-for="hour in hours" :key="hour" class="hour-slot">
                  {{ hour }}
                </div>
              </div>
              
              <!-- Colonnes des jours -->
              <div class="col" v-for="(day, index) in weekDays" :key="index">
                <div class="day-header text-center fw-bold py-2 border-bottom">
                  <div>{{ day.name }}</div>
                  <div class="small text-muted">{{ formatDate(day.date) }}</div>
                </div>
                <div class="day-column">
                  <div v-for="hour in hours" :key="hour" class="hour-slot border-bottom">
                    <div
                      v-for="seance in getSeancesForDayAndHour(day.date, hour)"
                      :key="seance.id"
                      class="seance-block mb-1"
                      :class="getSeanceBlockClass(seance.statut)"
                      @click="viewSeanceDetails(seance)"
                    >
                      <div class="seance-title">{{ seance.nom_matiere }}</div>
                      <div class="seance-time">{{ seance.heure_debut_time }} - {{ seance.heure_fin_time }}</div>
                      <div class="seance-teacher">{{ seance.nom_enseignant }}</div>
                      <div class="seance-class">{{ seance.nom_classe }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal d'ajout/modification -->
    <b-modal
      v-model="showModal"
      :title="isEditing ? 'Modifier la séance' : 'Ajouter une séance'"
      @hidden="resetForm"
      @cancel="handleCancel"
      :hide-footer="true"
      size="lg"
    >
      <form ref="seanceForm" @submit.prevent="handleSubmit" novalidate>
        <div class="row">
          <div class="col-md-6 mb-3">
            <FormField
              v-model="form.matiere_id"
              label="Matière"
              type="select"
              :options="matiereOptions"
              required
              id="matiere_id"
            />
          </div>
          <div class="col-md-6 mb-3">
            <FormField
              v-model="form.enseignant_id"
              label="Enseignant"
              type="select"
              :options="enseignantOptions"
              required
              id="enseignant_id"
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
              v-model="form.type_seance"
              label="Type de séance"
              type="select"
              :options="typeSeanceOptions"
              required
              id="type_seance"
            />
          </div>
        </div>

        <div class="row">
          <div class="col-md-4 mb-3">
            <FormField
              v-model="form.jour"
              label="Date"
              type="date"
              required
              id="jour"
            />
          </div>
          <div class="col-md-4 mb-3">
            <FormField
              v-model="form.heure_debut_time"
              label="Heure de début"
              type="time"
              required
              id="heure_debut_time"
            />
          </div>
          <div class="col-md-4 mb-3">
            <FormField
              v-model="form.heure_fin_time"
              label="Heure de fin"
              type="time"
              required
              id="heure_fin_time"
            />
          </div>
        </div>

        <div class="row">
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
          <div class="col-md-6 mb-3">
            <FormField
              v-model="form.salle"
              label="Salle"
              type="text"
              id="salle"
              placeholder="Numéro de salle"
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
      @hidden="selectedSeance = null"
      @cancel="handleCancel"
      :hide-footer="true"
    >
      <div class="text-center" v-if="selectedSeance">
        <div class="mb-3">
          <i class="bx bx-error-circle text-danger" style="font-size: 48px;"></i>
        </div>
        <h5 class="mb-3">Supprimer la séance</h5>
        <p class="text-muted mb-3">
          Êtes-vous sûr de vouloir supprimer la séance de 
          <strong>{{ selectedSeance.nom_matiere }}</strong> 
          du <strong>{{ formatDate(selectedSeance.jour) }}</strong> 
          de <strong>{{ selectedSeance.heure_debut_time }}</strong> à <strong>{{ selectedSeance.heure_fin_time }}</strong> ?
        </p>
        <div class="alert alert-warning">
          <i class="bx bx-info-circle me-1"></i>
          Cette action est irréversible et supprimera définitivement la séance.
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
import { ref, computed, onMounted , watch } from 'vue';
import LoadingButton from '@/components/LoadingButton.vue';
import ExportButton from '@/components/ExportButton.vue';
import VerticalLayout from '@/layouts/VerticalLayout.vue';
import PageTitle from '@/components/PageTitle.vue';
import FormField from '@/components/FormField.vue';
import TablePagination from '@/components/TablePagination.vue';
import { showSuccessMessage, showErrorMessage } from '@/helpers/notification';
import { usePermissionStore } from '@/stores/permissionStore';
import SearchBox from '@/components/SearchBox.vue';

const seanceForm = ref(null);

// Définition des permissions requises pour chaque action
const permissions = {
  create: ['seance:create'],
  update: ['seance:update'],
  delete: ['seance:delete'],
  export: ['seance:export']
};

// Utilisation du store de permissions
const permissionStore = usePermissionStore();

// Vérification des permissions
const canCreate = computed(() => permissionStore.checkPermissions(permissions.create));
const canUpdate = computed(() => permissionStore.checkPermissions(permissions.update));
const canDelete = computed(() => permissionStore.checkPermissions(permissions.delete));
const canExport = computed(() => permissionStore.checkPermissions(permissions.export));

// État
const viewMode = ref('table'); // 'table' ou 'calendar'
const currentWeekStart = ref(new Date());
const seances = ref([
  // Données mockées pour la démonstration
  {
    id: 1,
    matiere_id: 1,
    nom_matiere: "Mathématiques",
    enseignant_id: 1,
    nom_enseignant: "Dubois",
    prenom_enseignant: "Marie",
    niveau_etude_enseignant: "Professeur certifié",
    classe_id: 1,
    nom_classe: "6ème A",
    niveau_classe: "6ème",
    jour: "2024-01-15",
    heure_debut_time: "08:00",
    heure_fin_time: "09:00",
    type_seance: "Cours",
    statut: "Planifiée",
    salle: "101"
  },
  {
    id: 2,
    matiere_id: 2,
    nom_matiere: "Français",
    enseignant_id: 2,
    nom_enseignant: "Martin",
    prenom_enseignant: "Pierre",
    niveau_etude_enseignant: "Professeur agrégé",
    classe_id: 1,
    nom_classe: "6ème A",
    niveau_classe: "6ème",
    jour: "2024-01-15",
    heure_debut_time: "09:00",
    heure_fin_time: "10:00",
    type_seance: "Cours",
    statut: "En cours",
    salle: "102"
  },
  {
    id: 3,
    matiere_id: 3,
    nom_matiere: "Histoire-Géographie",
    enseignant_id: 3,
    nom_enseignant: "Bernard",
    prenom_enseignant: "Sophie",
    niveau_etude_enseignant: "Professeur certifié",
    classe_id: 2,
    nom_classe: "5ème B",
    niveau_classe: "5ème",
    jour: "2024-01-15",
    heure_debut_time: "10:15",
    heure_fin_time: "11:15",
    type_seance: "TD",
    statut: "Terminée",
    salle: "201"
  },
  {
    id: 4,
    matiere_id: 4,
    nom_matiere: "Sciences Physiques",
    enseignant_id: 4,
    nom_enseignant: "Leroy",
    prenom_enseignant: "Thomas",
    niveau_etude_enseignant: "Professeur certifié",
    classe_id: 3,
    nom_classe: "4ème C",
    niveau_classe: "4ème",
    jour: "2024-01-16",
    heure_debut_time: "14:00",
    heure_fin_time: "15:00",
    type_seance: "TP",
    statut: "Planifiée",
    salle: "Labo 1"
  },
  {
    id: 5,
    matiere_id: 5,
    nom_matiere: "Anglais",
    enseignant_id: 5,
    nom_enseignant: "Moreau",
    prenom_enseignant: "Camille",
    niveau_etude_enseignant: "Professeur certifié",
    classe_id: 1,
    nom_classe: "6ème A",
    niveau_classe: "6ème",
    jour: "2024-01-16",
    heure_debut_time: "15:15",
    heure_fin_time: "16:15",
    type_seance: "Cours",
    statut: "Annulée",
    salle: "103"
  },
  {
    id: 6,
    matiere_id: 1,
    nom_matiere: "Mathématiques",
    enseignant_id: 1,
    nom_enseignant: "Dubois",
    prenom_enseignant: "Marie",
    niveau_etude_enseignant: "Professeur certifié",
    classe_id: 2,
    nom_classe: "5ème B",
    niveau_classe: "5ème",
    jour: "2024-01-17",
    heure_debut_time: "08:00",
    heure_fin_time: "09:00",
    type_seance: "Contrôle",
    statut: "Planifiée",
    salle: "105"
  },
  {
    id: 7,
    matiere_id: 6,
    nom_matiere: "EPS",
    enseignant_id: 6,
    nom_enseignant: "Petit",
    prenom_enseignant: "Lucas",
    niveau_etude_enseignant: "Professeur d'EPS",
    classe_id: 4,
    nom_classe: "3ème A",
    niveau_classe: "3ème",
    jour: "2024-01-17",
    heure_debut_time: "10:15",
    heure_fin_time: "12:15",
    type_seance: "Pratique",
    statut: "Planifiée",
    salle: "Gymnase"
  },
  {
    id: 8,
    matiere_id: 7,
    nom_matiere: "Arts Plastiques",
    enseignant_id: 7,
    nom_enseignant: "Roux",
    prenom_enseignant: "Emma",
    niveau_etude_enseignant: "Professeur certifié",
    classe_id: 1,
    nom_classe: "6ème A",
    niveau_classe: "6ème",
    jour: "2024-01-18",
    heure_debut_time: "14:00",
    heure_fin_time: "15:00",
    type_seance: "Atelier",
    statut: "Planifiée",
    salle: "Atelier Arts"
  },
  {
    id: 9,
    matiere_id: 2,
    nom_matiere: "Français",
    enseignant_id: 2,
    nom_enseignant: "Martin",
    prenom_enseignant: "Pierre",
    niveau_etude_enseignant: "Professeur agrégé",
    classe_id: 3,
    nom_classe: "4ème C",
    niveau_classe: "4ème",
    jour: "2024-01-18",
    heure_debut_time: "15:15",
    heure_fin_time: "16:15",
    type_seance: "Cours",
    statut: "Reportée",
    salle: "106"
  },
  {
    id: 10,
    matiere_id: 8,
    nom_matiere: "Technologie",
    enseignant_id: 8,
    nom_enseignant: "Garnier",
    prenom_enseignant: "Hugo",
    niveau_etude_enseignant: "Professeur certifié",
    classe_id: 2,
    nom_classe: "5ème B",
    niveau_classe: "5ème",
    jour: "2024-01-19",
    heure_debut_time: "09:00",
    heure_fin_time: "10:00",
    type_seance: "TP",
    statut: "Planifiée",
    salle: "Labo Techno"
  }
]);

const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = ref(10);
const showModal = ref(false);
const showDeleteModal = ref(false);
const loading = ref(false);
const isEditing = ref(false);
const selectedSeance = ref(null);
const formErrors = ref({});

// Heures pour la vue calendrier
const hours = [
  '08:00', '09:00', '10:00', '11:00', '12:00', 
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
];

// Options pour les selects
const matiereOptions = [
  { value: 1, label: 'Mathématiques' },
  { value: 2, label: 'Français' },
  { value: 3, label: 'Histoire-Géographie' },
  { value: 4, label: 'Sciences Physiques' },
  { value: 5, label: 'Anglais' },
  { value: 6, label: 'EPS' },
  { value: 7, label: 'Arts Plastiques' },
  { value: 8, label: 'Technologie' }
];

const enseignantOptions = [
  { value: 1, label: 'Marie Dubois' },
  { value: 2, label: 'Pierre Martin' },
  { value: 3, label: 'Sophie Bernard' },
  { value: 4, label: 'Thomas Leroy' },
  { value: 5, label: 'Camille Moreau' },
  { value: 6, label: 'Lucas Petit' },
  { value: 7, label: 'Emma Roux' },
  { value: 8, label: 'Hugo Garnier' }
];

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

const typeSeanceOptions = [
  { value: 'Cours', label: 'Cours' },
  { value: 'TD', label: 'TD' },
  { value: 'TP', label: 'TP' },
  { value: 'Contrôle', label: 'Contrôle' },
  { value: 'Pratique', label: 'Pratique' },
  { value: 'Atelier', label: 'Atelier' }
];

const statutOptions = [
  { value: 'Planifiée', label: 'Planifiée' },
  { value: 'En cours', label: 'En cours' },
  { value: 'Terminée', label: 'Terminée' },
  { value: 'Annulée', label: 'Annulée' },
  { value: 'Reportée', label: 'Reportée' }
];

// Formulaire
const form = ref({
  matiere_id: '',
  enseignant_id: '',
  classe_id: '',
  jour: new Date().toISOString().split('T')[0],
  heure_debut_time: '08:00',
  heure_fin_time: '09:00',
  type_seance: 'Cours',
  statut: 'Planifiée',
  salle: ''
});

// Computed properties pour le calendrier
const currentWeekEnd = computed(() => {
  const end = new Date(currentWeekStart.value);
  end.setDate(end.getDate() + 6);
  return end;
});

const currentWeekValue = computed(() => {
  const year = currentWeekStart.value.getFullYear();
  const week = getWeekNumber(currentWeekStart.value);
  return `${year}-W${week.toString().padStart(2, '0')}`;
});

const weekDays = computed(() => {
  const days = [];
  const dayNames = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(currentWeekStart.value);
    date.setDate(date.getDate() + i);
    days.push({
      name: dayNames[i],
      date: date.toISOString().split('T')[0]
    });
  }
  return days;
});

// Computed properties
const filteredSeances = computed(() => {
  return seances.value.filter(seance =>
    seance.nom_matiere.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    seance.nom_enseignant.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    seance.prenom_enseignant.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    seance.nom_classe.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    seance.niveau_classe.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    seance.type_seance.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    seance.statut.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const totalItems = computed(() => filteredSeances.value.length);
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value);
const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage.value, totalItems.value));

const paginatedSeances = computed(() => {
  return filteredSeances.value.slice(startIndex.value, endIndex.value);
});

// Méthodes utilitaires
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR');
};

// Suite du script Vue.js pour la gestion des séances

const calculateDuration = (start, end) => {
  const startTime = new Date(`1970-01-01T${start}`);
  const endTime = new Date(`1970-01-01T${end}`);
  const diffInMinutes = (endTime - startTime) / (1000 * 60);
  const hours = Math.floor(diffInMinutes / 60);
  const minutes = diffInMinutes % 60;
  
  if (hours > 0 && minutes > 0) {
    return `${hours}h${minutes}min`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    return `${minutes}min`;
  }
};

const getStatusBadgeClass = (status) => {
  const statusClasses = {
    'Planifiée': 'bg-primary bg-soft text-primary',
    'En cours': 'bg-success bg-soft text-success',
    'Terminée': 'bg-secondary bg-soft text-secondary',
    'Annulée': 'bg-danger bg-soft text-danger',
    'Reportée': 'bg-warning bg-soft text-warning'
  };
  return statusClasses[status] || 'bg-secondary bg-soft text-secondary';
};

const getSeanceBlockClass = (status) => {
  const statusClasses = {
    'Planifiée': 'seance-planned',
    'En cours': 'seance-ongoing',
    'Terminée': 'seance-completed',
    'Annulée': 'seance-cancelled',
    'Reportée': 'seance-postponed'
  };
  return statusClasses[status] || 'seance-planned';
};

// Méthodes pour la navigation du calendrier
const previousWeek = () => {
  currentWeekStart.value.setDate(currentWeekStart.value.getDate() - 7);
  currentWeekStart.value = new Date(currentWeekStart.value);
};

const nextWeek = () => {
  currentWeekStart.value.setDate(currentWeekStart.value.getDate() + 7);
  currentWeekStart.value = new Date(currentWeekStart.value);
};

const selectWeek = (event) => {
  const weekValue = event.target.value;
  const [year, week] = weekValue.split('-W');
  const date = getDateFromWeek(parseInt(year), parseInt(week));
  currentWeekStart.value = date;
};

const getWeekNumber = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
  const week1 = new Date(d.getFullYear(), 0, 4);
  return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
};

const getDateFromWeek = (year, week) => {
  const date = new Date(year, 0, 1 + (week - 1) * 7);
  const dayOfWeek = date.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  date.setDate(date.getDate() + mondayOffset);
  return date;
};

const getSeancesForDayAndHour = (date, hour) => {
  return seances.value.filter(seance => {
    if (seance.jour !== date) return false;
    
    const seanceHour = seance.heure_debut_time.substring(0, 5);
    return seanceHour === hour;
  });
};

// Méthodes CRUD
const openAddModal = () => {
  isEditing.value = false;
  selectedSeance.value = null;
  resetForm();
  showModal.value = true;
};

const openEditModal = (seance) => {
  isEditing.value = true;
  selectedSeance.value = seance;
  
  // Remplir le formulaire avec les données de la séance
  form.value = {
    matiere_id: seance.matiere_id,
    enseignant_id: seance.enseignant_id,
    classe_id: seance.classe_id,
    jour: seance.jour,
    heure_debut_time: seance.heure_debut_time,
    heure_fin_time: seance.heure_fin_time,
    type_seance: seance.type_seance,
    statut: seance.statut,
    salle: seance.salle || ''
  };
  
  showModal.value = true;
};

const openDeleteModal = (seance) => {
  selectedSeance.value = seance;
  showDeleteModal.value = true;
};

const resetForm = () => {
  form.value = {
    matiere_id: '',
    enseignant_id: '',
    classe_id: '',
    jour: new Date().toISOString().split('T')[0],
    heure_debut_time: '08:00',
    heure_fin_time: '09:00',
    type_seance: 'Cours',
    statut: 'Planifiée',
    salle: ''
  };
  formErrors.value = {};
};

const validateForm = () => {
  const errors = {};
  
  if (!form.value.matiere_id) {
    errors.matiere_id = 'La matière est requise';
  }
  
  if (!form.value.enseignant_id) {
    errors.enseignant_id = 'L\'enseignant est requis';
  }
  
  if (!form.value.classe_id) {
    errors.classe_id = 'La classe est requise';
  }
  
  if (!form.value.jour) {
    errors.jour = 'La date est requise';
  }
  
  if (!form.value.heure_debut_time) {
    errors.heure_debut_time = 'L\'heure de début est requise';
  }
  
  if (!form.value.heure_fin_time) {
    errors.heure_fin_time = 'L\'heure de fin est requise';
  }
  
  // Vérifier que l'heure de fin est après l'heure de début
  if (form.value.heure_debut_time && form.value.heure_fin_time) {
    const debut = new Date(`1970-01-01T${form.value.heure_debut_time}`);
    const fin = new Date(`1970-01-01T${form.value.heure_fin_time}`);
    
    if (fin <= debut) {
      errors.heure_fin_time = 'L\'heure de fin doit être après l\'heure de début';
    }
  }
  
  if (!form.value.type_seance) {
    errors.type_seance = 'Le type de séance est requis';
  }
  
  if (!form.value.statut) {
    errors.statut = 'Le statut est requis';
  }
  
  formErrors.value = errors;
  return Object.keys(errors).length === 0;
};

const handleSubmit = async () => {
  if (!validateForm()) {
    return;
  }
  
  loading.value = true;
  
  try {
    if (isEditing.value) {
      // Simulation de la mise à jour
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const index = seances.value.findIndex(s => s.id === selectedSeance.value.id);
      if (index !== -1) {
        // Récupérer les données liées depuis les options
        const matiere = matiereOptions.find(m => m.value === form.value.matiere_id);
        const enseignant = enseignantOptions.find(e => e.value === form.value.enseignant_id);
        const classe = classeOptions.find(c => c.value === form.value.classe_id);
        
        seances.value[index] = {
          ...selectedSeance.value,
          ...form.value,
          nom_matiere: matiere?.label || '',
          nom_enseignant: enseignant?.label.split(' ')[1] || '',
          prenom_enseignant: enseignant?.label.split(' ')[0] || '',
          nom_classe: classe?.label || '',
          niveau_classe: classe?.label.split(' ')[0] || ''
        };
      }
      
      showSuccessMessage('Séance modifiée avec succès');
    } else {
      // Simulation de l'ajout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Récupérer les données liées depuis les options
      const matiere = matiereOptions.find(m => m.value === form.value.matiere_id);
      const enseignant = enseignantOptions.find(e => e.value === form.value.enseignant_id);
      const classe = classeOptions.find(c => c.value === form.value.classe_id);
      
      const newSeance = {
        id: Date.now(), // ID temporaire
        ...form.value,
        nom_matiere: matiere?.label || '',
        nom_enseignant: enseignant?.label.split(' ')[1] || '',
        prenom_enseignant: enseignant?.label.split(' ')[0] || '',
        niveau_etude_enseignant: 'Professeur certifié',
        nom_classe: classe?.label || '',
        niveau_classe: classe?.label.split(' ')[0] || ''
      };
      
      seances.value.push(newSeance);
      showSuccessMessage('Séance ajoutée avec succès');
    }
    
    showModal.value = false;
    resetForm();
    
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
    showErrorMessage('Une erreur est survenue lors de la sauvegarde');
  } finally {
    loading.value = false;
  }
};

const handleDelete = async () => {
  if (!selectedSeance.value) return;
  
  loading.value = true;
  
  try {
    // Simulation de la suppression
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const index = seances.value.findIndex(s => s.id === selectedSeance.value.id);
    if (index !== -1) {
      seances.value.splice(index, 1);
    }
    
    showSuccessMessage('Séance supprimée avec succès');
    showDeleteModal.value = false;
    selectedSeance.value = null;
    
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    showErrorMessage('Une erreur est survenue lors de la suppression');
  } finally {
    loading.value = false;
  }
};

const handleCancel = () => {
  showModal.value = false;
  showDeleteModal.value = false;
  selectedSeance.value = null;
  resetForm();
};

const viewSeanceDetails = (seance) => {
  // Ici, vous pourriez ouvrir une modal de détails ou naviguer vers une page de détails
  console.log('Voir les détails de la séance:', seance);
  
  // Exemple d'implémentation avec une alert pour la démonstration
  const details = `
Détails de la séance:
- Matière: ${seance.nom_matiere}
- Type: ${seance.type_seance}
- Enseignant: ${seance.prenom_enseignant} ${seance.nom_enseignant}
- Classe: ${seance.nom_classe}
- Date: ${formatDate(seance.jour)}
- Heure: ${seance.heure_debut_time} - ${seance.heure_fin_time}
- Durée: ${calculateDuration(seance.heure_debut_time, seance.heure_fin_time)}
- Statut: ${seance.statut}
- Salle: ${seance.salle || 'Non spécifiée'}
  `;
  
  alert(details.trim());
};

// Initialisation
onMounted(() => {
  // Définir le début de la semaine courante (lundi)
  const today = new Date();
  const monday = new Date(today);
  const dayOfWeek = today.getDay();
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  monday.setDate(today.getDate() - daysFromMonday);
  currentWeekStart.value = monday;
});

// Watchers
watch(searchQuery, () => {
  currentPage.value = 1;
});
</script>

/* Styles CSS pour le composant de gestion des séances */

<style scoped>
.calendar-week-view {
  min-height: 600px;
  overflow-x: auto;
}

.hour-header {
  height: 60px;
  border-bottom: 1px solid #dee2e6;
}

.hour-slot {
  height: 80px;
  padding: 8px 4px;
  border-bottom: 1px solid #f1f3f4;
  font-size: 0.875rem;
  color: #6c757d;
  text-align: center;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.day-header {
  height: 60px;
  background-color: #f8f9fa;
  border-bottom: 2px solid #dee2e6;
  position: sticky;
  top: 0;
  z-index: 10;
}

.day-column {
  position: relative;
}

.seance-block {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 6px 8px;
  border-radius: 6px;
  cursor: pointer;
  margin: 2px;
  font-size: 0.75rem;
  line-height: 1.2;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.seance-block:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.seance-block.seance-planned {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.seance-block.seance-ongoing {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.seance-block.seance-completed {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
  color: #495057;
}

.seance-block.seance-cancelled {
  background: linear-gradient(135deg, #ff6b6b 0%, #ffa8a8 100%);
}

.seance-block.seance-postponed {
  background: linear-gradient(135deg, #feca57 0%, #ff9ff3 100%);
}

.seance-title {
  font-weight: 600;
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.seance-time {
  font-size: 0.7rem;
  opacity: 0.9;
  margin-bottom: 2px;
}

.seance-teacher {
  font-size: 0.7rem;
  opacity: 0.8;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.seance-class {
  font-size: 0.7rem;
  opacity: 0.8;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Styles pour les badges de statut */
.bg-soft {
  background-color: rgba(var(--bs-primary-rgb), 0.1) !important;
}

.bg-primary.bg-soft {
  background-color: rgba(13, 110, 253, 0.1) !important;
}

.bg-success.bg-soft {
  background-color: rgba(25, 135, 84, 0.1) !important;
}

.bg-danger.bg-soft {
  background-color: rgba(220, 53, 69, 0.1) !important;
}

.bg-warning.bg-soft {
  background-color: rgba(255, 193, 7, 0.1) !important;
}

.bg-info.bg-soft {
  background-color: rgba(13, 202, 240, 0.1) !important;
}

.bg-secondary.bg-soft {
  background-color: rgba(108, 117, 125, 0.1) !important;
}

/* Styles pour les boutons */
.btn-soft-primary {
  color: #0d6efd;
  background-color: rgba(13, 110, 253, 0.1);
  border-color: transparent;
}

.btn-soft-primary:hover {
  color: #fff;
  background-color: #0d6efd;
  border-color: #0d6efd;
}

.btn-soft-danger {
  color: #dc3545;
  background-color: rgba(220, 53, 69, 0.1);
  border-color: transparent;
}

.btn-soft-danger:hover {
  color: #fff;
  background-color: #dc3545;
  border-color: #dc3545;
}

.btn-soft-success {
  color: #198754;
  background-color: rgba(25, 135, 84, 0.1);
  border-color: transparent;
}

.btn-soft-success:hover {
  color: #fff;
  background-color: #198754;
  border-color: #198754;
}

/* Avatar styles */
.avatar-sm {
  width: 2.5rem;
  height: 2.5rem;
}

/* Styles pour les tableaux */
.table-centered th,
.table-centered td {
  vertical-align: middle;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .calendar-week-view {
    font-size: 0.75rem;
  }
  
  .hour-slot {
    height: 60px;
  }
  
  .seance-block {
    padding: 4px 6px;
    font-size: 0.7rem;
  }
  
  .seance-title {
    font-size: 0.7rem;
  }
  
  .seance-time,
  .seance-teacher,
  .seance-class {
    font-size: 0.65rem;
  }
}

/* Animation pour les modals */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

/* Styles pour les alertes */
.alert {
  border: none;
  border-radius: 8px;
}

.alert-warning {
  background-color: rgba(255, 193, 7, 0.1);
  color: #664d03;
  border-left: 4px solid #ffc107;
}

/* Loading spinner styles */
.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

/* Form validation styles */
.is-invalid {
  border-color: #dc3545;
}

.invalid-feedback {
  display: block;
  width: 100%;
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: #dc3545;
}

/* Styles pour les éléments interactifs */
.cursor-pointer {
  cursor: pointer;
}

/* Styles pour l'état de chargement */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loading-spinner {
  width: 3rem;
  height: 3rem;
  border: 0.25rem solid #f3f3f3;
  border-top: 0.25rem solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Amélioration de l'accessibilité */
.btn:focus,
.form-control:focus,
.form-select:focus {
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}

/* Styles pour les tooltips */
.tooltip {
  font-size: 0.875rem;
}

/* Styles pour les états vides */
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #6c757d;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

/* Styles pour les cartes */
.card {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  border: 1px solid rgba(0, 0, 0, 0.125);
}

.card-body {
  padding: 1.5rem;
}

/* Styles pour les boutons d'action */
.action-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

/* Print styles */
@media print {
  .btn,
  .modal,
  .no-print {
    display: none !important;
  }
  
  .table {
    font-size: 0.875rem;
  }
  
  .card {
    border: 1px solid #000;
    box-shadow: none;
  }
}
</style>