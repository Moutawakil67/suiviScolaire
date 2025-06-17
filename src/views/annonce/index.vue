<template>
  <VerticalLayout>
    <div class="container-fluid">
      <PageTitle title="Gestion des Rapports" />

      <!-- Onglets principaux -->
      <b-tabs content-class="pt-2 text-muted" class="mt-3" justified>
        <b-tab id="rapports-list" active>
          <template #title>
            <span class="d-block d-sm-none"><i class="bx bx-list-ul"></i></span>
            <span class="d-none d-sm-block">Liste des Rapports</span>
          </template>

          <!-- Liste des rapports -->
          <div class="row g-3 mb-4">
            <div class="col-12 col-md-6">
              <SearchBox
                v-model="searchQuery"
                placeholder="Rechercher un rapport..."
                class="w-100"
              />
            </div>
            <div
              class="col-12 col-md-6 d-flex justify-content-md-end justify-content-center gap-2"
            >
              <LoadingButton
                v-if="canCreate"
                variant="primary"
                @click="openAddModal"
              >
                <i class="bx bx-plus me-1"></i> Nouveau Rapport
              </LoadingButton>
              <ExportButton
                v-if="canExport"
                :data="rapports"
                filename="rapports"
                label="Exporter"
                class="flex-shrink-0"
              />
            </div>
          </div>

          <!-- Tableau des rapports -->
          <div class="card">
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-centered table-hover">
                  <thead>
                    <tr>
                      <th>Objet</th>
                      <th>Campagne</th>
                      <th>Créateur</th>
                      <th>Date de création</th>
                      <th>Fichiers</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="rapport in filteredRapports" :key="rapport.id">
                      <td>
                        <div>
                          <strong>{{ rapport.objet }}</strong>
                          <br />
                          <small class="text-muted">{{
                            truncateText(rapport.description, 50)
                          }}</small>
                        </div>
                      </td>
                      <td>
                        <span v-if="rapport.campagne" class="badge bg-info">
                          {{ rapport.campagne.titre }}
                        </span>
                        <span v-else class="text-muted">-</span>
                      </td>

                      <td>
                        <span v-if="rapport.created_by">
                          {{
                            `${rapport.created_by.prenom} ${rapport.created_by.nom}`
                          }}
                        </span>
                        <span v-else class="text-muted">-</span>
                      </td>
                      <td>{{ formatDate(rapport.created_at) }}</td>
                      <td>
                        <span
                          v-if="rapport.fichiers && rapport.fichiers.length > 0"
                          class="badge bg-success"
                        >
                          {{ rapport.fichiers.length }} fichier(s)
                        </span>
                        <span v-else class="badge bg-secondary"
                          >Aucun fichier</span
                        >
                      </td>
                      <td>
                        <div class="d-flex gap-2">
                          <button
                            class="btn btn-sm btn-soft-info"
                            @click="viewRapport(rapport)"
                            title="Voir le détail"
                          >
                          
                            <i class="bx bx-show"></i>
                          </button>

    <button
      class="btn btn-sm btn-soft-success"
      @click="sendMailRapport(rapport)"
      :disabled="sendingMail[rapport.id]"
      title="Envoyer par mail au commanditaire"
    >
      <span
        v-if="sendingMail[rapport.id]"
        class="spinner-border spinner-border-sm"
        role="status"
      ></span>
      <i v-else class="bx bx-mail-send"></i>
    </button>

                          <button
                            class="btn btn-sm btn-soft-primary"
                            @click="openEditModal(rapport)"
                            title="Modifier"
                          >
                            <i class="bx bx-pencil"></i>
                          </button>
                          <div class="dropdown">
                            <button
                              class="btn btn-sm btn-soft-secondary dropdown-toggle"
                              type="button"
                              :id="`export-${rapport.id}`"
                              data-bs-toggle="dropdown"
                            >
                              <i class="bx bx-download"></i>
                            </button>
                            <ul class="dropdown-menu">
                              <li>
                                <a
                                  class="dropdown-item"
                                  @click="exportPdf(rapport.id,rapport.objet)"
                                  href="#"
                                  >PDF</a
                                >
                              </li>

                              <!--
                              <li>
                                <a
                                  class="dropdown-item"
                                  @click="exportExcel(rapport.id)"
                                  href="#"
                                  >Excel</a></li>
                              -->
                            </ul>
                          </div>
                          <button
                            class="btn btn-sm btn-soft-danger"
                            @click="openDeleteModal(rapport)"
                            title="Supprimer"
                          >
                            <i class="bx bx-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                    <tr v-if="filteredRapports.length === 0">
                      <td colspan="6" class="text-center">
                        Aucun rapport trouvé
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <TablePagination
                v-model:currentPage="currentPage"
                :total-items="totalItems"
                :per-page="itemsPerPage"
              />
            </div>
          </div>
        </b-tab>

        <b-tab id="create-rapport">
          <template #title>
            <span class="d-block d-sm-none"><i class="bx bx-plus"></i></span>
            <span class="d-none d-sm-block">Créer un Rapport</span>
          </template>

          <!-- Formulaire de création -->
          <div class="card">
            <div class="card-body">
              <form ref="rapportForm" @submit.prevent="handleQuickSubmit">
                <div class="row">
                  <div class="col-12 col-md-6 mb-3">
                    <FormField
                      v-model="quickForm.objet"
                      label="Objet du rapport"
                      type="text"
                      required
                      id="quick_objet"
                    />
                  </div>
                  <div class="col-12 col-md-6 mb-3">
                    <FormField
                      v-model="quickForm.campagne_id"
                      label="Campagne"
                      type="select"
                      :options="campagneOptions"
                      required
                      id="quick_campagne"
                    />
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label">Description du rapport</label>

                  <QuillEditor
                    ref="quickFormQuillEditor"
                    theme="snow"
                    :toolbar="toolbar1"
                    style="height: 300px"
                    v-model:content="quickForm.description"
                    content-type="html"
                  />
                </div>

                <div class="mb-3">
                  <label class="form-label">Fichiers joints (optionnel)</label>

                  <FileUpload
                    v-model="quickForm.fichiers"
                    :reset-trigger="quickFormResetTrigger"
                    :multiple="true"
                    :max-size="10"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png,.txt"
                    @files-changed="onQuickFormFilesChanged"
                  />
                </div>

                <div class="d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    class="btn btn-secondary"
                    @click="resetQuickForm"
                  >
                    Réinitialiser
                  </button>

                  <button
                    type="submit"
                    class="btn btn-primary"
                    :disabled="loading || isUploading"
                  >
                    <span
                      v-if="loading || isUploading"
                      class="spinner-border spinner-border-sm me-1"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    <span v-if="isUploading">Upload en cours...</span>
                    <span v-else-if="loading">{{ "Création..." }}</span>
                    <span v-else>{{ "Créer le Rapport" }}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </b-tab>
      </b-tabs>
    </div>

    <!-- Modal de détail du rapport -->

    <b-modal
      v-model="showDetailModal"
      title="Détail du Rapport"
      size="lg"
      @hidden="onDetailModalHidden"
      :hide-footer="true"
    >
      <div v-if="selectedRapport" class="rapport-detail">
        <div class="row mb-3">
          <div class="col-md-6">
            <strong>Objet:</strong>
            <p>{{ selectedRapport.objet }}</p>
          </div>
          <div class="col-md-6">
            <strong>Campagne:</strong>
            <p>{{ selectedRapport.campagne?.titre || "Non définie" }}</p>
          </div>
        </div>

        <div class="mb-3">
          <strong>Description:</strong>
          <div
            v-html="selectedRapport.description"
            class="mt-2 p-3 border rounded"
          ></div>
        </div>

        <div
          class="mb-3"
          v-if="selectedRapport.fichiers && selectedRapport.fichiers.length > 0"
        >
          <strong>Fichiers attachés:</strong>
          <div class="mt-2">
            <div
              v-for="fichier in selectedRapport.fichiers"
              :key="fichier.id"
              class="d-flex justify-content-between align-items-center p-2 border rounded mb-2"
            >
              <div>
                <i class="bx bx-file me-2"></i>
                {{ fichier.nom_original }}
                <small class="text-muted"
                  >({{ formatFileSize(fichier.taille_octets) }})</small
                >
              </div>
              <div>
                <button
                  class="btn btn-sm btn-outline-primary me-2"
                  @click="
                    downloadFichierIndividuel(
                      selectedRapport.id,
                      fichier.id,
                      fichier.nom_original
                    )
                  "
                  :disabled="downloadingFiles[fichier.id]"
                  title="Télécharger le fichier"
                >
                  <span
                    v-if="downloadingFiles[fichier.id]"
                    class="spinner-border spinner-border-sm"
                    role="status"
                  ></span>
                  <i v-else class="bx bx-download"></i>
                </button>

                <button
                  class="btn btn-sm btn-outline-danger"
                  @click="deleteFichier(selectedRapport.id, fichier.id)"
                >
                  <i class="bx bx-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-4 d-flex justify-content-end gap-2">
          <button class="btn btn-secondary" @click="showDetailModal = false">
            Fermer
          </button>

          <button
            class="btn btn-primary"
            @click="openEditModal(selectedRapport)"
          >
            Modifier
          </button>
        </div>
      </div>
    </b-modal>

    <!-- Modal d'ajout/modification -->
    <b-modal
      v-model="showModal"
      :title="isEditing ? 'Modifier le rapport' : 'Ajouter un rapport'"
      @hidden="resetForm"
      @cancel="handleCancel"
      :hide-footer="true"
      size="lg"
    >
      <form ref="modalForm" @submit.prevent="handleSubmit" novalidate>
        <div class="row">
          <div class="col-12 col-md-6 mb-3">
            <FormField
              v-model="form.objet"
              label="Objet du rapport"
              type="text"
              required
              id="objet"
            />
          </div>
          <div class="col-12 col-md-6 mb-3">
            <FormField
              v-model="form.campagne_id"
              label="Campagne"
              type="select"
              :options="campagneOptions"
              required
              id="campagne_id"
            />
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label">Description du rapport</label>

          <QuillEditor
            ref="modalFormQuillEditor"
            theme="snow"
            :toolbar="toolbar1"
            style="height: 300px"
            v-model:content="form.description"
            content-type="html"
          />
        </div>

        <div class="mb-3">
          <label class="form-label">Fichiers joints (optionnel) </label>

          <FileUpload
            v-model="form.fichiers"
            :reset-trigger="modalFormResetTrigger"
            :multiple="true"
            :max-size="10"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png,.txt"
            @files-changed="onModalFormFilesChanged"
          />
        </div>

        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-secondary"
            @click="handleCancel"
            :disabled="loading"
          >
            Annuler
          </button>

          <button
            type="submit"
            class="btn btn-primary"
            :disabled="loading || isUploading"
          >
            <span
              v-if="loading || isUploading"
              class="spinner-border spinner-border-sm me-1"
              role="status"
              aria-hidden="true"
            ></span>
            <span v-if="isUploading">Upload en cours...</span>
            <span v-else-if="loading">{{
              isEditing ? "Modification..." : "Création..."
            }}</span>
            <span v-else>{{
              isEditing ? "Modifier" : "Créer le Rapport"
            }}</span>
          </button>
        </div>
      </form>
    </b-modal>

    <!-- Modal de confirmation de suppression -->
    <b-modal
      v-model="showDeleteModal"
      title="Confirmer la suppression"
      @hidden="selectedRapport = null"
      @cancel="handleCancel"
      :hide-footer="true"
    >
      <p>Êtes-vous sûr de vouloir supprimer ce rapport ?</p>
      <div v-if="selectedRapport">
        <strong>{{ selectedRapport.objet }}</strong>
      </div>

      <div class="modal-footer">
        <button
          type="button"
          class="btn btn-secondary"
          @click="handleCancel"
          :disabled="loading"
        >
          Annuler
        </button>
        <button
          type="button"
          class="btn btn-danger"
          @click="handleDelete"
          :disabled="loading"
        >
          <span
            v-if="loading"
            class="spinner-border spinner-border-sm me-1"
            role="status"
            aria-hidden="true"
          ></span>
          <span>{{ loading ? "En cours..." : "Supprimer" }}</span>
        </button>
      </div>
    </b-modal>
  </VerticalLayout>
