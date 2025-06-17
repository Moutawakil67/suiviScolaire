<!-- src/views/dashboards/components/CampagnesDashboard -->
<template>
  <div class="campagnes-dashboard">
    <!-- Section Résumé Global -->
    <b-row class="mb-4 mx-4">
      <b-col>
        <h4 class="mb-3">
          <i class="mdi mdi-chart-box-outline me-2"></i>
          Statistiques des Campagnes
        </h4>
      </b-col>
    </b-row>


    <!-- Filtres de Recherche -->
    <b-row class="mb-4">
      <b-col>
        <b-card>
          <b-card-header>
            <h5 class="mb-0">
              <i class="mdi mdi-filter-variant me-2"></i>
              Filtres de Recherche
            </h5>
          </b-card-header>
          <b-card-body>
            <b-row>
              <b-col md="3">
                <b-form-group label="Date début">
                  <b-form-input
                    v-model="filtres.date_debut"
                    type="date"
                    @change="rechercherCampagnes"
                  />
                </b-form-group>
              </b-col>
              <b-col md="3">
                <b-form-group label="Date fin">
                  <b-form-input
                    v-model="filtres.date_fin"
                    type="date"
                    @change="rechercherCampagnes"
                  />
                </b-form-group>
              </b-col>
              <b-col md="2">
                <b-form-group label="Commanditaire">
                  <b-form-select
                    v-model="filtres.commanditaire_id"
                    :options="[
                      { value: null, text: 'Tous' },
                      ...commanditaires,
                    ]"
                    @change="rechercherCampagnes"
                  />
                </b-form-group>
              </b-col>
              <b-col md="2">
                <b-form-group label="Catégorie">
                  <b-form-select
                    v-model="filtres.category_id"
                    :options="[{ value: null, text: 'Toutes' }, ...categories]"
                    @change="rechercherCampagnes"
                  />
                </b-form-group>
              </b-col>
              <b-col md="2" class="d-flex align-items-end">
                <b-button
                  variant="outline-secondary"
                  @click="reinitialiserFiltres"
                  class="w-100"
                >
                  <i class="mdi mdi-refresh me-1"></i>
                  Réinitialiser
                </b-button>
              </b-col>
            </b-row>
          </b-card-body>
        </b-card>
      </b-col>
    </b-row>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-5">
      <b-spinner variant="primary" class="me-2"></b-spinner>
      Chargement des statistiques...
    </div>

    <!-- Tableau des Campagnes -->
    <b-row v-else>
      <b-col>
        <b-card>
          <b-card-header class="d-flex align-items-center flex-wrap gap-3">
            <h5 class="mb-0 d-flex align-items-center me-3">
              <i class="mdi mdi-table me-2"></i>
              Statistiques par Campagne
            </h5>

            <b-badge
              variant="info"
              v-b-tooltip.hover
              title="Nombre total de campagnes"
            >
              {{ campagnes.length }} campagne(s)
            </b-badge>

            <span
              v-if="resumeGlobal && Object.keys(resumeGlobal).length > 0"
              class="d-flex gap-2 flex-wrap"
            >
              <b-badge
                variant="info"
                v-b-tooltip.hover
                :title="`Campagnes Actives : ${resumeGlobal.campagnes_actives}`"
              >
               Campagnes Actives :  {{ resumeGlobal.campagnes_actives }}
              </b-badge>
              <b-badge
                variant="info"
                v-b-tooltip.hover
                :title="`Total Programmes : ${resumeGlobal.total_programmes}`"
              >
                Programmes : {{ resumeGlobal.total_programmes }}
              </b-badge>
              <b-badge
                variant="info"
                v-b-tooltip.hover
                :title="`Taux Global : ${resumeGlobal.taux_global_execution.toFixed(
                  2
                )} %`"
              >
               Taux Global  : {{ resumeGlobal.taux_global_execution.toFixed(2) }} %
              </b-badge>
            </span>
          </b-card-header>

          <b-card-body class="p-0">
            <div class="table-responsive">
              <b-table
                :items="campagnes"
                :fields="tableFields"
                striped
                hover
                responsive
                class="mb-0"
              >
                <!-- Colonne Titre -->
                <template #cell(campagne_titre)="data">
                  <div>
                    <strong>{{ data.item.campagne_titre }}</strong>
                    <br />
                    <small class="text-muted">{{
                      data.item.campagne_description
                    }}</small>
                  </div>
                </template>

                <!-- Colonne Période -->
                <template #cell(periode)="data">
                  <div>
                    <small>Du {{ formatDate(data.item.date_debut) }}</small>
                    <br />
                    <small>Au {{ formatDate(data.item.date_fin) }}</small>
                  </div>
                </template>

                <!-- Colonne Taux d'Exécution -->
                <template #cell(taux_execution)="data">
                  <div class="d-flex align-items-center">
                    <div class="progress flex-grow-1 me-2" style="height: 8px">
                      <div
                        class="progress-bar"
                        :class="getProgressBarClass(data.item.taux_execution)"
                        :style="{ width: data.item.taux_execution + '%' }"
                      ></div>
                    </div>
                    <small class="fw-bold"
                      >{{ data.item.taux_execution }}%</small
                    >
                  </div>
                </template>

                <!-- Colonne Taux Diffusé -->
                <template #cell(taux_diffuse)="data">
                  <div class="d-flex align-items-center">
                    <div class="progress flex-grow-1 me-2" style="height: 8px">
                      <div
                        class="progress-bar"
                        :class="getProgressBarClass(data.item.taux_diffuse)"
                        :style="{ width: data.item.taux_diffuse + '%' }"
                      ></div>
                    </div>
                    <small class="fw-bold">{{ data.item.taux_diffuse }}%</small>
                  </div>
                </template>

                <!-- Colonne Statut -->
                <template #cell(statut)="data">
                  <b-badge :variant="getStatutVariant(data.item)">
                    {{ getStatutLabel(data.item) }}
                  </b-badge>
                </template>

                <!-- Colonne Actions -->
                <template #cell(actions)="data">
                  <b-button-group size="sm">
                    <b-button
                      variant="outline-primary"
                      @click="voirDetails(data.item)"
                      v-b-tooltip.hover
                      title="Voir les détails"
                    >
                      <i class="mdi mdi-eye"></i>
                    </b-button>
                  </b-button-group>
                </template>
              </b-table>
            </div>
          </b-card-body>
        </b-card>
      </b-col>
    </b-row>

    <!-- Modal Détails Campagne -->
    <b-modal
      id="modal-details"
      v-model="showDetailsModal"
      title="Détails de la Campagne"
      size="xl"
      dialog-class="modal-fullscreen"
      content-class="p-0"
      hide-footer
    >
      <CampagneDetails
        v-if="campagneSelectionnee"
        :campagne="campagneSelectionnee"
        @close="showDetailsModal = false"
      />
    </b-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { commanditaireService } from "@/services/commanditaire";
import type { Commanditaire } from "@/services/commanditaire";
import { categorieService } from "@/services/categorie";
import type { Categorie } from "@/services/categorie";
import { campagnesStatistiquesService } from "@/services/campagnes-statistiques.service";

import type {
  StatistiqueCampagne,
  ResumGlobal,
  FiltresRecherche,
} from "@/services/campagnes-statistiques.service";
import StatisticsCard from "@/views/dashboards/components/StatisticsCard.vue";
import CampagneDetails from "@/views/dashboards/components/CampagneDetails.vue";

// État réactif
const loading = ref(false);
const campagnes = ref<StatistiqueCampagne[]>([]);
const resumeGlobal = ref<ResumGlobal | null>(null);
const showDetailsModal = ref(false);
const campagneSelectionnee = ref<StatistiqueCampagne | null>(null);
const commanditaires = ref<{ value: number; text: string }[]>([]);
const categories = ref<{ value: number; text: string }[]>([]);

// Filtres
const filtres = ref<FiltresRecherche>({
  date_debut: "",
  date_fin: "",
  commanditaire_id: undefined,
  category_id: undefined,
});

// Configuration du tableau
const tableFields = [
  { key: "campagne_titre", label: "Campagne", sortable: true },
  { key: "commanditaire", label: "Commanditaire", sortable: true },
  { key: "categorie", label: "Catégorie", sortable: true },
  { key: "periode", label: "Période" },
  { key: "taux_execution", label: "Taux Exécution", sortable: true },
  { key: "taux_diffuse", label: "Taux Diffusé", sortable: true },
  { key: "statut", label: "Statut" },
  { key: "actions", label: "Actions" },
];

const statsGlobalesCampagne = computed(
  () =>
    resumeGlobal.value || {
      total_campagnes: 0,
      campagnes_actives: 0,
      total_programmes: 0,
      taux_global_execution: 0,
    }
);

// Méthodes
const chargerCommanditaires = async () => {
  try {
    const rawData = (await commanditaireService.getAll()) as unknown as {
      commanditaires: Commanditaire[];
    };

    const data: Commanditaire[] = rawData.commanditaires;

    commanditaires.value = data.map((c) => ({
      value: c.id,
      text: c.nom || c.raison_social || "Sans nom",
    }));
  } catch (error) {
    console.error("Erreur chargement commanditaires:", error);
  }
};

const chargerCategories = async () => {
  try {
    const data: Categorie[] = await categorieService.getAll();
    categories.value = data.map((cat) => ({
      value: cat.id,
      text: cat.produit || "Sans nom",
    }));
  } catch (error) {
    console.error("Erreur chargement catégories:", error);
  }
};

const chargerDonnees = async () => {
  try {
    loading.value = true;

    // Charger les données en parallèle
    const [statistiques, resume] = await Promise.all([
      campagnesStatistiquesService.getStatistiquesGlobales(),
      campagnesStatistiquesService.getResumeGlobal(),
    ]);

    campagnes.value = statistiques;
    resumeGlobal.value = resume;
  } catch (error) {
    console.error("Erreur lors du chargement des données:", error);
    // Gérer l'erreur (toast, notification, etc.)
  } finally {
    loading.value = false;
  }
};

const rechercherCampagnes = async () => {
  try {
    loading.value = true;

    // Nettoyer les filtres vides
    const filtresActifs = Object.fromEntries(
      Object.entries(filtres.value).filter(
        ([_, v]) => v !== "" && v !== null && v !== undefined
      )
    );

    if (Object.keys(filtresActifs).length > 0) {
      campagnes.value =
        await campagnesStatistiquesService.rechercherAvecFiltres(filtresActifs);
    } else {
      campagnes.value =
        await campagnesStatistiquesService.getStatistiquesGlobales();
    }
  } catch (error) {
    console.error("Erreur lors de la recherche:", error);
  } finally {
    loading.value = false;
  }
};

const reinitialiserFiltres = () => {
  filtres.value = {
    date_debut: "",
    date_fin: "",
    commanditaire_id: undefined,
    category_id: undefined,
  };
  chargerDonnees();
};

const voirDetails = (campagne: StatistiqueCampagne) => {
  campagneSelectionnee.value = campagne;
  showDetailsModal.value = true;
};

// Utilitaires
const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("fr-FR");
};

const getProgressBarClass = (taux: number) => {
  if (taux >= 90) return "bg-success";
  if (taux >= 70) return "bg-warning";
  return "bg-danger";
};

const getStatutVariant = (campagne: StatistiqueCampagne) => {
  const now = new Date();
  const dateDebut = new Date(campagne.date_debut);
  const dateFin = new Date(campagne.date_fin);

  if (now < dateDebut) return "secondary";
  if (now >= dateDebut && now <= dateFin) return "success";
  return "primary";
};

const getStatutLabel = (campagne: StatistiqueCampagne) => {
  const now = new Date();
  const dateDebut = new Date(campagne.date_debut);
  const dateFin = new Date(campagne.date_fin);

  if (now < dateDebut) return "À venir";
  if (now >= dateDebut && now <= dateFin) return "En cours";
  return "Terminée";
};

// Lifecycle

onMounted(() => {
  chargerDonnees();
  chargerCommanditaires();
  chargerCategories();
});
</script>

<style scoped>

.modal-fullscreen {
  width: 80vw;
  max-width: 80vw;
  height: 80vh;
  margin: auto; 
}

.modal-fullscreen .modal-content {
  height: 80vh;
  border-radius: 0;
}


.campagnes-dashboard {
  padding: 0;
}

.progress {
  background-color: #e9ecef;
}

.table th {
  border-top: none;
  font-weight: 600;
  font-size: 0.875rem;
  color: #495057;
}

.table td {
  vertical-align: middle;
}

.card-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}
</style>
