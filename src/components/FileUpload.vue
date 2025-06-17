<template>
  <!-- Upload de fichiers simplifié -->
  <div class="simple-file-upload">
    <!-- Input file visible -->
    <div class="mb-3">
      <input
        ref="fileInput"
        type="file"
        :multiple="true"
        :accept="'.pdf,.doc,.docx,.xls,.xlsx,.jpg,.png,.txt'"
        @change="handleFileChange"
        class="form-control"
      />
      <div class="form-text">
        Formats acceptés: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, TXT (Max 10MB par fichier)
      </div>
    </div>

    <!-- Liste des fichiers sélectionnés -->
    <div v-if="selectedFiles.length > 0" class="selected-files">
      <h6>Fichiers sélectionnés ({{ selectedFiles.length }})</h6>
      <div class="list-group">
        <div 
          v-for="(file, index) in selectedFiles" 
          :key="`${file.name}-${file.size}-${index}`"
          class="list-group-item d-flex justify-content-between align-items-center"
        >
          <div>
            <i class="bx bx-file me-2"></i>
            {{ file.name }}
            <small class="text-muted ms-2">({{ formatFileSize(file.size) }})</small>
          </div>
          <button
            type="button"
            class="btn btn-sm btn-outline-danger"
            @click="removeFile(index)"
          >
            <i class="bx bx-trash"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Messages d'erreur -->
    <div v-if="fileErrors.length > 0" class="mt-2">
      <div v-for="error in fileErrors" :key="error" class="alert alert-danger alert-sm">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';

// Props
interface Props {
  modelValue?: File[];
  resetTrigger?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  resetTrigger: false
});

// Emits
const emit = defineEmits<{
  'update:modelValue': [files: File[]];
  'files-changed': [files: File[]];
}>();

// État local
const selectedFiles = ref<File[]>([]);
const fileErrors = ref<string[]>([]);
const fileInput = ref<HTMLInputElement>();
const isUpdating = ref(false);

// Initialisation
if (props.modelValue.length > 0) {
  selectedFiles.value = [...props.modelValue];
}

// Watchers avec protection contre les boucles
watch(() => props.modelValue, (newFiles) => {
  if (!isUpdating.value && newFiles.length !== selectedFiles.value.length) {
    selectedFiles.value = [...newFiles];
  }
}, { flush: 'sync' });

watch(() => props.resetTrigger, () => {
  clearFiles();
});

watch(selectedFiles, async (newFiles) => {
  if (!isUpdating.value) {
    isUpdating.value = true;
    emit('update:modelValue', [...newFiles]);
    emit('files-changed', [...newFiles]);
    await nextTick();
    isUpdating.value = false;
  }
}, { deep: true });

// Méthodes
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    const files = Array.from(target.files);
    validateAndAddFiles(files);
  }
};

const validateAndAddFiles = (files: File[]) => {
  fileErrors.value = [];
  const validFiles: File[] = [];
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'text/plain'
  ];

  files.forEach(file => {
    // Vérifier la taille
    if (file.size > maxSize) {
      fileErrors.value.push(`${file.name}: Fichier trop volumineux (max 10MB)`);
      return;
    }

    // Vérifier le type
    if (!allowedTypes.includes(file.type)) {
      fileErrors.value.push(`${file.name}: Type de fichier non autorisé`);
      return;
    }

    // Vérifier les doublons
    const isDuplicate = selectedFiles.value.some(existing => 
      existing.name === file.name && existing.size === file.size
    );

    if (!isDuplicate) {
      validFiles.push(file);
    }
  });

  selectedFiles.value.push(...validFiles);
};

const removeFile = (index: number) => {
  selectedFiles.value.splice(index, 1);
};

const clearFiles = () => {
  selectedFiles.value = [];
  fileErrors.value = [];
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Exposer la méthode clearFiles
defineExpose({
  clearFiles
});
</script>

<style scoped>
.alert-sm {
  padding: 0.5rem;
  font-size: 0.875rem;
}

.list-group-item {
  padding: 0.75rem;
}
</style>