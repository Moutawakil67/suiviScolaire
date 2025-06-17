<!-- src/views/dashboards/components/CampagneDetails.vue -->

<template>
  <div class="campagne-details">
    <!-- En-tête avec informations principales -->
    <b-row class="mb-4 dashboard-header">
      <b-col>
        <div class="d-flex justify-content-between align-items-start">
          <div>
            <h1 class="mb-2">{{ campagne.campagne_titre }} </h1>
            <h2 class="mb-1">{{ campagne.campagne_description }}</h2>
            <div class="d-flex gap-3 flex-wrap">
              <small><strong>Commanditaire:</strong> {{ campagne.commanditaire }}</small>
              <small><strong>Catégorie:</strong> {{ campagne.categorie }}</small>
              <small><strong>Période:</strong> {{ formatDate(campagne.date_debut) }} - {{ formatDate(campagne.date_fin) }}</small>
            </div>
          </div>
          <b-badge :variant="getStatutVariant()" size="lg">
            {{ getStatutLabel() }}
          </b-badge>
        </div>
      </b-col>
    </b-row>

    <!-- Métriques principales -->
    <b-row class="mb-4">
      <b-col md="6">
        <b-card class="text-center h-100 metric-card campaign-info">
          <div class="metric-icon bg-primary-light mb-2">
            <i class="mdi mdi-target text-primary"></i>
          </div>
          <h3 class="text-primary mb-1">{{ campagne.taux_execution }}%</h3>
          <p class="mb-0 text-muted">Taux d'Exécution</p>
          <div class="progress mt-2" style="height: 6px;">
            <div
              class="progress-bar bg-primary"
              :style="{ width: campagne.taux_execution + '%' }"
            ></div>
          </div>
        </b-card>
      </b-col>
      <b-col md="6">
        <b-card class="text-center h-100 metric-card">
          <div class="metric-icon bg-success-light mb-2">
            <i class="mdi mdi-broadcast text-success"></i>
          </div>
          <h3 class="text-success mb-1">{{ campagne.taux_diffuse }}%</h3>
          <p class="mb-0 text-muted">Taux Diffusé</p>
          <div class="progress mt-2" style="height: 6px;">
            <div
              class="progress-bar bg-success"
              :style="{ width: campagne.taux_diffuse + '%' }"
            ></div>
          </div>
        </b-card>
      </b-col>

<!--
      <b-col md="4">
        <b-card class="text-center h-100 metric-card">
          <div class="metric-icon bg-info-light mb-2">
            <i class="mdi mdi-playlist-play text-info"></i>
          </div>
          <h3 class="text-info mb-1">{{/* campagne.statistiques_detaillees.total_programmes */}}</h3>
          <p class="mb-0 text-muted">Total Programmes</p>
          <small class="text-muted">
            {{ /*campagne.statistiques_detaillees.programmes_par_statut.diffuse */}} diffusés
          </small>
        </b-card>
      </b-col>
 -->

    </b-row>

<div>

