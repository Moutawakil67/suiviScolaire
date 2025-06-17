<template>
  <div class="loading-state" :class="{ 'loading-overlay': overlay }">
    <div v-if="type === 'spinner'" class="spinner-wrapper">
      <b-spinner :variant="variant" :type="spinnerType" :small="small" />
      <span v-if="text" class="loading-text ms-2">{{ text }}</span>
    </div>

    <div v-else-if="type === 'skeleton'" class="skeleton-wrapper">
      <div
        v-for="(item, index) in Number(lines)"
        :key="index"
        class="skeleton-line"
        :style="{
          width: typeof width === 'object' ? width[index] || '100%' : width,
          height: typeof height === 'object' ? height[index] || '1rem' : height
        }"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  type?: 'spinner' | 'skeleton';
  variant?: string;
  spinnerType?: 'border' | 'grow';
  small?: boolean;
  text?: string;
  overlay?: boolean;
  lines?: number;
  width?: string | string[];
  height?: string | string[];
}

withDefaults(defineProps<Props>(), {
  type: 'spinner',
  variant: 'primary',
  spinnerType: 'border',
  small: false,
  overlay: false,
  lines: 3,
  width: '100%',
  height: '1rem'
});
</script>

<style scoped>
.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100px;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  z-index: 1000;
}

.spinner-wrapper {
  display: flex;
  align-items: center;
}

.loading-text {
  color: #495057;
}

.skeleton-wrapper {
  width: 100%;
}

.skeleton-line {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>