</template>

<script setup lang="ts">
import { QuillEditor } from "@vueup/vue-quill";
import { ref, computed, onMounted, nextTick } from "vue";
import LoadingButton from "@/components/LoadingButton.vue";
import ExportButton from "@/components/ExportButton.vue";
import VerticalLayout from "@/layouts/VerticalLayout.vue";
import PageTitle from "@/components/PageTitle.vue";
import FormField from "@/components/FormField.vue";
import TablePagination from "@/components/TablePagination.vue";
import SearchBox from "@/components/SearchBox.vue";
import FileUpload from "@/components/FileUpload.vue";

import {
  rapportService,
  rapportFichierService,
} from "@/services/rapport.service";
import type {
  Rapport,
  CreateRapportRequest,
  UpdateRapportRequest,
} from "@/services/rapport.service";
import { showSuccessMessage, showErrorMessage } from "@/helpers/notification";
import { usePermissionStore } from "@/stores/permissionStore";
import { campagneService } from "@/services/campagne";
import type { Campagne } from "@/services/campagne";

const campagneOptions = ref<{ value: number; label: string }[]>([]);
const isLoading = ref(false);
const errorMessage = ref("");
const quickFormFileUploadKey = ref(0);
const modalFormFileUploadKey = ref(0);
const quickFormResetTrigger = ref(false);
const modalFormResetTrigger = ref(false);
const quickFormQuillEditor = ref();
const modalFormQuillEditor = ref();

