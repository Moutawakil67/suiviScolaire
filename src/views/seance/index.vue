<template>
  <VerticalLayout>
    <div class="container-fluid">
      <PageTitle title="Séances de mes enfants" />
      
      <!-- Statistiques rapides -->
      <div class="row g-3 mb-4">
        <div class="col-lg-3 col-md-6">
          <div class="card bg-primary bg-soft border-0">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <div class="avatar-sm bg-primary rounded me-3">
                  <i class="bx bx-book text-white fs-18"></i>
                </div>
                <div>
                  <h4 class="mb-0 text-white">{{ totalSeances }}</h4>
                  <p class="_text-muted mb-0 text-white">Total séances</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6">
          <div class="card bg-success bg-soft border-0">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <div class="avatar-sm bg-success rounded me-3">
                  <i class="bx bx-check-circle text-white fs-18"></i>
                </div>
                <div>
                  <h4 class="mb-0 text-white">{{ seancesPresentes }}</h4>
                  <p class="_text-muted mb-0 text-white">Présences</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6">
          <div class="card bg-warning bg-soft border-0">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <div class="avatar-sm bg-warning rounded me-3">
                  <i class="bx bx-x-circle text-white fs-18"></i>
                </div>
                <div>
                  <h4 class="mb-0 text-white">{{ seancesAbsentes }}</h4>
                  <p class="_text-muted mb-0 text-white">Absences</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6">
          <div class="card bg-info bg-soft border-0">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <div class="avatar-sm bg-info rounded me-3">
                  <i class="bx bx-bell text-white fs-18"></i>
                </div>
                <div>
                  <h4 class="mb-0 text-white">{{ notifications }}</h4>
                  <p class="_text-muted mb-0 text-white">Notifications</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sélecteur d'enfant si plusieurs enfants -->
      <div v-if="enfants.length > 1" class="row mb-4">
        <div class="col-12 col-md-6">
          <div class="card">
            <div class="card-body py-2">
              <div class="d-flex align-items-center">
                <label class="form-label me-3 mb-0">Enfant :</label>
                <select 
                  v-model="selectedEnfantId" 
                  class="form-select"
                  @change="loadSeancesForSelectedEnfant"
                >
                  <option value="">Tous les enfants</option>
                  <option 
                    v-for="enfant in enfants" 
                    :key="enfant.id" 
                    :value="enfant.id"
                  >
                    {{ enfant.prenom }} {{ enfant.nom }}
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- En-tête avec barre de recherche et sélecteur de vue -->
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
            <button
              class="btn"
              :class="viewMode === 'stats' ? 'btn-primary' : 'btn-outline-primary'"
              @click="viewMode = 'stats'"
            >
              <i class="bx bx-bar-chart me-1"></i> Statistiques
            </button>
          </div>
        </div>
        <div class="col-12 col-md-4 d-flex justify-content-md-end justify-content-center gap-2">
          <ExportButton
            :data="seances"
            filename="seances_enfants"
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

      <!-- Vue Statistiques -->
      <div v-if="viewMode === 'stats'" class="row">
        <!-- Statistiques par enfant -->
        <div class="col-12 mb-4">
          <div class="card">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="bx bx-user me-2"></i>Statistiques par enfant
              </h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div v-for="enfant in enfants" :key="enfant.id" class="col-lg-6 mb-3">
                  <div class="border rounded p-3">
                    <h6 class="fw-bold mb-3">{{ enfant.prenom }} {{ enfant.nom }}</h6>
                    <div class="row text-center">
                      <div class="col-4">
                        <div class="text-primary fw-bold fs-4">{{ getStatsForEnfant(enfant.id).total }}</div>
                        <small class="text-muted">Total</small>
                      </div>
                      <div class="col-4">
                        <div class="text-success fw-bold fs-4">{{ getStatsForEnfant(enfant.id).presences }}</div>
                        <small class="text-muted">Présent</small>
                      </div>
                      <div class="col-4">
                        <div class="text-danger fw-bold fs-4">{{ getStatsForEnfant(enfant.id).absences }}</div>
                        <small class="text-muted">Absent</small>
                      </div>
                    </div>
                    <div class="progress mt-2" style="height: 8px;">
                      <div 
                        class="progress-bar bg-success" 
                        :style="{ width: getPresencePercentage(enfant.id) + '%' }"
                      ></div>
                    </div>
                    <small class="text-muted">{{ getPresencePercentage(enfant.id) }}% de présence</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Statistiques par matière -->
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="bx bx-book me-2"></i>Statistiques par matière
              </h5>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>Matière</th>
                      <th>Enfant</th>
                      <th>Total séances</th>
                      <th>Présences</th>
                      <th>Absences</th>
                      <th>Taux présence</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="stat in statsByMatiere" :key="`${stat.matiere}-${stat.enfant_id}`">
                      <td>
                        <div class="d-flex align-items-center">
                          <div class="avatar-sm bg-primary bg-soft rounded me-2 d-flex align-items-center justify-content-center">
                            <i class="bx bx-book text-primary"></i>
                          </div>
                          {{ stat.matiere }}
                        </div>
                      </td>
                      <td>{{ stat.enfant_nom }}</td>
                      <td><span class="badge bg-primary bg-soft text-primary">{{ stat.total }}</span></td>
                      <td><span class="badge bg-success bg-soft text-success">{{ stat.presences }}</span></td>
                      <td><span class="badge bg-danger bg-soft text-danger">{{ stat.absences }}</span></td>
                      <td>
                        <div class="d-flex align-items-center">
                          <div class="progress me-2" style="width: 60px; height: 6px;">
                            <div 
                              class="progress-bar bg-success" 
                              :style="{ width: stat.percentage + '%' }"
                            ></div>
                          </div>
                          <span class="text-muted">{{ stat.percentage }}%</span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Vue Tableau -->
      <div v-if="viewMode === 'table'" class="card">
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-centered table-hover">
              <thead>
                <tr>
                  <th>Enfant</th>
                  <th>Matière</th>
                  <th>Enseignant</th>
                  <th>Classe</th>
                  <th>Date & Heure</th>
                  <th>Présence</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="seance in paginatedSeances" :key="seance.id">
                  <td>
                    <div class="d-flex align-items-center">
                      <div class="avatar-sm bg-info bg-soft rounded me-2 d-flex align-items-center justify-content-center">
                        <i class="bx bx-user text-info"></i>
                      </div>
                      <div>
                        <h6 class="mb-0">{{ seance.enfant_prenom }} {{ seance.enfant_nom }}</h6>
                        <small class="text-muted">{{ seance.classe_nom }}</small>
                      </div>
                    </div>
                  </td>
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
                    <span 
                      :class="getPresenceBadgeClass(seance.presence_statut)"
                      class="badge"
                    >
                      {{ getPresenceLabel(seance.presence_statut) }}
                    </span>
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
                        class="btn btn-sm btn-soft-success"
                        @click="viewSeanceDetails(seance)"
                        title="Voir les détails"
                      >
                        <i class="bx bx-show"></i>
                      </button>
                      <button
                        v-if="seance.presence_statut === 'absent'"
                        class="btn btn-sm btn-soft-warning"
                        @click="openReclamationModal(seance)"
                        title="Faire une réclamation"
                      >
                        <i class="bx bx-message-square-error"></i>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="filteredSeances.length === 0">
                  <td colspan="8" class="text-center py-4">
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
                      :class="getSeanceBlockClass(seance.statut, seance.presence_statut)"
                      @click="viewSeanceDetails(seance)"
                    >
                      <div class="seance-title">{{ seance.nom_matiere }}</div>
                      <div class="seance-time">{{ seance.heure_debut_time }} - {{ seance.heure_fin_time }}</div>
                      <div class="seance-teacher">{{ seance.nom_enseignant }}</div>
                      <div class="seance-student">{{ seance.enfant_prenom }}</div>
                      <div class="seance-presence-indicator">
                        <i 
                          :class="getPresenceIcon(seance.presence_statut)"
                          :title="getPresenceLabel(seance.presence_statut)"
                        ></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de détails de séance -->
    <b-modal
      v-model="showDetailsModal"
      title="Détails de la séance"
      @hidden="selectedSeance = null"
      :hide-footer="true"
      size="lg"
    >
      <div v-if="selectedSeance" class="row">
        <div class="col-md-6">
          <div class="mb-3">
            <label class="fw-bold">Enfant :</label>
            <p>{{ selectedSeance.enfant_prenom }} {{ selectedSeance.enfant_nom }}</p>
          </div>
          <div class="mb-3">
            <label class="fw-bold">Matière :</label>
            <p>{{ selectedSeance.nom_matiere }} ({{ selectedSeance.type_seance }})</p>
          </div>
          <div class="mb-3">
            <label class="fw-bold">Enseignant :</label>
            <p>{{ selectedSeance.nom_enseignant }} {{ selectedSeance.prenom_enseignant }}</p>
          </div>
          <div class="mb-3">
            <label class="fw-bold">Classe :</label>
            <p>{{ selectedSeance.nom_classe }} - {{ selectedSeance.niveau_classe }}</p>
          </div>
        </div>
        <div class="col-md-6">
          <div class="mb-3">
            <label class="fw-bold">Date :</label>
            <p>{{ formatDate(selectedSeance.jour) }}</p>
          </div>
          <div class="mb-3">
            <label class="fw-bold">Horaire :</label>
            <p>{{ selectedSeance.heure_debut_time }} - {{ selectedSeance.heure_fin_time }}</p>
          </div>
          <div class="mb-3">
            <label class="fw-bold">Durée :</label>
            <p>{{ calculateDuration(selectedSeance.heure_debut_time, selectedSeance.heure_fin_time) }}</p>
          </div>
          <div class="mb-3">
            <label class="fw-bold">Présence :</label>
            <p>
              <span 
                :class="getPresenceBadgeClass(selectedSeance.presence_statut)"
                class="badge"
              >
                {{ getPresenceLabel(selectedSeance.presence_statut) }}
              </span>
            </p>
          </div>
          <div class="mb-3">
            <label class="fw-bold">Statut :</label>
            <p>
              <span 
                :class="getStatusBadgeClass(selectedSeance.statut)"
                class="badge"
              >
                {{ selectedSeance.statut }}
              </span>
            </p>
          </div>
          <div v-if="selectedSeance.salle" class="mb-3">
            <label class="fw-bold">Salle :</label>
            <p>{{ selectedSeance.salle }}</p>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button
          type="button"
          class="btn btn-secondary"
          @click="showDetailsModal = false"
        >
          Fermer
        </button>
        <button
          v-if="selectedSeance && selectedSeance.presence_statut === 'absent'"
          type="button"
          class="btn btn-warning"
          @click="openReclamationModal(selectedSeance)"
        >
          <i class="bx bx-message-square-error me-1"></i>
          Faire une réclamation
        </button>
      </div>
    </b-modal>

    <!-- Modal de réclamation -->
    <b-modal
      v-model="showReclamationModal"
      title="Faire une réclamation"
      @hidden="resetReclamationForm"
      :hide-footer="true"
      size="lg"
    >
      <form @submit.prevent="submitReclamation" v-if="selectedSeance">
        <div class="mb-3">
          <div class="alert alert-info">
            <i class="bx bx-info-circle me-1"></i>
            Réclamation pour la séance de <strong>{{ selectedSeance.nom_matiere }}</strong> 
            du <strong>{{ formatDate(selectedSeance.jour) }}</strong> 
            de <strong>{{ selectedSeance.heure_debut_time }}</strong> à <strong>{{ selectedSeance.heure_fin_time }}</strong>
            pour <strong>{{ selectedSeance.enfant_prenom }} {{ selectedSeance.enfant_nom }}</strong>
          </div>
        </div>

        <div class="mb-3">
          <FormField
            v-model="reclamationForm.sujet"
            label="Sujet de la réclamation"
            type="text"
            required
            placeholder="Ex: Présence non marquée, erreur d'absence..."
          />
        </div>

        <div class="mb-3">
          <FormField
            v-model="reclamationForm.description"
            label="Description détaillée"
            type="textarea"
            required
            placeholder="Expliquez en détail votre réclamation..."
            rows="4"
          />
        </div>

        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-secondary"
            @click="showReclamationModal = false"
            :disabled="loading"
          >
            Annuler
          </button>
          <button
            type="submit"
            class="btn btn-warning"
            :disabled="loading"
          >
            <span
              v-if="loading"
              class="spinner-border spinner-border-sm me-1"
              role="status"
              aria-hidden="true"
            ></span>
            <span>{{ loading ? 'En cours...' : 'Envoyer la réclamation' }}</span>
          </button>
        </div>
      </form>
    </b-modal>

  </VerticalLayout>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import ExportButton from '@/components/ExportButton.vue';