<DashboardDetailsCampagne :campagne_id="campagne.campagne_id" />
</div>

    <!-- Graphiques et détails -->
    <b-row class="mb-4">
      <!-- Répartition par statut -->
    
     <!--  <b-col md="6">
        <b-card class="h-100">
          <b-card-header class="d-flex justify-content-between align-items-center">
            <h6 class="mb-0">
              <i class="mdi mdi-chart-donut me-2"></i>
              Répartition par Statut
            </h6>
            <b-button 
              size="sm" 
              variant="outline-secondary"
              @click="refreshChart"
              v-b-tooltip.hover
              title="Actualiser le graphique"
            >
              <i class="mdi mdi-refresh"></i>
            </b-button>
          </b-card-header>
          <b-card-body class="d-flex justify-content-center align-items-center">
            <canvas ref="statutChart" width="300" height="300"></canvas>
          </b-card-body>
        </b-card>
      </b-col> -->

      <!-- Taux par chaîne -->
      <b-col md="12">
        <b-card class="h-100">
          <b-card-header>
            <h6 class="mb-0">
              <i class="mdi mdi-television me-2"></i>
              Performance par Média
            </h6>
          </b-card-header>
          <b-card-body class="p-0">
            <div class="table-responsive" style="max-height: 300px; overflow-y: auto;">
              <table class="table table-sm table-hover mb-0">
                <thead class="bg-light sticky-top">
                  <tr>
                    <th>Média</th>
                    <th>Type</th>
                    <th>Performance</th>
                    <th class="text-center">Détail</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="chaine in campagne.taux_diffuse_par_chaine" :key="chaine.chaine_id">
                    <td>
                      <div class="d-flex align-items-center">
                        <i class="mdi mdi-television me-2 text-muted"></i>
                        {{ chaine.chaine_nom }}
                      </div>
                    </td>
                    <td>
                      <b-badge :variant="chaine.chaine_type === 'RADIO' ? 'info' : 'warning'" size="sm">
                        {{ chaine.chaine_type }}
                      </b-badge>
                    </td>
                    <td>
                      <div class="d-flex align-items-center">
                        <div class="progress flex-grow-1 me-2" style="height: 4px; min-width: 60px;">
                          <div
                            class="progress-bar"
                            :class="getProgressBarClass(chaine.taux_diffuse)"
                            :style="{ width: chaine.taux_diffuse + '%' }"
                          ></div>
                        </div>
                        <small class="fw-bold">{{ chaine.taux_diffuse }}%</small>
                      </div>
                    </td>
                    <td class="text-center">
                      <small class="text-muted">
                        {{ chaine.programmes_diffuses }}/{{ chaine.programmes_attendus }}
                      </small>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-if="campagne.taux_diffuse_par_chaine.length === 0" class="text-center py-3 text-muted">
              <i class="mdi mdi-information-outline me-1"></i>
              Aucune donnée de chaîne disponible
            </div>
          </b-card-body>
        </b-card>
      </b-col>
    </b-row>

    <!-- Statistiques détaillées -->
    <b-row class="mb-4">
      <b-col>
        <b-card>
          <b-card-header>
            <h6 class="mb-0">
              <i class="mdi mdi-chart-bar me-2"></i>
              Statistiques Détaillées
            </h6>
          </b-card-header>
          <b-card-body>
            <b-row>
              <!-- Programmes par statut -->
              <b-col md="4">
                <h6 class="text-muted mb-3">
                  <i class="mdi mdi-clipboard-list me-1"></i>
                  État des Programmes
                </h6>
                <div class="statut-list">
                  <div class="statut-item d-flex justify-content-between align-items-center mb-2">
                    <span class="d-flex align-items-center">
                      <div class="status-dot bg-secondary me-2"></div>
                      En attente
                    </span>
                    <b-badge variant="secondary">{{ campagne.statistiques_detaillees.programmes_par_statut.attente }}</b-badge>
                  </div>



                  <div class="statut-item d-flex justify-content-between align-items-center mb-2">
                    <span class="d-flex align-items-center">
                      <div class="status-dot bg-success me-2"></div>
                     Diffusés
                    </span>
                    <b-badge variant="success">
                      {{ campagne.statistiques_detaillees.programmes_par_statut.diffuse + campagne.statistiques_detaillees.programmes_par_statut.en_retard }}                
                    </b-badge>
                  </div>



                  <div class="statut-item d-flex justify-content-between align-items-center mb-2">
                    <span class="d-flex align-items-center">
                      <div class="status-dot bg-danger me-2"></div>
                      Non diffusés
                    </span>
                    <b-badge variant="danger">{{ campagne.statistiques_detaillees.programmes_par_statut.non_diffuse }}</b-badge>
                  </div>
                </div>
              </b-col>

              <!-- Répartition temporelle -->
              <b-col md="4">
                <h6 class="text-muted mb-3">
                  <i class="mdi mdi-clock-outline me-1"></i>
                  Répartition Temporelle
                </h6>
                <div class="temporal-stats">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="d-flex align-items-center">
                      <i class="mdi mdi-clock-plus-outline text-info me-2"></i>
                      À venir
                    </span>
                    <b-badge variant="info">{{ campagne.statistiques_detaillees.programmes_a_venir }}</b-badge>
                  </div>
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="d-flex align-items-center">
                      <i class="mdi mdi-play-circle text-primary me-2"></i>
                      En cours
                    </span>
                    <b-badge variant="primary">{{ campagne.statistiques_detaillees.programmes_en_cours }}</b-badge>
                  </div>
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="d-flex align-items-center">
                      <i class="mdi mdi-clock-end text-dark me-2"></i>
                      Échus
                    </span>
                    <b-badge variant="dark">{{ campagne.statistiques_detaillees.programmes_echus }}</b-badge>
                  </div>
                </div>
              </b-col>

              <!-- Programmes par tranche -->
              <b-col md="4">
                <h6 class="text-muted mb-3">
                  <i class="mdi mdi-timeline-clock me-1"></i>
                  Répartition par Tranche
                </h6>
                <div class="tranche-stats">
                  <div v-for="(count, tranche) in campagne.statistiques_detaillees.programmes_par_tranche" 
                       :key="tranche" 
                       class="d-flex justify-content-between align-items-center mb-2">
                    <span class="d-flex align-items-center">
                      <i :class="getTrancheIcon(tranche)" class="me-2"></i>
                      {{ formatTrancheLabel(tranche) }}
                    </span>
                    <b-badge variant="primary">{{ count }}</b-badge>
                  </div>
                  <div v-if="Object.keys(campagne.statistiques_detaillees.programmes_par_tranche).length === 0" 
                       class="text-center text-muted py-2">
                    <i class="mdi mdi-information-outline me-1"></i>
                    Aucune données de tranche disponible
                  </div>
                </div>
              </b-col>
            </b-row>
          </b-card-body>
        </b-card>
      </b-col>
    </b-row>

    <!-- Actions et boutons -->
    <b-row>
      <b-col class="text-end">
        <b-button-group>
          <b-button variant="secondary" @click="$emit('close')">
            <i class="mdi mdi-close me-1"></i>
            Fermer
          </b-button>
        </b-button-group>
      </b-col>
    </b-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue';