// Configuration de l'éditeur Quill
const toolbar1 = [
  [{ font: [] }, { size: [] }],
  ["bold", "italic", "underline", "strike"],
  [{ color: [] }, { background: [] }],
  [{ script: "super" }, { script: "sub" }],
  [{ header: [false, 1, 2, 3, 4, 5, 6] }, "blockquote", "code-block"],
  [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
  ["direction", { align: [] }],
  ["link", "image", "video"],
  ["clean"],
];

// Permissions
const permissions = {
  create: ["rapport:create"],
  update: ["rapport:update"],
  delete: ["rapport:delete"],
  export: ["rapport:export"],
};

const permissionStore = usePermissionStore();

const canCreate = computed(() =>
  permissionStore.checkPermissions(permissions.create)
);
const canUpdate = computed(() =>
  permissionStore.checkPermissions(permissions.update)
);
const canDelete = computed(() =>
  permissionStore.checkPermissions(permissions.delete)
);
const canExport = computed(() =>
  permissionStore.checkPermissions(permissions.export)
);

// État principal
const rapports = ref<Rapport[]>([]);
const searchQuery = ref("");
const currentPage = ref(1);
const itemsPerPage = ref(10);
const showModal = ref(false);
const showDeleteModal = ref(false);
const showDetailModal = ref(false);
const loading = ref(false);
const quickLoading = ref(false);
const isEditing = ref(false);
const selectedRapport = ref<Rapport | null>(null);
const isUploading = ref(false);
const uploadProgress = ref<Record<string, number>>({});
const isProcessing = computed(
  () => loading.value || quickLoading.value || isUploading.value
);
const downloadingFiles = ref<Record<number, boolean>>({});
const sendingMail = ref<Record<number, boolean>>({});
// Formulaires

const form = ref<CreateRapportRequest & { id?: number; fichiers?: File[] }>({
  objet: "",
  description: "",
  campagne_id: 0,
  fichiers: [],
});

const quickForm = ref<CreateRapportRequest & { fichiers?: File[] }>({
  objet: "",
  description: "",
  campagne_id: 0,
  fichiers: [],
});

const filteredRapports = computed(() => {
  if (!searchQuery.value) return rapports.value;

  return rapports.value.filter(
    (rapport) =>
      rapport.objet.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      rapport.description
        .toLowerCase()
        .includes(searchQuery.value.toLowerCase()) ||
      rapport.campagne?.titre
        .toLowerCase()
        .includes(searchQuery.value.toLowerCase()) ||
      (rapport.created_by &&
        `${rapport.created_by.prenom} ${rapport.created_by.nom}`
          .toLowerCase()
          .includes(searchQuery.value.toLowerCase()))
  );
});

const totalItems = computed(() => filteredRapports.value.length);

// Méthodes utilitaires

const truncateText = (html: string, length: number): string => {
  if (!html) return "";
  const plainText = stripHtmlTags(html);
  return plainText.length > length
    ? plainText.substring(0, length) + "..."
    : plainText;
};
const stripHtmlTags = (html: string): string => {
  if (!html) return "";
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;
  return tempDiv.textContent || tempDiv.innerText || "";
};
const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("fr-FR");
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const loadCampagnes = async () => {
  isLoading.value = true;
  try {
    const campagnes: Campagne[] = await campagneService.getAll();

    campagneOptions.value = campagnes.map((c) => ({
      value: c.id,
      label: c.titre,
    }));
  } catch (error: any) {
    showErrorMessage("Erreur lors du chargement des campagnes");
  } finally {
    isLoading.value = false;
  }
};

// Méthodes de gestion des modals
const openAddModal = () => {
  isEditing.value = false;
  showModal.value = true;
};

const openEditModal = (rapport: Rapport) => {
  isEditing.value = true;
  selectedRapport.value = rapport;
  form.value = {
    id: rapport.id,
    objet: rapport.objet,
    description: rapport.description,
    campagne_id: rapport.campagne_id,
  };

  showModal.value = true;
  showDetailModal.value = false;

  nextTick(() => {
    if (modalFormQuillEditor.value) {
      modalFormQuillEditor.value.setHTML(rapport.description || "");
    }
  });
};

const openDeleteModal = (rapport: Rapport) => {
  selectedRapport.value = rapport;
  showDeleteModal.value = true;
};

const viewRapport = (rapport: Rapport) => {
  selectedRapport.value = rapport;
  showDetailModal.value = true;
};

const resetForm = () => {
  form.value = {
    objet: "",
    description: "",
    campagne_id: 0,
    fichiers: [],
  };
  if (modalFormQuillEditor.value) {
    modalFormQuillEditor.value.setHTML("");
  }
  selectedRapport.value = null;
  uploadProgress.value = {};
  modalFormResetTrigger.value = !modalFormResetTrigger.value;
};

const resetQuickForm = () => {
  quickForm.value = {
    objet: "",
    description: "",
    campagne_id: 0,
    fichiers: [],
  };
  if (quickFormQuillEditor.value) {
    quickFormQuillEditor.value.setHTML("");
  }
  uploadProgress.value = {};
  quickFormResetTrigger.value = !quickFormResetTrigger.value;
};

// Validation
const validateForm = (formData: CreateRapportRequest): string[] => {
  const errors: string[] = [];
  if (!formData.objet.trim()) errors.push("L'objet du rapport est requis");
  if (!formData.description.trim()) errors.push("La description est requise");
  if (!formData.campagne_id) errors.push("La campagne est requise");
  return errors;
};

// Gestion des soumissions
const handleSubmit = async () => {
  loading.value = true;
  try {
    const description =
      modalFormQuillEditor.value?.getHTML() || form.value.description;
    form.value.description = description;

    const errors = validateForm(form.value);
    if (errors.length > 0) {
      showErrorMessage(errors.join("\n"));
      return;
    }

    // Valider les fichiers si présents
    if (form.value.fichiers && form.value.fichiers.length > 0) {
      if (!validateFiles(form.value.fichiers)) {
        return;
      }
    }

    if (isEditing.value && selectedRapport.value) {
      // Modification existante
      const updateData: UpdateRapportRequest = {
        objet: form.value.objet,
        description: form.value.description,
      };
      const updatedRapport = await rapportService.update(
        selectedRapport.value.id,
        updateData
      );

      // Upload des nouveaux fichiers si présents
      if (form.value.fichiers && form.value.fichiers.length > 0) {
        await uploadFilesWithRapport(updatedRapport.id, form.value.fichiers);
        // Recharger le rapport avec les nouveaux fichiers
        const rapportWithFiles = await rapportService.getById(
          updatedRapport.id
        );
        const index = rapports.value.findIndex(
          (r) => r.id === updatedRapport.id
        );
        if (index !== -1) {
          rapports.value[index] = rapportWithFiles;
        }
      } else {
        const index = rapports.value.findIndex(
          (r) => r.id === updatedRapport.id
        );
        if (index !== -1) {
          rapports.value[index] = updatedRapport;
        }
      }

      showSuccessMessage("Rapport modifié avec succès");
    } else {
      // Création nouvelle
      const createData = {
        objet: form.value.objet,
        description: form.value.description,
        campagne_id: form.value.campagne_id,
      };

      const newRapport = await rapportService.create(createData);

      // Upload des fichiers si présents
      if (form.value.fichiers && form.value.fichiers.length > 0) {
        await uploadFilesWithRapport(newRapport.id, form.value.fichiers);
        // Recharger le rapport avec les fichiers
        const rapportWithFiles = await rapportService.getById(newRapport.id);
        rapports.value.unshift(rapportWithFiles);
      } else {
        rapports.value.unshift(newRapport);
      }

      showSuccessMessage("Rapport créé avec succès");
    }

    showModal.value = false;
    resetForm();
  } catch (error: any) {
    console.error(error);
    showErrorMessage(error.message || "Erreur lors de la soumission");
  } finally {
    loading.value = false;
  }
};

const handleQuickSubmit = async () => {
  quickLoading.value = true;
  try {
    const errors = validateForm(quickForm.value);
    if (errors.length > 0) {
      showErrorMessage(errors.join("\n"));
      return;
    }

    // Valider les fichiers si présents
    if (quickForm.value.fichiers && quickForm.value.fichiers.length > 0) {
      if (!validateFiles(quickForm.value.fichiers)) {
        return;
      }
    }

    const createData = {
      objet: quickForm.value.objet,
      description: quickForm.value.description,
      campagne_id: quickForm.value.campagne_id,
    };

    const newRapport = await rapportService.create(createData);

    // Upload des fichiers si présents
    if (quickForm.value.fichiers && quickForm.value.fichiers.length > 0) {
      await uploadFilesWithRapport(newRapport.id, quickForm.value.fichiers);
      // Recharger le rapport avec les fichiers
      const rapportWithFiles = await rapportService.getById(newRapport.id);
      rapports.value.unshift(rapportWithFiles);
    } else {
      rapports.value.unshift(newRapport);
    }

    showSuccessMessage("Rapport créé avec succès");
    resetQuickForm();
  } catch (error: any) {
    console.error(error);
    showErrorMessage(error.message || "Erreur lors de la création");
  } finally {
    quickLoading.value = false;
  }
};

const onQuickFormFilesChanged = (files: File[]) => {
  if (files.length > 0) {
    validateFiles(files);
  }
};

const onModalFormFilesChanged = (files: File[]) => {
  if (files.length > 0) {
    validateFiles(files);
  }
};

const validateFiles = (files: File[]) => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "image/jpeg",
    "image/png",
    "text/plain",
  ];

  const errors: string[] = [];

  files.forEach((file) => {
    if (file.size > maxSize) {
      errors.push(
        `Le fichier "${file.name}" dépasse la taille maximale de 10MB`
      );
    }

    if (!allowedTypes.includes(file.type)) {
      errors.push(`Le type du fichier "${file.name}" n'est pas autorisé`);
    }
  });

  if (errors.length > 0) {
    showErrorMessage(errors.join("\n"));
    return false;
  }

  return true;
};