import VerticalLayout from '@/layouts/VerticalLayout.vue';
import PageTitle from '@/components/PageTitle.vue';
import FormField from '@/components/FormField.vue';
import TablePagination from '@/components/TablePagination.vue';
import { showSuccessMessage, showErrorMessage } from '@/helpers/notification';
import SearchBox from '@/components/SearchBox.vue';

// État principal
const viewMode = ref('table'); // 'table', 'calendar' ou 'stats'
const currentWeekStart = ref(new Date());
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = ref(10);
const loading = ref(false);
const selectedSeance = ref(null);
const showDetailsModal = ref(false);
const showReclamationModal = ref(false);
const selectedEnfantId = ref('');

// Données mockées des enfants du parent
const enfants = ref([
  {
    id: 1,
    prenom: "Emma",
    nom: "Dubois",
    classe_id: 1,
    classe_nom: "6ème A",
    niveau: "6ème"
  },
  {
    id: 2,
    prenom: "Lucas",
    nom: "Dubois", 
    classe_id: 2,
    classe_nom: "4ème C",
    niveau: "4ème"
  }
]);

// Données mockées des séances avec informations de présence
const seances = ref([
  {
    id: 1,
    enfant_id: 1,
    enfant_prenom: "Emma",
    enfant_nom: "Dubois",
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
    statut: "Terminée",
    salle: "101",
    presence_statut: "present" // present, absent, retard, justifie
  },
  {
    id: 2,
    enfant_id: 1,
    enfant_prenom: "Emma",
    enfant_nom: "Dubois",
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
    statut: "Terminée",
    salle: "102",
    presence_statut: "absent"
  },
  {
    id: 3,
    enfant_id: 2,
    enfant_prenom: "Lucas",
    enfant_nom: "Dubois",
    matiere_id: 3,
    nom_matiere: "Histoire-Géographie",
    enseignant_id: 3,
    nom_enseignant: "Bernard",
    prenom_enseignant: "Sophie",
    niveau_etude_enseignant: "Professeur certifié",
    classe_id: 2,
    nom_classe: "4ème C",
    niveau_classe: "4ème",
    jour: "2024-01-15",
    heure_debut_time: "10:15",
    heure_fin_time: "11:15",
    type_seance: "TD",
    statut: "Terminée",
    salle: "201",
    presence_statut: "present"
  },
  {
    id: 4,
    enfant_id: 2,
    enfant_prenom: "Lucas",
    enfant_nom: "Dubois",
    matiere_id: 4,
    nom_matiere: "Sciences Physiques",
    enseignant_id: 4,
    nom_enseignant: "Leroy",
    prenom_enseignant: "Thomas",
    niveau_etude_enseignant: "Professeur certifié",
    classe_id: 2,
    nom_classe: "4ème C",
    niveau_classe: "4ème",
    jour: "2024-01-16",
    heure_debut_time: "14:00",
    heure_fin_time: "15:00",
    type_seance: "TP",
    statut: "Planifiée",
    salle: "Labo 1",
    presence_statut: null
  },
  {
    id: 5,
    enfant_id: 1,
    enfant_prenom: "Emma",
    enfant_nom: "Dubois",
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
    salle: "103",
    presence_statut: null
  },
  {
    id: 6,
    enfant_id: 1,
    enfant_prenom: "Emma",
    enfant_nom: "Dubois",
    matiere_id: 1,
    nom_matiere: "Mathématiques",
    enseignant_id: 1,
    nom_enseignant: "Dubois",
    prenom_enseignant: "Marie",
    niveau_etude_enseignant: "Professeur certifié",
    classe_id: 1,
    nom_classe: "6ème A",
    niveau_classe: "6ème",
    jour: "2024-01-17",
    heure_debut_time: "08:00",
    heure_fin_time: "09:00",
    type_seance: "Contrôle",
    statut: "Planifiée",
    salle: "105",
    presence_statut: null
  },
  {
    id: 7,
    enfant_id: 2,
    enfant_prenom: "Lucas",
    enfant_nom: "Dubois",
    matiere_id: 6,
    nom_matiere: "EPS",
    enseignant_id: 6,
    nom_enseignant: "Petit",
    prenom_enseignant: "Lucas",
    niveau_etude_enseignant: "Professeur d'EPS",
    classe_id: 2,
    nom_classe: "4ème C",
    niveau_classe: "4ème",
    jour: "2024-01-17",
    heure_debut_time: "10:15",
    heure_fin_time: "12:15",
    type_seance: "Pratique",
    statut: "Terminée",
    salle: "Gymnase",
    presence_statut: "retard"
  },
  {
    id: 8,
    enfant_id: 1,
    enfant_prenom: "Emma",
    enfant_nom: "Dubois",
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
    statut: "Terminée",
    salle: "Atelier Arts",
    presence_statut: "justifie"
  }
]);

