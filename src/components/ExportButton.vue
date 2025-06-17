<template>
  <div class="export-button-wrapper">
    <b-dropdown variant="light" class="w-xs">
      <template #button-content>
        <i class="bx bx-export me-1"></i>
        {{ label }}
      </template>

      <b-dropdown-item @click="exportData('csv')">
        <i class="bx bx-file me-1"></i> CSV
      </b-dropdown-item>
      <b-dropdown-item @click="exportData('excel')">
        <i class="bx bx-spreadsheet me-1"></i> Excel
      </b-dropdown-item>
      <b-dropdown-item @click="exportData('pdf')">
        <i class="bx bx-file-pdf me-1"></i> PDF
      </b-dropdown-item>
    </b-dropdown>

    <LoadingState
      v-if="loading"
      type="spinner"
      small
      overlay
      text="Exportation en cours..."
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import LoadingState from './LoadingState.vue';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';


interface Props {
  label?: string;
  data: any[];
  filename?: string;
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Exporter',
  filename: 'export'
});

const loading = ref(false);

const exportData = async (format: 'csv' | 'excel' | 'pdf') => {
  loading.value = true;

  try {
    switch (format) {
      case 'csv':
        await exportToCsv();
        break;
      case 'excel':
        await exportToExcel();
        break;
      case 'pdf':
        await exportToPdf();
        break;
    }
  } catch (error) {
    console.error('Erreur lors de l\'export:', error);
  } finally {
    loading.value = false;
  }
};

const exportToCsv = async () => {
  const headers = Object.keys(props.data[0]);
  const csvContent = [
    headers.join(','),
    ...props.data.map(item => headers.map(header => item[header]).join(','))
  ].join('\n');

  downloadFile(csvContent, 'text/csv', `${props.filename}.csv`);
};

const exportToExcel = async () => {
  const worksheet = XLSX.utils.json_to_sheet(props.data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Données');
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  downloadFile(
    new Uint8Array(excelBuffer),
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    `${props.filename}.xlsx`
  );
};

const exportToPdf = async () => {
  const pdf = new jsPDF();
  const headers = Object.keys(props.data[0]);
  const rows = props.data.map(item => headers.map(header => item[header]));
  
  // Configuration de la police et de la taille par défaut
  pdf.setFont('helvetica');
  pdf.setFontSize(10);
  
  pdf.autoTable({
    head: [headers],
    body: rows,
    margin: { top: 10 }
  });
  
  const pdfBuffer = pdf.output('arraybuffer');
  downloadFile(new Uint8Array(pdfBuffer), 'application/pdf', `${props.filename}.pdf`);
};

const downloadFile = (content: Uint8Array | string, type: string, filename: string) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
</script>

<style scoped>
.export-button-wrapper {
  position: relative;
  display: inline-block;
}
</style>