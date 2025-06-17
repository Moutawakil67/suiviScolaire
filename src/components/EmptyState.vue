<template>
  <div class="empty-state">
    <div class="empty-state-icon">
      <i :class="icon"></i>
    </div>
    <h4 class="empty-state-title">{{ title }}</h4>
    <p class="empty-state-description text-muted">{{ description }}</p>
    <b-button v-if="actionLabel" :variant="actionVariant" @click="$emit('action')">
      {{ actionLabel }}
    </b-button>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string;
  description: string;
  icon?: string;
  actionLabel?: string;
  actionVariant?: string;
}

withDefaults(defineProps<Props>(), {
  icon: 'bx bx-info-circle',
  actionVariant: 'primary'
});

defineEmits(['action']);
</script>

<style scoped>
.empty-state {
  text-align: center;
  padding: 2rem;
}

.empty-state-icon {
  font-size: 3rem;
  color: #74788d;
  margin-bottom: 1rem;
}

.empty-state-title {
  margin-bottom: 0.5rem;
  color: #495057;
}

.empty-state-description {
  margin-bottom: 1.5rem;
}
</style>