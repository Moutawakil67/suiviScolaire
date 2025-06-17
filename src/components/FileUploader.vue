<template>
  <div class="file-uploader">
    <div class="upload-zone" @dragover.prevent @drop.prevent="handleDrop" @click="triggerFileInput">
      <input
        type="file"
        ref="fileInput"
        :accept="accept"
        :multiple="multiple"
        @change="handleFileSelect"
        class="d-none"
      >
      <div class="upload-placeholder">
        <i class="bx bx-cloud-upload font-size-24"></i>
        <p>Glissez-déposez vos fichiers ici ou cliquez pour sélectionner</p>
      </div>
    </div>

    <div v-if="files.length > 0" class="file-list mt-3">
      <div v-for="(file, index) in files" :key="index" class="file-item">
        <div class="file-preview" v-if="isImage(file)">
          <img :src="getPreviewUrl(file)" alt="preview">
        </div>
        <div class="file-info">
          <span class="file-name">{{ file.name }}</span>
          <span class="file-size">{{ formatFileSize(file.size) }}</span>
        </div>
        <div class="progress" v-if="file.progress !== undefined">
          <div
            class="progress-bar"
            role="progressbar"
            :style="{ width: `${file.progress}%` }"
            :aria-valuenow="file.progress"
            aria-valuemin="0"
            aria-valuemax="100"
          >
            {{ file.progress }}%
          </div>
        </div>
        <button class="btn btn-sm btn-danger ms-2" @click="removeFile(index)">
          <i class="bx bx-trash"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

interface FileWithProgress extends File {
  progress?: number;
  preview?: string;
}

interface Props {
  modelValue: File[];
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // en MB
}

const props = withDefaults(defineProps<Props>(), {
  multiple: false,
  maxSize: 5,
  accept: '*/*'
});

const emit = defineEmits(['update:modelValue', 'error']);

const fileInput = ref<HTMLInputElement | null>(null);
const files = ref<FileWithProgress[]>([]);

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files) {
    addFiles(Array.from(input.files));
  }
};

const handleDrop = (event: DragEvent) => {
  const droppedFiles = event.dataTransfer?.files;
  if (droppedFiles) {
    addFiles(Array.from(droppedFiles));
  }
};

const addFiles = (newFiles: File[]) => {
  const validFiles = newFiles.filter(file => {
    if (file.size > props.maxSize * 1024 * 1024) {
      emit('error', `Le fichier ${file.name} dépasse la taille maximale de ${props.maxSize}MB`);
      return false;
    }
    return true;
  });

  const filesToAdd = validFiles.map(file => {
    const fileWithProgress = file as FileWithProgress;
    fileWithProgress.progress = 0;
    return fileWithProgress;
  });

  if (props.multiple) {
    files.value = [...files.value, ...filesToAdd];
  } else {
    files.value = filesToAdd.slice(-1);
  }

  simulateUpload();
};

const simulateUpload = () => {
  files.value.forEach((file, index) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      if (progress <= 100) {
        file.progress = progress;
      } else {
        clearInterval(interval);
      }
    }, 500);
  });
};

const removeFile = (index: number) => {
  files.value.splice(index, 1);
};

const isImage = (file: File) => {
  return file.type.startsWith('image/');
};

const getPreviewUrl = (file: File) => {
  return URL.createObjectURL(file);
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

watch(files, (newFiles) => {
  emit('update:modelValue', newFiles);
}, { deep: true });
</script>

<style scoped>
.file-uploader {
  width: 100%;
}

.upload-zone {
  border: 2px dashed #dee2e6;
  border-radius: 4px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.3s;
}

.upload-zone:hover {
  border-color: #556ee6;
}

.upload-placeholder {
  color: #74788d;
}

.file-item {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.file-preview {
  width: 40px;
  height: 40px;
  margin-right: 1rem;
}

.file-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.file-info {
  flex-grow: 1;
}

.file-name {
  display: block;
  font-weight: 500;
}

.file-size {
  font-size: 0.875rem;
  color: #74788d;
}

.progress {
  width: 100px;
  margin: 0 1rem;
}
</style>