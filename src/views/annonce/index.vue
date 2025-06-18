<template>
  <VerticalLayout>
    <div class="container-fluid">
      <PageTitle title="Gestion des Annonces" />

      <!-- Onglets principaux -->
      <b-tabs content-class="pt-2 text-muted" class="mt-3" justified>
        <b-tab id="annonces-list" active>
          <template #title>
            <span class="d-block d-sm-none"><i class="bx bx-list-ul"></i></span>
            <span class="d-none d-sm-block">Liste des Annonces</span>
          </template>

          <!-- Liste des annonces -->
          <div class="row g-3 mb-4">
            <div class="col-12 col-md-6">
              <SearchBox
                v-model="searchQuery"
                placeholder="Rechercher une annonce..."
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
                <i class="bx bx-plus me-1"></i> Nouvelle Annonce
              </LoadingButton>
              <ExportButton
                v-if="canExport"
                :data="annonces"
                filename="annonces"
                label="Exporter"
                class="flex-shrink-0"
              />
            </div>
          </div>

          <!-- Tableau des annonces -->
          <div class="card">
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-centered table-hover">
                  <thead>
                    <tr>
                      <th>Titre</th>
                      <th>Contenu</th>
                      <th>Date de publication</th>
                      <th>Visibilité</th>
                      <th>Images</th>
                      <th>Créateur</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="annonce in filteredAnnonces" :key="annonce.id">
                      <td>
                        <div>
                          <strong>{{ annonce.titre_annonce }}</strong>
                          <br />
                          <small class="text-muted">ID: {{ annonce.id_annonce }}</small>
                        </div>
                      </td>
                      <td>
                        <div class="content-preview">
                          {{ truncateText(annonce.contenu_annonce, 80) }}
                        </div>
                      </td>
                      <td>{{ formatDate(annonce.date_annonce) }}</td>
                      <td>
                        <span 
                          :class="getVisibilityBadgeClass(annonce.visibilite)"
                          class="badge"
                        >
                          {{ getVisibilityLabel(annonce.visibilite) }}
                        </span>
                      </td>
                      <td>
                        <span
                          v-if="annonce.images_annonce && annonce.images_annonce.length > 0"
                          class="badge bg-info"
                        >
                          {{ annonce.images_annonce.length }} image(s)
                        </span>
                        <span v-else class="badge bg-secondary">Aucune image</span>
                      </td>
                      <td>
                        <span v-if="annonce.created_by">
                          {{ `${annonce.created_by.prenom} ${annonce.created_by.nom}` }}
                        </span>
                        <span v-else class="text-muted">-</span>
                      </td>
                      <td>
                        <div class="d-flex gap-1">
                          <button
                            class="btn btn-sm btn-soft-info"
                            @click="viewAnnonce(annonce)"
                            title="Voir les détails"
                          >
                            <i class="bx bx-show"></i>
                          </button>
                          <button
                            class="btn btn-sm btn-soft-warning"
                            @click="previewAnnonce(annonce)"
                            title="Prévisualiser"
                          >
                            <i class="bx bx-search"></i>
                          </button>
                          <button
                            class="btn btn-sm btn-soft-success"
                            @click="publishAnnonce(annonce)"
                            :disabled="annonce.visibilite === 'publiee'"
                            title="Publier"
                          >
                            <i class="bx bx-check-circle"></i>
                          </button>
                          <button
                            class="btn btn-sm btn-soft-primary"
                            @click="openEditModal(annonce)"
                            title="Modifier"
                          >
                            <i class="bx bx-pencil"></i>
                          </button>
                          <button
                            class="btn btn-sm btn-soft-danger"
                            @click="openDeleteModal(annonce)"
                            title="Supprimer"
                          >
                            <i class="bx bx-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                    <tr v-if="filteredAnnonces.length === 0">
                      <td colspan="7" class="text-center">
                        Aucune annonce trouvée
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

        <b-tab id="create-annonce">
          <template #title>
            <span class="d-block d-sm-none"><i class="bx bx-plus"></i></span>
            <span class="d-none d-sm-block">Créer une Annonce</span>
          </template>

          <!-- Formulaire de création -->
          <div class="card">
            <div class="card-body">
              <form ref="annonceForm" @submit.prevent="handleQuickSubmit">
                <div class="row">
                  <div class="col-12 col-md-6 mb-3">
                    <FormField
                      v-model="quickForm.titre_annonce"
                      label="Titre de l'annonce"
                      type="text"
                      required
                      id="quick_titre"
                    />
                  </div>
                  <div class="col-12 col-md-6 mb-3">
                    <FormField
                      v-model="quickForm.visibilite"
                      label="Visibilité"
                      type="select"
                      :options="visibiliteOptions"
                      required
                      id="quick_visibilite"
                    />
                  </div>
                </div>

                <div class="row">
                  <div class="col-12 col-md-6 mb-3">
                    <FormField
                      v-model="quickForm.date_annonce"
                      label="Date de publication"
                      type="date"
                      required
                      id="quick_date"
                    />
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label">Contenu de l'annonce</label>
                  <QuillEditor
                    ref="quickFormQuillEditor"
                    theme="snow"
                    :toolbar="toolbar1"
                    style="height: 300px"
                    v-model:content="quickForm.contenu_annonce"
                    content-type="html"
                  />
                </div>

                <div class="mb-3">
                  <label class="form-label">Images (optionnel)</label>
                  <FileUpload
                    v-model="quickForm.images"
                    :reset-trigger="quickFormResetTrigger"
                    :multiple="true"
                    :max-size="5"
                    accept=".jpg,.jpeg,.png,.gif,.webp"
                    @files-changed="onQuickFormFilesChanged"
                  />
                </div>

                <div class="d-flex justify-content-between">
                  <button
                    type="button"
                    class="btn btn-warning"
                    @click="previewQuickForm"
                  >
                    <i class="bx bx-search me-1"></i>
                    Prévisualiser
                  </button>
                  
                  <div class="d-flex gap-2">
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
                      <span v-else-if="loading">Création...</span>
                      <span v-else>Créer l'Annonce</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </b-tab>

        <b-tab id="annonces-published">
          <template #title>
            <span class="d-block d-sm-none"><i class="bx bx-globe"></i></span>
            <span class="d-none d-sm-block">Annonces Publiées</span>
          </template>

          <!-- Vue publique des annonces -->
          <div class="row">
            <div 
              v-for="annonce in publishedAnnonces" 
              :key="'pub-' + annonce.id"
              class="col-12 col-md-6 col-lg-4 mb-4"
            >
              <div class="card h-100 shadow-sm annonce-card">
                <div 
                  v-if="annonce.images_annonce && annonce.images_annonce.length > 0"
                  class="card-img-top-container"
                >
                  <img 
                    :src="annonce.images_annonce[0]" 
                    class="card-img-top"
                    :alt="annonce.titre_annonce"
                  />
                </div>
                <div class="card-body d-flex flex-column">
                  <h5 class="card-title">{{ annonce.titre_annonce }}</h5>
                  <div class="card-text flex-grow-1" v-html="truncateText(annonce.contenu_annonce, 150)"></div>
                  <div class="mt-auto">
                    <small class="text-muted">
                      <i class="bx bx-calendar me-1"></i>
                      {{ formatDate(annonce.date_annonce) }}
                    </small>
                    <div class="mt-2">
                      <button 
                        class="btn btn-outline-primary btn-sm"
                        @click="viewFullAnnonce(annonce)"
                      >
                        Lire la suite
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div v-if="publishedAnnonces.length === 0" class="col-12">
              <div class="text-center py-5">
                <i class="bx bx-info-circle display-4 text-muted"></i>
                <p class="text-muted mt-3">Aucune annonce publiée pour le moment.</p>
              </div>
            </div>
          </div>
        </b-tab>
      </b-tabs>
    </div>

    <!-- Modal de détail de l'annonce -->
    <b-modal
      v-model="showDetailModal"
      title="Détail de l'Annonce"
      size="lg"
      @hidden="onDetailModalHidden"
      :hide-footer="true"
    >
      <div v-if="selectedAnnonce" class="annonce-detail">
        <div class="row mb-3">
          <div class="col-md-6">
            <strong>Titre:</strong>
            <p>{{ selectedAnnonce.titre_annonce }}</p>
          </div>
          <div class="col-md-6">
            <strong>Visibilité:</strong>
            <p>
              <span 
                :class="getVisibilityBadgeClass(selectedAnnonce.visibilite)"
                class="badge"
              >
                {{ getVisibilityLabel(selectedAnnonce.visibilite) }}
              </span>
            </p>
          </div>
        </div>

        <div class="row mb-3">
          <div class="col-md-6">
            <strong>Date de publication:</strong>
            <p>{{ formatDate(selectedAnnonce.date_annonce) }}</p>
          </div>
          <div class="col-md-6">
            <strong>Créateur:</strong>
            <p>{{ selectedAnnonce.created_by ? `${selectedAnnonce.created_by.prenom} ${selectedAnnonce.created_by.nom}` : '-' }}</p>
          </div>
        </div>

        <div class="mb-3">
          <strong>Contenu:</strong>
          <div
            v-html="selectedAnnonce.contenu_annonce"
            class="mt-2 p-3 border rounded content-display"
          ></div>
        </div>

        <div
          class="mb-3"
          v-if="selectedAnnonce.images_annonce && selectedAnnonce.images_annonce.length > 0"
        >
          <strong>Images attachées:</strong>
          <div class="mt-2 row">
            <div 
              v-for="(image, index) in selectedAnnonce.images_annonce" 
              :key="index"
              class="col-md-4 mb-3"
            >
              <img 
                :src="image" 
                class="img-fluid rounded shadow-sm cursor-pointer"
                @click="showImageModals(image)"
                :alt="`Image ${index + 1}`"
              />
            </div>
          </div>
        </div>

        <div class="mt-4 d-flex justify-content-end gap-2">
          <button class="btn btn-secondary" @click="showDetailModal = false">
            Fermer
          </button>
          <button
            class="btn btn-warning"
            @click="previewAnnonce(selectedAnnonce)"
          >
            Prévisualiser
          </button>
          <button
            class="btn btn-primary"
            @click="openEditModal(selectedAnnonce)"
          >
            Modifier
          </button>
        </div>
      </div>
    </b-modal>

    <!-- Modal de prévisualisation -->
    <b-modal
      v-model="showPreviewModal"
      title="Prévisualisation de l'Annonce"
      size="lg"
      :hide-footer="true"
    >
      <div v-if="previewAnnonce" class="preview-container">
        <div class="card border-0">
          <div 
            v-if="previewData.images_annonce && previewData.images_annonce.length > 0"
            class="mb-3"
          >
            <img 
              :src="previewData.images_annonce[0]" 
              class="img-fluid rounded"
              :alt="previewData.titre_annonce"
            />
          </div>
          <div class="card-body p-0">
            <h3 class="card-title">{{ previewData.titre_annonce }}</h3>
            <p class="text-muted mb-3">
              <i class="bx bx-calendar me-1"></i>
              {{ formatDate(previewData.date_annonce) }}
            </p>
            <div class="card-text" v-html="previewData.contenu_annonce"></div>
          </div>
        </div>
        
        <div class="mt-4 d-flex justify-content-end gap-2">
          <button class="btn btn-secondary" @click="showPreviewModal = false">
            Fermer
          </button>
          <button 
            v-if="!previewData.isPublished"
            class="btn btn-success"
            @click="confirmPublish"
          >
            <i class="bx bx-check-circle me-1"></i>
            Publier cette annonce
          </button>
        </div>
      </div>
    </b-modal>

    <!-- Modal d'image -->
    <b-modal
      v-model="showImageModal"
      title="Image"
      size="lg"
      :hide-footer="true"
    >
      <div class="text-center">
        <img :src="selectedImage" class="img-fluid" alt="Image agrandie" />
      </div>
    </b-modal>

    <!-- Modal d'ajout/modification -->
    <b-modal
      v-model="showModal"
      :title="isEditing ? 'Modifier l\'annonce' : 'Ajouter une annonce'"
      @hidden="resetForm"
      @cancel="handleCancel"
      :hide-footer="true"
      size="lg"
    >
      <form ref="modalForm" @submit.prevent="handleSubmit" novalidate>
        <div class="row">
          <div class="col-12 col-md-6 mb-3">
            <FormField
              v-model="form.titre_annonce"
              label="Titre de l'annonce"
              type="text"
              required
              id="titre_annonce"
            />
          </div>
          <div class="col-12 col-md-6 mb-3">
            <FormField
              v-model="form.visibilite"
              label="Visibilité"
              type="select"
              :options="visibiliteOptions"
              required
              id="visibilite"
            />
          </div>
        </div>

        <div class="row">
          <div class="col-12 col-md-6 mb-3">
            <FormField
              v-model="form.date_annonce"
              label="Date de publication"
              type="date"
              required
              id="date_annonce"
            />
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label">Contenu de l'annonce</label>
          <QuillEditor
            ref="modalFormQuillEditor"
            theme="snow"
            :toolbar="toolbar1"
            style="height: 300px"
            v-model:content="form.contenu_annonce"
            content-type="html"
          />
        </div>

        <div class="mb-3">
          <label class="form-label">Images (optionnel)</label>
          <FileUpload
            v-model="form.images"
            :reset-trigger="modalFormResetTrigger"
            :multiple="true"
            :max-size="5"
            accept=".jpg,.jpeg,.png,.gif,.webp"
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
              isEditing ? "Modifier" : "Créer l'Annonce"
            }}</span>
          </button>
        </div>
      </form>
    </b-modal>

    <!-- Modal de confirmation de suppression -->
    <b-modal
      v-model="showDeleteModal"
      title="Confirmer la suppression"
      @hidden="selectedAnnonce = null"
      @cancel="handleCancel"
      :hide-footer="true"
    >
      <p>Êtes-vous sûr de vouloir supprimer cette annonce ?</p>
      <div v-if="selectedAnnonce">
        <strong>{{ selectedAnnonce.titre_annonce }}</strong>
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

