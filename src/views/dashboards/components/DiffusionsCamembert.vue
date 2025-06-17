

<template>

      <div class="w-100 pt-5">
        <!-- Titre -->
        <b-card-title class="text-center">Diffusions</b-card-title>

        <!-- Total affiché au centre -->
        <div class="text-center mb-3">
          <h2 class="mb-1">{{ total }}</h2>
          <p class="text-muted mb-0">Total des diffusions</p>
        </div>

        <!-- Camembert, contenu étirable mais sans débordement -->
        <div class="d-flex align-items-center justify-content-center">
          <ApexChart
            :options="chartOptions"
            :series="series"
            type="pie"
            height="350"
            width="100%"
          />
        </div>
      </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import ApexChart from 'vue3-apexcharts';
import type { DiffusionsStatsType } from '@/services/statistiques.service';
import { statistiquesService } from '@/services/statistiques.service';

// Valeurs
const stats = ref<DiffusionsStatsType[]>([]);
const series = ref<number[]>([]);
const total = ref<number>(0);

const chartOptions = ref({
  chart: { type: 'pie' },
  labels: [] as string[],
  colors: [] as string[],
  legend: { position: 'bottom' },
  dataLabels: { enabled: true },
});

function updateStats(newStats: DiffusionsStatsType[]) {
  stats.value = newStats;
  series.value = newStats.map(s => s.value);
  chartOptions.value = {
    ...chartOptions.value,
    labels: newStats.map(s => s.label),
    colors: newStats.map(s => s.color),
  };
}


async function fetchStats() {
  try {
    const res = await statistiquesService.getDiffusionsStatsCamembert(); 
    total.value = res.total;
    updateStats(res.data);
  } catch (error) {
    console.error('Erreur lors du chargement des statistiques :', error);
  }
}

onMounted(fetchStats);
</script>