const uploadFilesWithRapport = async (rapportId: number, files: File[]) => {
  if (!files || files.length === 0) return;

  isUploading.value = true;

  try {
    if (files.length === 1) {
      // Upload d'un seul fichier
      const file = files[0];

      // Simuler le progress pour l'interface utilisateur
      uploadProgress.value[file.name] = 0;

      const result = await rapportFichierService.uploadSingle(rapportId, file);

      uploadProgress.value[file.name] = 100;
      showSuccessMessage(`Fichier "${file.name}" uploadé avec succès`);
    } else {
      // Upload multiple
      files.forEach((file) => {
        uploadProgress.value[file.name] = 0;
      });

      const result = await rapportFichierService.uploadMultiple(
        rapportId,
        files
      );

      // Mettre à jour le progress
      files.forEach((file) => {
        uploadProgress.value[file.name] = 100;
      });

      showSuccessMessage(`${files.length} fichier(s) uploadé(s) avec succès`);
    }
  } catch (error: any) {
    console.error("Erreur upload:", error);
    showErrorMessage(
      "Erreur lors de l'upload des fichiers: " +
        (error.message || "Erreur inconnue")
    );
    throw error;
  } finally {
    isUploading.value = false;
    uploadProgress.value = {};
  }
};

const handleDelete = async () => {
  if (!selectedRapport.value) return;

  loading.value = true;
  try {
    await rapportService.delete(selectedRapport.value.id);
    rapports.value = rapports.value.filter(
      (r) => r.id !== selectedRapport.value!.id
    );
    showSuccessMessage("Rapport supprimé avec succès");
    showDeleteModal.value = false;
  } catch (error: any) {
    showErrorMessage(error.message || "Erreur lors de la suppression");
  } finally {
    loading.value = false;
  }
};