// Formulaire de réclamation
const reclamationForm = ref({
  sujet: '',
  description: ''
});

// Heures pour la vue calendrier
const hours = [
  '08:00', '09:00', '10:00', '11:00', '12:00', 
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
];

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

// Computed properties pour les données filtrées
const filteredSeances = computed(() => {
  let filtered = seances.value;
  
  // Filtrer par enfant sélectionné
  if (selectedEnfantId.value) {
    filtered = filtered.filter(seance => seance.enfant_id === selectedEnfantId.value);
  }
  
  // Filtrer par recherche
  if (searchQuery.value) {
    filtered = filtered.filter(seance =>
      seance.nom_matiere.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      seance.nom_enseignant.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      seance.prenom_enseignant.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      seance.nom_classe.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      seance.niveau_classe.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      seance.type_seance.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      seance.statut.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      seance.enfant_prenom.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      seance.enfant_nom.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  }
  
  return filtered;
});

const totalItems = computed(() => filteredSeances.value.length);
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value);
const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage.value, totalItems.value));

const paginatedSeances = computed(() => {
  return filteredSeances.value.slice(startIndex.value, endIndex.value);
});

// Computed properties pour les statistiques
const totalSeances = computed(() => {
  return selectedEnfantId.value 
    ? seances.value.filter(s => s.enfant_id === selectedEnfantId.value).length
    : seances.value.length;
});