import { showSuccessMessage, showErrorMessage } from "@/helpers/notification";
import { usePermissionStore } from "@/stores/permissionStore";

// Types
interface Annonce {
  id: number;
  id_annonce: number;
  titre_annonce: string;
  contenu_annonce: string;
  date_annonce: string;
  visibilite: 'brouillon' | 'publiee' | 'archivee';
  images_annonce?: string[];
  created_by?: {
    nom: string;
    prenom: string;
  };
  created_at?: string;
}

interface CreateAnnonceRequest {
  titre_annonce: string;
  contenu_annonce: string;
  date_annonce: string;
  visibilite: string;
  images?: File[];
}

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

// Options de visibilité
const visibiliteOptions = [
  { value: 'brouillon', label: 'Brouillon' },
  { value: 'publiee', label: 'Publiée' },
  { value: 'archivee', label: 'Archivée' }
];

// Permissions
const permissions = {
  create: ["annonce:create"],
  update: ["annonce:update"],
  delete: ["annonce:delete"],
  export: ["annonce:export"],
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
const annonces = ref<Annonce[]>([]);
const searchQuery = ref("");
const currentPage = ref(1);
const itemsPerPage = ref(10);
const showModal = ref(false);
const showDeleteModal = ref(false);
const showDetailModal = ref(false);
const showPreviewModal = ref(false);
 const showImageModal = ref(false);
const loading = ref(false);
const quickLoading = ref(false);
const isEditing = ref(false);
const selectedAnnonce = ref<Annonce | null>(null);
const selectedImage = ref("");
const isUploading = ref(false);
const uploadProgress = ref<Record<string, number>>({});
const previewData = ref<any>({});

const quickFormResetTrigger = ref(false);
const modalFormResetTrigger = ref(false);
const quickFormQuillEditor = ref();
const modalFormQuillEditor = ref();

// Formulaires
const form = ref<CreateAnnonceRequest & { id?: number; images?: File[] }>({
  titre_annonce: "",
  contenu_annonce: "",
  date_annonce: "",
  visibilite: "brouillon",
  images: [],
});

const quickForm = ref<CreateAnnonceRequest & { images?: File[] }>({
  titre_annonce: "",
  contenu_annonce: "",
  date_annonce: "",
  visibilite: "brouillon",
  images: [],
});

// Computed
const filteredAnnonces = computed(() => {
  if (!searchQuery.value) return annonces.value;

  return annonces.value.filter(
    (annonce) =>
      annonce.titre_annonce.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      annonce.contenu_annonce.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (annonce.created_by &&
        `${annonce.created_by.prenom} ${annonce.created_by.nom}`
          .toLowerCase()
          .includes(searchQuery.value.toLowerCase()))
  );
});

const publishedAnnonces = computed(() => {
  return annonces.value.filter(annonce => annonce.visibilite === 'publiee');
});

const totalItems = computed(() => filteredAnnonces.value.length);

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

const getVisibilityBadgeClass = (visibilite: string): string => {
  switch (visibilite) {
    case 'publiee': return 'bg-success';
    case 'brouillon': return 'bg-warning';
    case 'archivee': return 'bg-secondary';
    default: return 'bg-secondary';
  }
};

const getVisibilityLabel = (visibilite: string): string => {
  const option = visibiliteOptions.find(opt => opt.value === visibilite);
  return option ? option.label : visibilite;
};

// Méthodes de gestion des modals
const openAddModal = () => {
  isEditing.value = false;
  showModal.value = true;
};

const openEditModal = (annonce: Annonce) => {
  isEditing.value = true;
  selectedAnnonce.value = annonce;
  form.value = {
    id: annonce.id,
    titre_annonce: annonce.titre_annonce,
    contenu_annonce: annonce.contenu_annonce,
    date_annonce: annonce.date_annonce,
    visibilite: annonce.visibilite,
  };

  showModal.value = true;
  showDetailModal.value = false;

  nextTick(() => {
    if (modalFormQuillEditor.value) {
      modalFormQuillEditor.value.setHTML(annonce.contenu_annonce || "");
    }
  });
};

const openDeleteModal = (annonce: Annonce) => {
  selectedAnnonce.value = annonce;
  showDeleteModal.value = true;
};

const viewAnnonce = (annonce: Annonce) => {
  selectedAnnonce.value = annonce;
  showDetailModal.value = true;
};

const viewFullAnnonce = (annonce: Annonce) => {
  selectedAnnonce.value = annonce;
  showDetailModal.value = true;
};

const previewAnnonce = (annonce: Annonce) => {
  previewData.value = { ...annonce, isPublished: annonce.visibilite === 'publiee' };
  showPreviewModal.value = true;
  showDetailModal.value = false;
};

const previewQuickForm = () => {
  previewData.value = {
    titre_annonce: quickForm.value.titre_annonce,
    contenu_annonce: quickForm.value.contenu_annonce,
    date_annonce: quickForm.value.date_annonce,
    visibilite: quickForm.value.visibilite,
    images_annonce: quickForm.value.images?.map(file => URL.createObjectURL(file)) || [],
    isPublished: false
  };
  showPreviewModal.value = true;
};

const showImageModals = (imageUrl: string) => {
  selectedImage.value = imageUrl;
  showImageModal.value = true;
};

const onDetailModalHidden = () => {
  selectedAnnonce.value = null;
};

// Méthodes de gestion des fichiers
const onQuickFormFilesChanged = (files: File[]) => {
  quickForm.value.images = files;
};

const onModalFormFilesChanged = (files: File[]) => {
  form.value.images = files;
};

// Méthodes de soumission
const handleQuickSubmit = async () => {
  if (quickLoading.value || isUploading.value) return;

  try {
    quickLoading.value = true;
    isUploading.value = quickForm.value.images && quickForm.value.images.length > 0;

    // Simulation upload des images
    let imageUrls: string[] = [];
    if (quickForm.value.images && quickForm.value.images.length > 0) {
      imageUrls = await simulateImageUpload(quickForm.value.images);
    }

    // Création de la nouvelle annonce
    const newAnnonce: Annonce = {
      id: Date.now(),
      id_annonce: Date.now(),
      titre_annonce: quickForm.value.titre_annonce,
      contenu_annonce: quickForm.value.contenu_annonce,
      date_annonce: quickForm.value.date_annonce,
      visibilite: quickForm.value.visibilite as 'brouillon' | 'publiee' | 'archivee',
      images_annonce: imageUrls,
      created_by: {
        nom: "Utilisateur",
        prenom: "Admin"
      },
      created_at: new Date().toISOString()
    };

    // Ajout à la liste
    annonces.value.unshift(newAnnonce);

    showSuccessMessage("Annonce créée avec succès");
    resetQuickForm();

  } catch (error) {
    console.error("Erreur lors de la création:", error);
    showErrorMessage("Erreur lors de la création de l'annonce");
  } finally {
    quickLoading.value = false;
    isUploading.value = false;
  }
};

const handleSubmit = async () => {
  if (loading.value || isUploading.value) return;

  try {
    loading.value = true;
    isUploading.value = form.value.images && form.value.images.length > 0;

    // Simulation upload des images
    let imageUrls: string[] = [];
    if (form.value.images && form.value.images.length > 0) {
      imageUrls = await simulateImageUpload(form.value.images);
    }

    if (isEditing.value && form.value.id) {
      // Modification
      const index = annonces.value.findIndex(a => a.id === form.value.id);
      if (index !== -1) {
        annonces.value[index] = {
          ...annonces.value[index],
          titre_annonce: form.value.titre_annonce,
          contenu_annonce: form.value.contenu_annonce,
          date_annonce: form.value.date_annonce,
          visibilite: form.value.visibilite as 'brouillon' | 'publiee' | 'archivee',
          images_annonce: imageUrls.length > 0 ? imageUrls : annonces.value[index].images_annonce
        };
      }
      showSuccessMessage("Annonce modifiée avec succès");
    } else {
      // Création
      const newAnnonce: Annonce = {
        id: Date.now(),
        id_annonce: Date.now(),
        titre_annonce: form.value.titre_annonce,
        contenu_annonce: form.value.contenu_annonce,
        date_annonce: form.value.date_annonce,
        visibilite: form.value.visibilite as 'brouillon' | 'publiee' | 'archivee',
        images_annonce: imageUrls,
        created_by: {
          nom: "Utilisateur",
          prenom: "Admin"
        },
        created_at: new Date().toISOString()
      };
      annonces.value.unshift(newAnnonce);
      showSuccessMessage("Annonce créée avec succès");
    }

    showModal.value = false;
    resetForm();

  } catch (error) {
    console.error("Erreur lors de la soumission:", error);
    showErrorMessage("Erreur lors de l'enregistrement");
  } finally {
    loading.value = false;
    isUploading.value = false;
  }
};

const handleDelete = async () => {
  if (!selectedAnnonce.value || loading.value) return;

  try {
    loading.value = true;

    // Simulation de suppression
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const index = annonces.value.findIndex(a => a.id === selectedAnnonce.value!.id);
    if (index !== -1) {
      annonces.value.splice(index, 1);
    }

    showSuccessMessage("Annonce supprimée avec succès");
    showDeleteModal.value = false;
    selectedAnnonce.value = null;

  } catch (error) {
    console.error("Erreur lors de la suppression:", error);
    showErrorMessage("Erreur lors de la suppression");
  } finally {
    loading.value = false;
  }
};

const publishAnnonce = async (annonce: Annonce) => {
  if (annonce.visibilite === 'publiee') return;

  try {
    loading.value = true;
    
    // Simulation de publication
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const index = annonces.value.findIndex(a => a.id === annonce.id);
    if (index !== -1) {
      annonces.value[index].visibilite = 'publiee';
    }

    showSuccessMessage("Annonce publiée avec succès");

  } catch (error) {
    console.error("Erreur lors de la publication:", error);
    showErrorMessage("Erreur lors de la publication");
  } finally {
    loading.value = false;
  }
};

const confirmPublish = async () => {
  if (!previewData.value) return;

  try {
    loading.value = true;
    
    // Si c'est une prévisualisation du quick form, créer l'annonce
    if (!previewData.value.id) {
      const imageUrls = quickForm.value.images ? 
        await simulateImageUpload(quickForm.value.images) : [];
      
      const newAnnonce: Annonce = {
        id: Date.now(),
        id_annonce: Date.now(),
        titre_annonce: quickForm.value.titre_annonce,
        contenu_annonce: quickForm.value.contenu_annonce,
        date_annonce: quickForm.value.date_annonce,
        visibilite: 'publiee',
        images_annonce: imageUrls,
        created_by: {
          nom: "Utilisateur",
          prenom: "Admin"
        },
        created_at: new Date().toISOString()
      };
      
      annonces.value.unshift(newAnnonce);
      resetQuickForm();
    } else {
      // Publier une annonce existante
      const index = annonces.value.findIndex(a => a.id === previewData.value.id);
      if (index !== -1) {
        annonces.value[index].visibilite = 'publiee';
      }
    }

    showSuccessMessage("Annonce publiée avec succès");
    showPreviewModal.value = false;

  } catch (error) {
    console.error("Erreur lors de la publication:", error);
    showErrorMessage("Erreur lors de la publication");
  } finally {
    loading.value = false;
  }
};

// Méthodes de réinitialisation
const resetForm = () => {
  form.value = {
    titre_annonce: "",
    contenu_annonce: "",
    date_annonce: "",
    visibilite: "brouillon",
    images: [],
  };
  
  modalFormResetTrigger.value = !modalFormResetTrigger.value;
  
  if (modalFormQuillEditor.value) {
    modalFormQuillEditor.value.setHTML("");
  }
  
  isEditing.value = false;
  selectedAnnonce.value = null;
};

const resetQuickForm = () => {
  quickForm.value = {
    titre_annonce: "",
    contenu_annonce: "",
    date_annonce: "",
    visibilite: "brouillon",
    images: [],
  };
  
  quickFormResetTrigger.value = !quickFormResetTrigger.value;
  
  if (quickFormQuillEditor.value) {
    quickFormQuillEditor.value.setHTML("");
  }
};

const handleCancel = () => {
  showModal.value = false;
  showDeleteModal.value = false;
  resetForm();
};

// Simulation d'upload d'images
const simulateImageUpload = async (files: File[]): Promise<string[]> => {
  const imageUrls: string[] = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    // Simulation du progress
    for (let progress = 0; progress <= 100; progress += 20) {
      uploadProgress.value[file.name] = progress;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Créer une URL temporaire pour l'image
    imageUrls.push(URL.createObjectURL(file));
  }
  
  return imageUrls;
};

// Données de mock
const mockAnnonces: Annonce[] = [
  {
    id: 1,
    id_annonce: 1001,
    titre_annonce: "Renforcement des heures de mathématiques",
    contenu_annonce: "<p>À partir du deuxième trimestre, les élèves de 4e et 3e auront une heure supplémentaire de mathématiques chaque semaine afin de mieux préparer les examens nationaux.</p><ul><li>Heures ajoutées : mercredi après-midi</li><li>Groupes de niveau mis en place</li><li>Séances d'exercices encadrées</li></ul>",
    date_annonce: "2024-12-15",
    visibilite: "publiee",
    images_annonce: [
      "https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1453733190371-0a9bedd82893?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    ],
    created_by: {
      nom: "ZINSOU",
      prenom: "Charlemagne"
    },
    created_at: "2024-12-10T10:00:00Z"
  },
  {
    id: 2,
    id_annonce: 1002,
    titre_annonce: "Cours de rattrapage pour les Terminales",
    contenu_annonce: "<p>Des cours de rattrapage seront organisés les samedis pour les classes de Terminale (A, C et D) en vue du Baccalauréat.</p><ul><li>Matières : Maths, Physique, Philo</li><li>Horaire : 08h à 12h</li><li>Présence obligatoire</li></ul>",
    date_annonce: "2024-12-20",
    visibilite: "publiee",
    images_annonce: [
      "https://plus.unsplash.com/premium_photo-1713890424186-11d3584a22fc?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    ],
    created_by: {
      nom: "AGOSSA",
      prenom: "Clarisse"
    },
    created_at: "2024-12-18T14:30:00Z"
  },
  {
    id: 3,
    id_annonce: 1003,
    titre_annonce: "Séminaire des élèves délégués",
    contenu_annonce: "<p>Les délégués de classe de la 6e à la Terminale sont conviés à un séminaire de leadership scolaire.</p><ul><li>Date : samedi 13 janvier 2025</li><li>Lieu : Salle Polyvalente</li><li>Thèmes : responsabilité, communication, entraide</li></ul>",
    date_annonce: "2025-01-15",
    visibilite: "brouillon",
    images_annonce: [
      "https://images.unsplash.com/flagged/photo-1579133311477-9121405c78dd?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1632215863479-201029d93143?q=80&w=869&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    ],
    created_by: {
      nom: "KIKI",
      prenom: "Ulrich"
    },
    created_at: "2024-12-22T09:15:00Z"
  },
  {
    id: 4,
    id_annonce: 1004,
    titre_annonce: "Journée sportive interclasses",
    contenu_annonce: "<p>La journée sportive annuelle réunira toutes les classes de la 6e à la 1ère pour des compétitions : football, handball, athlétisme, relais, etc.</p><p>Chaque élève devra porter l’uniforme de sport de l’école. Les équipes seront constituées par niveau.</p>",
    date_annonce: "2025-01-25",
    visibilite: "brouillon",
    images_annonce: [],
    created_by: {
      nom: "TOGNISSÈ",
      prenom: "Adjovi"
    },
    created_at: "2024-12-23T16:45:00Z"
  },
  {
    id: 5,
    id_annonce: 1005,
    titre_annonce: "Concours de dictée pour les 6e et 5e",
    contenu_annonce: "<p>Un concours de dictée est lancé pour les élèves de 6e et 5e. Les meilleurs recevront des récompenses en fin de trimestre.</p><ul><li>Inscription jusqu’au 31 janvier</li><li>Épreuve prévue le 10 février</li><li>Jury composé de professeurs de français</li></ul>",
    date_annonce: "2025-02-10",
    visibilite: "publiee",
    images_annonce: [
      "https://images.unsplash.com/photo-1610500796951-dea9be78d987?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1726831662518-c48d983f9b86?q=80&w=1032&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1583951171188-48057a97073f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y29uY291ciUyMGVjcml0JTIwZWNvbGUlMjBhZnJpcXVlfGVufDB8fDB8fHww"
    ],
    created_by: {
      nom: "YAROU",
      prenom: "Firmin"
    },
    created_at: "2024-12-20T11:20:00Z"
  },
  {
    id: 6,
    id_annonce: 1006,
    titre_annonce: "Révision des règlements intérieurs",
    contenu_annonce: "<p>Le règlement intérieur de l’établissement a été mis à jour. Des réunions de sensibilisation par classe auront lieu dès la rentrée de février.</p><ul><li>Tenue vestimentaire</li><li>Utilisation des téléphones</li><li>Respect des horaires</li></ul>",
    date_annonce: "2025-02-28",
    visibilite: "archivee",
    images_annonce: [
      "https://images.unsplash.com/photo-1551241681-2aae145af5df?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8cmVnbGVtZW50JTIwZWNvbGUlMjBhZnJpcXVlfGVufDB8fDB8fHww"
    ],
    created_by: {
      nom: "BIO TCHANE",
      prenom: "Mariam"
    },
    created_at: "2024-12-19T13:10:00Z"
  }
];


// Initialisation
onMounted(() => {
  // Charger les données de mock
  annonces.value = [...mockAnnonces];
  
  // Définir la date par défaut à aujourd'hui
  const today = new Date().toISOString().split('T')[0];
  form.value.date_annonce = today;
  quickForm.value.date_annonce = today;
});
</script>