const handleCancel = () => {
  showModal.value = false;
  showDeleteModal.value = false;
  resetForm();
  selectedRapport.value = null;
  isEditing.value = false;
};

// Méthodes d'export
const exportPdf = async (rapportId: number,filename?: string) => {
  try {
    await rapportService.downloadPdf(rapportId,filename);
    showSuccessMessage("Export PDF en cours de téléchargement");
  } catch (error: any) {
    showErrorMessage("Erreur lors de l'export PDF");
  }
};

const exportExcel = async (rapportId: number) => {
  try {
    await rapportService.downloadExcel(rapportId);
    showSuccessMessage("Export Excel en cours de téléchargement");
  } catch (error: any) {
    showErrorMessage("Erreur lors de l'export Excel");
  }
};


const onDetailModalHidden = () => {
  selectedRapport.value = null;
  downloadingFiles.value = {};
  sendingMail.value = {}; 
};

// Gestion des fichiers

const downloadFichierIndividuel = async (
  rapportId: number,
  fichierId: number,
  filename: string
) => {
  downloadingFiles.value[fichierId] = true;
  try {
    await rapportFichierService.downloadFichier(rapportId, fichierId,filename);
    showSuccessMessage(`Fichier "${filename}" téléchargé avec succès`);
  } catch (error: any) {
    showErrorMessage(`Erreur lors du téléchargement du fichier "${filename}"`);
    console.error("Erreur téléchargement:", error);
  } finally {
    downloadingFiles.value[fichierId] = false;
  }
};

