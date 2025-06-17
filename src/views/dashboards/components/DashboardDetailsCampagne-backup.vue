<template>
  <div class="dashboard-container">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Chargement des statistiques...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="error-message">
        <h3>Erreur de chargement</h3>
        <p>{{ error }}</p>
        <button @click="loadData" class="retry-btn">Réessayer</button>
      </div>
    </div>

    <!-- Dashboard Content -->
    <div v-else class="dashboard-content">
      <!-- Header with Campaign Info -->
     <!-- <div class="dashboard-header">
        <div class="campaign-info">
          <h1>{{ statistiquesDetail?.campagne_info.titre }}</h1>
          <p class="campaign-meta">
            <span>{{ statistiquesDetail?.campagne_info.commanditaire }}</span>
            <span class="separator">•</span>
            <span>{{ statistiquesDetail?.campagne_info.categorie }}</span>
          </p>
          <p class="campaign-period">
            {{ formatDate(statistiquesDetail?.campagne_info.date_debut) }} -
            {{ formatDate(statistiquesDetail?.campagne_info.date_fin) }}
          </p>
        </div>
      </div>
    -->

      <!-- KPI Cards -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-icon">📊</div>
          <div class="kpi-content">
            <h3>{{ resumeExecutif?.total_programmes_planifies || 0 }}</h3>
            <p>Programmes planifiés</p>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon">✅</div>
          <div class="kpi-content">
            <h3>{{ resumeExecutif?.total_programmes_diffuses || 0 }}</h3>
            <p>Programmes diffusés</p>
          </div>
        </div>

        <!-- <div class="kpi-card">
          <div class="kpi-icon">📈</div>
          <div class="kpi-content">
            <h3>{{ statistiquesPerformance?.taux_execution || 0 }}%</h3>
            <p>Taux d'exécution</p>
          </div>
        </div>
        -->
        <!-- 
         <div class="kpi-card">
          <div class="kpi-icon">📺</div>
          <div class="kpi-content">
            <h3>{{ /*statistiquesDetail?.medias_impliques.total */|| 0 }}</h3>
            <p>Médias impliqués</p>
          </div>
        </div>
        -->



      </div>
      

        <!-- Résumé exécutif -->
          <div class="summary-card mb-4">
          <div class="summary-content">
            <div class="summary-item">
              <span class="label">Durée de campagne:</span>
              <span class="value">{{ resumeExecutif?.duree_jours }} jours</span>
            </div>
            <div class="summary-item">
              <span class="label">Agents impliqués:</span>
              <span class="value">{{ resumeExecutif?.nombre_agents }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Spots publicitaires:</span>
              <span class="value">{{
                resumeExecutif?.nombre_spots_uniques
              }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Programmes non suivis:</span>
              <span class="value">{{
                resumeExecutif?.programmes_non_suivis
              }}</span>
            </div>
                        <div class="summary-item">
              <span class="label">Medias impliqués:</span>
              <span class="value">
            {{ statistiquesDetail?.medias_impliques.total || 0 }}
              </span>
            </div>
          </div>
        </div>

      <!-- Charts Grid -->
      <div class="charts-grid">
        <!-- Performance Pie Chart -->
        <div class="chart-card">
          <div class="chart-header">
            <h3>Répartition des programmes</h3>
          </div>
          <div class="chart-container">
            <canvas ref="performanceChart"></canvas>
          </div>
        </div>

<!-- Agents Table -->
<div class="agents-table-container mb-4">
  <div class="table-card">
    <div class="table-header">
      <h3>Agents impliqués dans la campagne</h3>
      <span class="agent-count">{{ statistiquesDetail?.agents_associes.total || 0 }} agents</span>
    </div>
    <div class="table-responsive ">
      <table class="agents-table">
<thead>
  <tr>
    <th>Nom</th>
    <th>Prénom</th>
    <th>Total</th>
    <th>Diffusés</th>
    <th>Non diffusés</th>
    <th>En attente</th>
    <th>Taux d'exécution</th>
  </tr>
</thead>
        <tbody>
 <tr v-for="agent in statistiquesDetail?.agents_associes.details" :key="agent.id">
    <td>{{ agent.nom }}</td>
    <td>{{ agent.prenom }}</td>
    <td>
      <span class="stat-badge total">{{ agent.statistiques.total_programmes }}</span>
    </td>
    <td>
      <span class="stat-badge success">{{ agent.statistiques.programmes_diffuses }}</span>
    </td>
    <td>
      <span class="stat-badge danger">{{ agent.statistiques.programmes_non_diffuses }}</span>
    </td>
    <td>
      <span class="stat-badge warning">{{ agent.statistiques.programmes_en_attente }}</span>
    </td>
    <td>
      <span>
        {{ agent.statistiques.taux_execution }}%
      </span>
    </td>
  </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>
        <!-- Programmes Evolution Line Chart -->
        <div class="chart-card">
          <div class="chart-header">
            <h3>Évolution par mois</h3>
          </div>
          <div class="chart-container">
            <canvas ref="evolutionChart"></canvas>
          </div>
        </div>

        <!-- Media Types Bar Chart -->
         <!--  <div class="chart-card">
          <div class="chart-header">
            <h3>Répartition par type de média</h3>
          </div>
          <div class="chart-container">
            <canvas ref="mediaChart"></canvas>
          </div>
        </div>  -->

        <!-- Time Slots Doughnut Chart -->
        <div class="chart-card">
          <div class="chart-header">
            <h3>Répartition par tranche horaire</h3>
          </div>
          <div class="chart-container">
            <canvas ref="timeSlotsChart"></canvas>
          </div>
        </div>
      </div>






      <!-- Summary Cards -->
     <!--   <div class="summary-grid">


        <div class="summary-card">
          <h4>Détails des médias</h4>
          <div class="media-list">
            <div
              v-for="media in statistiquesDetail?.medias_impliques.details.slice(
                0,
                5
              )"
              :key="media.id"
              class="media-item"
            >
              <span class="media-name">{{ media.nom }}</span>
              <span class="media-type" :class="media.type.toLowerCase()">{{
                media.type
              }}</span>
            </div>
            <div
              v-if="
                (statistiquesDetail?.medias_impliques.details.length || 0) > 5
              "
              class="more-items"
            >
              +{{
                (statistiquesDetail?.medias_impliques.details.length || 0) - 5
              }}
              autres médias
            </div>
          </div>
        </div>
      </div>  -->


    </div>
  </div>
  <div class="pb-4"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed, watch, onUnmounted } from 'vue';
