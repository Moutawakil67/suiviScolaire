<template>
  <b-button
    :variant="variant"
    :disabled="isLoading || disabled"
    :pill="pill"
    :class="{
      'btn-loading': isLoading,
      'btn-soft': soft,
      [customClass]: customClass
    }"
    @click="handleClick"
  >
    <div class="d-flex align-items-center justify-content-center">
      <b-spinner v-if="isLoading" small class="me-2" />
      <slot v-if="!isLoading" />
      <span v-else>{{ loadingText }}</span>
    </div>
  </b-button>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

interface Props {
  isLoading?: boolean;
  disabled?: boolean;
  variant?: string;
  pill?: boolean;
  soft?: boolean;
  loadingText?: string;
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  disabled: false,
  variant: 'primary',
  pill: false,
  soft: false,
  loadingText: 'Chargement...',
  customClass: ''
});

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void;
}>();

const handleClick = (event: MouseEvent) => {
  if (!props.isLoading) {
    emit('click', event);
  }
};
</script>

<style scoped>
.btn-loading {
  cursor: not-allowed;
  opacity: 0.8;
}
</style>