const seancesPresentes = computed(() => {
  const filtered = selectedEnfantId.value 
    ? seances.value.filter(s => s.enfant_id === selectedEnfantId.value)
    : seances.value;
  return filtered.filter(s => s.presence_statut === 'present').length;
});

const seancesAbsentes = computed(() => {
  const filtered = selectedEnfantId.value 
    ? seances.value.filter(s => s.enfant_id === selectedEnfantId.value)
    : seances.value;
  return filtered.filter(s => s.presence_statut === 'absent').length;
});

const notifications = computed(() => {
  // Notifications pour absences non justifiées
  const filtered = selectedEnfantId.value 
    ? seances.value.filter(s => s.enfant_id === selectedEnfantId.value)
    : seances.value;
  return filtered.filter(s => s.presence_statut === 'absent').length;
});

// Statistiques par enfant
const getStatsForEnfant = (enfantId) => {
  const seancesEnfant = seances.value.filter(s => s.enfant_id === enfantId);
  const total = seancesEnfant.length;
  const presences = seancesEnfant.filter(s => s.presence_statut === 'present').length;
  const absences = seancesEnfant.filter(s => s.presence_statut === 'absent').length;
  
  return { total, presences, absences };
};

const getPresencePercentage = (enfantId) => {
  const stats = getStatsForEnfant(enfantId);
  if (stats.total === 0) return 0;
  return Math.round((stats.presences / stats.total) * 100);
};