import { Chart, registerables } from "chart.js";
import CampagnesDetailStatistiquesService, {
  type StatistiquesDetailCampagne,
  type StatistiquesPerformance,
  type StatistiquesTrancheHoraire,
  type ResumeExecutif,
} from "@/services/campagnes-detail-statistiques.service";

// Register Chart.js components
Chart.register(...registerables);

// Props
interface Props {
  campagne_id: number;
}

const props = defineProps<Props>();

// Reactive data
const statistiquesDetail = ref<StatistiquesDetailCampagne | null>(null);
const statistiquesPerformance = ref<StatistiquesPerformance | null>(null);
const statistiquesTrancheHoraire = ref<StatistiquesTrancheHoraire | null>(null);
const resumeExecutif = ref<ResumeExecutif | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

// Chart refs
const performanceChart = ref<HTMLCanvasElement>();
const evolutionChart = ref<HTMLCanvasElement>();
const mediaChart = ref<HTMLCanvasElement>();
const timeSlotsChart = ref<HTMLCanvasElement>();

watch(
  () => props.campagne_id,
  (newId, oldId) => {
    if (newId && newId !== oldId) {
      // Nettoyer les anciens graphiques
      destroyCharts();
      // Recharger les données
      loadData();
    }
  }
);

// Chart instances
let performanceChartInstance: Chart | null = null;
let evolutionChartInstance: Chart | null = null;
let mediaChartInstance: Chart | null = null;
let timeSlotsChartInstance: Chart | null = null;

// Methods

const destroyCharts = () => {
  if (performanceChartInstance) {
    performanceChartInstance.destroy();
    performanceChartInstance = null;
  }
  if (evolutionChartInstance) {
    evolutionChartInstance.destroy();
    evolutionChartInstance = null;
  }
  if (mediaChartInstance) {
    mediaChartInstance.destroy();
    mediaChartInstance = null;
  }
  if (timeSlotsChartInstance) {
    timeSlotsChartInstance.destroy();
    timeSlotsChartInstance = null;
  }
};




