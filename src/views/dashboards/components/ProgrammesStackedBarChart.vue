
<template>
  <div class="w-100 p-3">
    <h5 class="mb-3">Diffusions par mois (diffusés / non diffusés / non suivis)</h5>
    <apexchart
      v-if="series[0].data.length > 0"
      type="bar"
      width="100%"
      height="450"
      :options="chartOptions"
      :series="series"
    />
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import ApexCharts from 'vue3-apexcharts';
import { statistiquesService } from '@/services/statistiques.service';

const series = ref([
  { name: 'Diffusés', data: [] as number[] },
  { name: 'Non diffusés', data: [] as number[] },
  { name: 'Non suivis', data: [] as number[] }
]);

const chartOptions = ref({} as any); // Déclaration vide au début

onMounted(async () => {
  try {
    const response = await statistiquesService.getProgrammesStackedParMois();

    series.value[0].data = response.diffuses;
    series.value[1].data = response.non_diffuses;
    series.value[2].data = response.non_suivis;

    chartOptions.value = {
      chart: {
        stacked: true,
        toolbar: { show: false }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '50%'
        }
      },
      xaxis: {
        categories: response.mois  // Ici tu injectes bien les mois libellés
      },
      yaxis: {
        title: {
          text: 'Nombre de diffusions'
        }
      },
      colors: ['#28a745', '#dc3545', '#ffc107'],
      legend: {
        position: 'top'
      },
      tooltip: {
        y: {
          formatter: (val: number) => `${val} programme(s)`
        }
      }
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques :', error);
  }
});
</script>