// Statistiques par matière
const statsByMatiere = computed(() => {
  const stats = [];
  const matieres = [...new Set(seances.value.map(s => s.nom_matiere))];
  
  matieres.forEach(matiere => {
    enfants.value.forEach(enfant => {
      const seancesMatiere = seances.value.filter(s => 
        s.nom_matiere === matiere && s.enfant_id === enfant.id
      );
      
      if (seancesMatiere.length > 0) {
        const total = seancesMatiere.length;
        const presences = seancesMatiere.filter(s => s.presence_statut === 'present').length;
        const absences = seancesMatiere.filter(s => s.presence_statut === 'absent').length;
        const percentage = total > 0 ? Math.round((presences / total) * 100) : 0;
        
        stats.push({
          matiere,
          enfant_id: enfant.id,
          enfant_nom: `${enfant.prenom} ${enfant.nom}`,
          total,
          presences,
          absences,
          percentage
        });
      }
    });
  });
  
  return stats;
});

// Méthodes utilitaires
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR');
};

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

const getPresenceBadgeClass = (presenceStatus) => {
  const statusClasses = {
    'present': 'bg-success bg-soft text-success',
    'absent': 'bg-danger bg-soft text-danger',
    'retard': 'bg-warning bg-soft text-warning',
    'justifie': 'bg-info bg-soft text-info'
  };
  return statusClasses[presenceStatus] || 'bg-secondary bg-soft text-secondary';
};