const loadData = async () => {
  if (!props.campagne_id) return;

  loading.value = true;
  error.value = null;

  try {
    const [detail, performance, trancheHoraire, resume] = await Promise.all([
      CampagnesDetailStatistiquesService.getStatistiquesDetail(props.campagne_id),
      CampagnesDetailStatistiquesService.getStatistiquesPerformance(props.campagne_id),
      CampagnesDetailStatistiquesService.getStatistiquesParTrancheHoraire(props.campagne_id),
      CampagnesDetailStatistiquesService.getResumeExecutif(props.campagne_id),
    ]);

    statistiquesDetail.value = detail;
    statistiquesPerformance.value = performance;
    statistiquesTrancheHoraire.value = trancheHoraire;
    resumeExecutif.value = resume;

   
    await nextTick();
    await nextTick(); 
    createCharts();
  } catch (err: any) {
    error.value = err.response?.data?.message || "Erreur lors du chargement des données";
    console.error("Erreur de chargement:", err);
  } finally {
    loading.value = false;
  }
};
const formatDate = (dateString?: string) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("fr-FR");
};

const createCharts = () => {

  setTimeout(() => {
    createPerformanceChart();
    createEvolutionChart();
    createMediaChart();
    createTimeSlotsChart();
  }, 100);
};

const createPerformanceChart = () => {
  if (!performanceChart.value || !statistiquesPerformance.value) return;

  const ctx = performanceChart.value.getContext("2d");
  if (!ctx) return;

  performanceChartInstance = new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["Diffusés", "Non diffusés", "En attente"],
      datasets: [
        {
          data: [
            statistiquesPerformance.value.programmes_diffuses,
            statistiquesPerformance.value.programmes_non_diffuses,
            statistiquesPerformance.value.programmes_en_attente,
          ],
          backgroundColor: ["#10B981", "#EF4444", "#F59E0B"],
          borderWidth: 2,
          borderColor: "#fff",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
        },
      },
    },
  });
};

const createEvolutionChart = () => {
  if (!evolutionChart.value || !statistiquesDetail.value) return;

  const ctx = evolutionChart.value.getContext("2d");
  if (!ctx) return;

  const monthlyData = statistiquesDetail.value.programmes_totaux.par_mois;
  const diffusedData = statistiquesDetail.value.programmes_diffuses.par_mois;

  const labels = Object.keys(monthlyData).sort();
  const totalData = labels.map((month) => monthlyData[month] || 0);
  const diffusedDataValues = labels.map((month) => diffusedData[month] || 0);

  evolutionChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels.map((month) => {
        const [year, monthNum] = month.split("-");
        return `${monthNum}/${year}`;
      }),
      datasets: [
        {
          label: "Programmes planifiés",
          data: totalData,
          borderColor: "#3B82F6",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          fill: true,
          tension: 0.4,
        },
        {
          label: "Programmes diffusés",
          data: diffusedDataValues,
          borderColor: "#10B981",
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          fill: true,
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
        },
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
};

const createMediaChart = () => {
  if (!mediaChart.value || !statistiquesDetail.value) return;

  const ctx = mediaChart.value.getContext("2d");
  if (!ctx) return;

  const mediaData = statistiquesDetail.value.medias_impliques.par_type;

  mediaChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Radio", "TV"],
      datasets: [
        {
          label: "Nombre de médias",
          data: [mediaData.RADIO, mediaData.TV],
          backgroundColor: ["#8B5CF6", "#EC4899"],
          borderRadius: 8,
          borderSkipped: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
          },
        },
      },
    },
  });
};

const createTimeSlotsChart = () => {
  if (!timeSlotsChart.value || !statistiquesTrancheHoraire.value) return;

  const ctx = timeSlotsChart.value.getContext("2d");
  if (!ctx) return;

  const labels: string[] = [];
  const data: number[] = [];

  Object.entries(statistiquesTrancheHoraire.value).forEach(
    ([tranche, info]) => {
      labels.push(tranche.replace("TRANCHE ", ""));
      data.push(info.nombre_programmes);
    }
  );

  timeSlotsChartInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [
        {
          data,
          backgroundColor: [
            "#F59E0B",
            "#EF4444",
            "#8B5CF6",
            "#10B981",
            "#6B7280",
          ],
          borderWidth: 2,
          borderColor: "#fff",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
        },
      },
    },
  });
};

// Lifecycle
onMounted(() => {
  loadData();
});
onUnmounted(() => {
  destroyCharts();
});
</script>

<style scoped>


