<template>
  <div class="search-box">
    <input
      :value="modelValue"
      type="text"
      class="form-control"
      :placeholder="placeholder"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: string;
  placeholder?: string;
}

defineProps<Props>();
defineEmits<{
  'update:modelValue': [value: string];
}>();
</script>

<style scoped>
.search-box {
  max-width: 300px;
}
</style>