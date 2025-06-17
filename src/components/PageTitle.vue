<template>
  <div class="page-title-box">
    <h4 class="mb-0 font-size-18">{{ title }}</h4>
    <div class="page-title-right" v-if="action">
      <h5 class="font-size-14 mb-0 text-muted">
        {{ action.type }} {{ action.element }}
      </h5>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ActionProps {
  type: string;
  element: string;
}

interface Props {
  title: string;
  action?: ActionProps;
}

defineProps<Props>();
</script>

<style scoped>
.page-title-box {
  padding: 1.5rem;
  background-color: #fff;
  box-shadow: 0 0.75rem 1.5rem rgba(18,38,63,.03);
  margin-bottom: 1.5rem;
  border-radius: 0.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>