const getPresenceLabel = (presenceStatus) => {
  const labels = {
    'present': 'Présent',
    'absent': 'Absent',
    'retard': 'Retard',
    'justifie': 'Justifié'
  };
  return labels[presenceStatus] || 'Non renseigné';
};

const getPresenceIcon = (presenceStatus) => {
  const icons = {
    'present': 'bx bx-check-circle text-success',
    'absent': 'bx bx-x-circle text-danger',
    'retard': 'bx bx-time text-warning',
    'justifie': 'bx bx-info-circle text-info'
  };
  return icons[presenceStatus] || 'bx bx-question-mark text-secondary';
};

const getSeanceBlockClass = (status, presenceStatus) => {
  let baseClass = 'seance-block';
  
  // Classe basée sur le statut de présence
  if (presenceStatus === 'present') {
    baseClass += ' seance-present';
  } else if (presenceStatus === 'absent') {
    baseClass += ' seance-absent';
  } else if (presenceStatus === 'retard') {
    baseClass += ' seance-retard';
  } else if (presenceStatus === 'justifie') {
    baseClass += ' seance-justifie';
  } else {
    baseClass += ' seance-planned';
  }
  
  return baseClass;
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
  return filteredSeances.value.filter(seance => {
    if (seance.jour !== date) return false;
    
    const seanceHour = seance.heure_debut_time.substring(0, 5);
    return seanceHour === hour;
  });
};

// Méthodes pour les actions
const loadSeancesForSelectedEnfant = () => {
  // Dans un vrai projet, ici on ferait un appel API
  // Pour la démo, les données sont déjà filtrées dans les computed properties
  currentPage.value = 1;
};

const viewSeanceDetails = (seance) => {
  selectedSeance.value = seance;
  showDetailsModal.value = true;
};

const openReclamationModal = (seance) => {
  selectedSeance.value = seance;
  showReclamationModal.value = true;
  showDetailsModal.value = false;
};

const resetReclamationForm = () => {
  reclamationForm.value = {
    sujet: '',
    description: ''
  };
};

const submitReclamation = async () => {
  if (!reclamationForm.value.sujet || !reclamationForm.value.description) {
    showErrorMessage('Veuillez remplir tous les champs');
    return;
  }
  
  loading.value = true;
  
  try {
    // Simulation de l'envoi de la réclamation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    showSuccessMessage('Réclamation envoyée avec succès');
    showReclamationModal.value = false;
    resetReclamationForm();
    
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la réclamation:', error);
    showErrorMessage('Une erreur est survenue lors de l\'envoi de la réclamation');
  } finally {
    loading.value = false;
  }
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

watch(selectedEnfantId, () => {
  currentPage.value = 1;
});
</script>
