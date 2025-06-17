<template>
  <div class="d-flex justify-content-between align-items-center mt-4">
    <div class="text-muted">
      Affichage {{ startIndex + 1 }}-{{ endIndex }} sur {{ totalItems }} éléments
    </div>
    <b-pagination
      :model-value="currentPage"
      :total-rows="totalItems"
      :per-page="perPage"
      class="mb-0"
      @update:model-value="handlePageChange"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  currentPage: number;
  totalItems: number;
  perPage: number;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'update:currentPage', value: number): void;
}>();

const startIndex = computed(() => (props.currentPage - 1) * props.perPage);
const endIndex = computed(() => Math.min(startIndex.value + props.perPage, props.totalItems));

const handlePageChange = (value: number) => {
  emit('update:currentPage', value);
};
</script>