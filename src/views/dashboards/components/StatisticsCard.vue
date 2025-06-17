<!-- src/views/dashboard/components/StatisticsCard.vue-->.







<template>
  <b-card no-body>
    <b-card-body>
      <b-row>
        <b-col cols="6">
          <div class="avatar-md bg-light bg-opacity-50 rounded">
            <div class="avatar-title">
              <Icon :icon="item.icon" class="fs-32 text-success" />
            </div>
          </div>
        </b-col>
        <b-col cols="6" class="text-end">
          <p class="text-muted mb-0 text-truncate">{{ item.title }}</p>
          <h3 class="text-dark mt-1 mb-0">{{ item.prefix }}{{ statValue }}{{ item.suffix }}</h3>
        </b-col>
      </b-row>
    </b-card-body>
    <b-card-footer class="border-0 py-2 bg-light bg-opacity-50">
      <div class="d-flex align-items-center justify-content-between" />
    </b-card-footer>
  </b-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import type { PropType } from "vue";
import type { StatisticCardType } from "@/types";
import { Icon } from "@iconify/vue";
import { statistiquesService } from "@/services/statistiques.service";

const props = defineProps({
  item: {
    type: Object as PropType<StatisticCardType>,
    required: true,
  },
});

const statValue = ref<number>(0);

onMounted(async () => {
  try {
    const stats = await statistiquesService.getGlobalStats();
    statValue.value = stats[props.item.key] ?? 0;
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques :", error);
  }
});
</script>