const deleteFichier = async (rapportId: number, fichierId: number) => {
  try {
    await rapportFichierService.deleteFichier(rapportId, fichierId);
    showSuccessMessage("Fichier supprimé avec succès");

    // Recharger et synchroniser
    const updatedRapport = await rapportService.getById(rapportId);
    syncRapportData(updatedRapport);
  } catch (error: any) {
    showErrorMessage("Erreur lors de la suppression du fichier");
  }
};


const sendMailRapport = async (rapport: Rapport) => {
  sendingMail.value[rapport.id] = true;
  try {
    const result = await rapportService.sendMail(rapport.id);
    if (result.success) {
      showSuccessMessage(/*result.message ||*/ "Mail envoyé avec succès au commanditaire");
    } else {
      showErrorMessage(result.message || "Erreur lors de l'envoi du mail");
    }
  } catch (error: any) {
    console.error("Erreur envoi mail:", error);
    showErrorMessage(error.message || "Erreur lors de l'envoi du mail");
  } finally {
    sendingMail.value[rapport.id] = false;
  }
};



const syncRapportData = (updatedRapport: Rapport) => {
  // Mettre à jour selectedRapport si c'est le même
  if (selectedRapport.value && selectedRapport.value.id === updatedRapport.id) {
    selectedRapport.value = updatedRapport;
  }
  // Mettre à jour dans le tableau principal
  const index = rapports.value.findIndex((r) => r.id === updatedRapport.id);
  if (index !== -1) {
    rapports.value[index] = updatedRapport;
  }
};

// Chargement initial

onMounted(async () => {
  loading.value = true;
  try {
    await Promise.all([
      rapportService.getAll().then((data) => {
        rapports.value = data;
      }),
      loadCampagnes(),
    ]);
  } catch (error: any) {
    showErrorMessage("Erreur lors du chargement des données");
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.rapport-detail .border {
  background-color: #f8f9fa;
}

.dropdown-menu {
  min-width: auto;
}

.table-responsive {
  border-radius: 0.375rem;
}

.badge {
  font-size: 0.75em;
}
</style>