import { Chart, ChartConfiguration } from 'chart.js/auto';
import type { StatistiqueCampagne } from '@/services/campagnes-statistiques.service';
import DashboardDetailsCampagne from '@/views/dashboards/components/DashboardDetailsCampagne.vue'


// Props
interface Props {
  campagne: StatistiqueCampagne;
}

const props = defineProps<Props>();

// Émetteurs d'événements
const emit = defineEmits<{
  close: [];
  refresh: [campagneId: number];
}>();

// Références
const statutChart = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;

// Méthodes utilitaires
const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const getStatutVariant = (): string => {
  const now = new Date();
  const dateDebut = new Date(props.campagne.date_debut);
  const dateFin = new Date(props.campagne.date_fin);
  
  if (now < dateDebut) return 'secondary';
  if (now >= dateDebut && now <= dateFin) return 'success';
  return 'primary';
};

const getStatutLabel = (): string => {
  const now = new Date();
  const dateDebut = new Date(props.campagne.date_debut);
  const dateFin = new Date(props.campagne.date_fin);
  
  if (now < dateDebut) return 'À venir';
  if (now >= dateDebut && now <= dateFin) return 'En cours';
  return 'Terminée';
};

const getProgressBarClass = (taux: number): string => {
  if (taux >= 90) return 'bg-success';
  if (taux >= 70) return 'bg-warning';
  return 'bg-danger';
};