.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  color: white;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error-message {
  text-align: center;
  background: rgba(239, 68, 68, 0.1);
  backdrop-filter: blur(10px);
  padding: 2rem;
  border-radius: 1rem;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.retry-btn {
  background: #ef4444;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  margin-top: 1rem;
  transition: background-color 0.3s;
}

.retry-btn:hover {
  background: #dc2626;
}

.dashboard-content {
  max-width: 1400px;
  margin: 0 auto;
}

.dashboard-header {
  backdrop-filter: blur(10px);
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.campaign-info h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.campaign-meta {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}

.separator {
  margin: 0 0.5rem;
}

.campaign-period {
  font-size: 1rem;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.kpi-card {

  backdrop-filter: blur(10px);
  border-radius: 1rem;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border: none;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: transform 0.2s ease;
}

.kpi-card:hover {
  transform: translateY(-2px);
}

.kpi-icon {
  font-size: 2rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
}

.kpi-content h3 {
  font-size: 2rem;
  font-weight: bold;
  margin: 0;
}

.kpi-content p {
  margin: 0;
  font-size: 0.9rem;
}



.chart-card {
  backdrop-filter: blur(10px);
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid rgba(84, 65, 65, 0.2);
  width: 100%;
  max-width: 100%;
  box-sizing: border-box; 
}

.chart-header {
  margin-bottom: 1rem;
}

.chart-header h3 {
  font-size: 1.2rem;
  margin: 0;
}

.chart-container {
  height: 300px;
  position: relative;
}

.summary-grid {
  display: grid;
  grid-template-columns: 1fr; 
  gap: 2rem;
  width: 100%;
}


.summary-card {
  width: 100%;
  max-width: 100%;
  backdrop-filter: blur(10px);
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid rgba(84, 65, 65, 0.2);
  box-sizing: border-box;
}

.summary-card h4 {
  font-size: 1.3rem;
  margin: 0 0 1rem 0;
}

.summary-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}


.summary-item .value {
  font-weight: bold;
}

.media-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.media-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  border-radius: 0.5rem;
}

.media-name {
  font-weight: 500;
}

.media-type {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.8rem;
  font-weight: bold;
}

.media-type.radio {
  background: #8b5cf6;
  color: white;
}

.media-type.tv {
  background: #ec4899;
}

.more-items {
  font-style: italic;
  text-align: center;
  padding: 0.5rem;
}



.charts-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
  width: 100%; 
}


/* Responsive Design */

@media (min-width: 1600px) {
  .dashboard-content {
    max-width: 100%; 
    margin: 0 auto;
    padding: 0 2rem; 
  }
  
  .summary-card,
  .table-card,
  .chart-card {
    width: 100%;
    max-width: none;
  }
}




@media (min-width: 768px) and (max-width: 1199px) {
  .charts-grid {
    grid-template-columns: 1fr; /* Reste en une colonne sur tablettes */
  }
}

/* Media queries pour mobile - mise à jour */
@media (max-width: 768px) {
  .dashboard-container {
    padding: 1rem;
  }


  .kpi-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .summary-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .campaign-info h1 {
    font-size: 2rem;
  }

  /* Assurer que tous les éléments restent à 100% sur mobile */
  .summary-card,
  .table-card,
  .chart-card {
    width: 100%;
    margin: 0;
  }
}
@media (max-width: 768px) {
  .dashboard-container {
    padding: 1rem;
  }

  .kpi-grid {
    grid-template-columns: 1fr;
  }


  .campaign-info h1 {
    font-size: 2rem;
  }
}




.agents-table-container {
  margin-top: 2rem;
  width: 100%;
  max-width: 100%; 
}


.table-card {
  width: 100%;
  max-width: 100%; 
  backdrop-filter: blur(10px);
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid rgba(84, 65, 65, 0.2);
  box-sizing: border-box;
}


.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.table-header h3 {
  font-size: 1.3rem;
  margin: 0;
}

.agent-count {
  background: rgba(59, 130, 246, 0.2);
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  font-size: 0.9rem;
  font-weight: 500;
}

.table-responsive {
  overflow-x: auto;
}

.agents-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

.agents-table th,
.agents-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.agents-table th {
  background: rgba(255, 255, 255, 0.05);
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.agents-table tbody tr:hover {
  background: rgba(255, 255, 255, 0.05);
  transition: background-color 0.2s ease;
}

.btn-contact {
  background: #10B981;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.85rem;
  transition: background-color 0.2s ease;
}

.btn-contact:hover {
  background: #059669;
}

/* Responsive pour le tableau */
@media (max-width: 768px) {
  .table-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .agents-table th,
  .agents-table td {
    padding: 0.75rem 0.5rem;
    font-size: 0.9rem;
  }
}
</style>