const formatTrancheLabel = (tranche: string): string => {
  const labels: Record<string, string> = {
    'matin': 'Matin (6h-12h)',
    'apres_midi': 'Après-midi (12h-18h)',
    'soir': 'Soir (18h-22h)',
    'nuit': 'Nuit (22h-6h)',
    'prime_time': 'Prime Time (20h-22h)',
    'journee': 'Journée (8h-18h)'
  };
  return labels[tranche] || tranche;
};

const getTrancheIcon = (tranche: string): string => {
  const icons: Record<string, string> = {
    'matin': 'mdi mdi-weather-sunny text-warning',
    'apres_midi': 'mdi mdi-weather-partly-cloudy text-info',
    'soir': 'mdi mdi-weather-sunset text-orange',
    'nuit': 'mdi mdi-weather-night text-dark',
    'prime_time': 'mdi mdi-star text-gold',
    'journee': 'mdi mdi-white-balance-sunny text-primary'
  };
  return icons[tranche] || 'mdi mdi-clock-outline text-muted';
};

// Gestion du graphique
const createChart = async (): Promise<void> => {
  await nextTick();
  
  if (!statutChart.value) return;
  
  // Détruire le graphique existant
  if (chartInstance) {
    chartInstance.destroy();
  }
  
  const ctx = statutChart.value.getContext('2d');
  if (!ctx) return;
  
  const programmes = props.campagne.statistiques_detaillees.programmes_par_statut;
  
  const data = {
  labels: ['En attente', 'Diffusés', 'Non diffusés'],
  datasets: [{
    data: [
      programmes.attente,
      programmes.diffuse + programmes.en_retard,
      programmes.non_diffuse
    ],
    backgroundColor: ['#6c757d', '#28a745', '#dc3545'],
    borderWidth: 2,
    borderColor: '#fff'
  }]
};

  const config: ChartConfiguration = {
    type: 'doughnut',
    data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 20,
            usePointStyle: true,
            font: {
              size: 12
            }
          }
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const label = context.label || '';
              const value = context.parsed;
              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
              const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
              return `${label}: ${value} (${percentage}%)`;
            }
          }
        }
      },
      elements: {
        arc: {
          borderWidth: 2
        }
      }
    }
  };
  
  chartInstance = new Chart(ctx, config);
};

const refreshChart = (): void => {
  createChart();
};

// Actions
const actualiserDonnees = (): void => {
  emit('refresh', props.campagne.campagne_id);
};



// Watchers
watch(() => props.campagne, () => {
  createChart();
}, { deep: true });

// Lifecycle
onMounted(() => {
  createChart();
});
</script>

<style scoped>


.dashboard-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  backdrop-filter: blur(10px);
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
}
.dashboard-header h1,  .dashboard-header h2 {
  color: white;
}

.campagne-details {
  max-width: 100%;
}

.metric-card {
  border: none;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: transform 0.2s ease;
}

.metric-card:hover {
  transform: translateY(-2px);
}

.metric-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.bg-primary-light {
  background-color: rgba(0, 123, 255, 0.1);
}

.bg-success-light {
  background-color: rgba(40, 167, 69, 0.1);
}

.bg-info-light {
  background-color: rgba(23, 162, 184, 0.1);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.statut-item,
.temporal-stats > div,
.tranche-stats > div {
  padding: 8px 0;
  border-bottom: 1px solid #f8f9fa;
}

.statut-item:last-child,
.temporal-stats > div:last-child,
.tranche-stats > div:last-child {
  border-bottom: none;
}

.table th {
  font-weight: 600;
  font-size: 0.875rem;
  color: #495057;
  border-top: none;
}

.table td {
  vertical-align: middle;
}

.sticky-top {
  position: sticky;
  top: 0;
  z-index: 10;
}

.progress {
  background-color: #e9ecef;
}

.card-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .metric-card {
    margin-bottom: 1rem;
  }
  
  .d-flex.gap-3 {
    flex-direction: column;
    gap: 0.5rem !important;
  }
  
  .table-responsive {
    font-size: 0.875rem;
  }
}
</style>