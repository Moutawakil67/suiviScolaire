<template>
  <VerticalLayout>
    <div class="container-fluid">
    
      <PageTitle title="Gestion des Matières" />
      <!-- En-tête avec barre de recherche et boutons -->
      <div class="row g-3 mb-4">
                <div class="col-12 col-md-6">
                    <div class="input-group">
                        <span class="input-group-text">
                            <i class="bx bx-search"></i>
                        </span>
                        <input 
                            type="text" 
                            class="form-control" 
                            placeholder="Rechercher une matière..." 
                            v-model="searchQuery"
                        >
                    </div>
                </div>
                <div class="col-12 col-md-6 d-flex justify-content-md-end justify-content-center gap-2">
                    <button 
                        v-if="canCreate" 
                        class="btn btn-primary" 
                        @click="openAddModal"
                        :disabled="loading"
                    >
                        <i class="bx bx-plus me-1"></i> Ajouter
                    </button>
                    <button 
                        v-if="canExport" 
                        class="btn btn-success flex-shrink-0"
                        :disabled="loading"
                    >
                        <i class="bx bx-download me-1"></i> Exporter
                    </button>
                </div>
            </div>

            <!-- Tableau des matières -->
            <div class="card">
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-centered table-hover">
                            <thead>
                                <tr>
                                    <th>Matière</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="matiere in filteredMatieres" :key="matiere.id_matiere">
                                    <td>
                                        <div class="d-flex align-items-center">
                                            <div class="avatar-sm me-3">
                                                <div class="avatar-title bg-primary rounded-circle text-white">
                                                    {{ matiere.nom_matiere.substring(0, 2).toUpperCase() }}
                                                </div>
                                            </div>
                                            <div>
                                                <h6 class="mb-0">{{ matiere.nom_matiere }}</h6>
                                                <small class="text-muted">ID: {{ matiere.id_matiere }}</small>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div class="d-flex gap-2">
                                            <button 
                                                v-if="canUpdate" 
                                                class="btn btn-sm btn-soft-primary" 
                                                @click="openEditModal(matiere)"
                                                :disabled="loading"
                                            >
                                                <i class="bx bx-pencil"></i>
                                            </button>
                                            <button 
                                                v-if="canDelete" 
                                                class="btn btn-sm btn-soft-danger" 
                                                @click="openDeleteModal(matiere)"
                                                :disabled="loading"
                                            >
                                                <i class="bx bx-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                <tr v-if="filteredMatieres.length === 0">
                                    <td colspan="2" class="text-center py-4">
                                        <div class="text-muted">
                                            <i class="bx bx-search-alt-2 display-4"></i>
                                            <p class="mt-2 mb-0">Aucune matière trouvée</p>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
                    <!-- Pagination -->
                    <div class="d-flex justify-content-between align-items-center mt-3" v-if="totalPages > 1">
                        <div class="text-muted">
                            Affichage de {{ startIndex + 1 }} à {{ Math.min(startIndex + itemsPerPage, totalItems) }} sur {{ totalItems }} matières
                        </div>
                        <nav>
                            <ul class="pagination pagination-sm mb-0">
                                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                                    <button class="page-link" @click="currentPage = Math.max(1, currentPage - 1)">
                                        <i class="bx bx-chevron-left"></i>
                                    </button>
                                </li>
                                <li class="page-item active">
                                    <span class="page-link">{{ currentPage }} / {{ totalPages }}</span>
                                </li>
                                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                                    <button class="page-link" @click="currentPage = Math.min(totalPages, currentPage + 1)">
                                        <i class="bx bx-chevron-right"></i>
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal d'ajout/modification -->
        <div class="modal" :class="{ show: showModal, 'd-block': showModal }" tabindex="-1" v-if="showModal">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">{{ isEditing ? 'Modifier la matière' : 'Ajouter une matière' }}</h5>
                        <button type="button" class="btn-close" @click="handleCancel"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <label for="nom_matiere" class="form-label">Nom de la matière <span class="text-danger">*</span></label>
                            <input
                                type="text"
                                class="form-control"
                                :class="{ 'is-invalid': formErrors?.nom_matiere }"
                                id="nom_matiere"
                                v-model="form.nom_matiere"
                                placeholder="Ex: Mathématiques"
                                required
                            >
                            <div v-if="formErrors?.nom_matiere" class="invalid-feedback">
                                {{ formErrors.nom_matiere[0] }}
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" @click="handleCancel" :disabled="loading">
                            Annuler
                        </button>
                        <button type="button" class="btn btn-primary" @click="handleSubmit" :disabled="loading">
                            <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
                            <span v-if="loading">En cours...</span>
                            <span v-else>{{ isEditing ? 'Modifier' : 'Ajouter' }}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal de confirmation de suppression -->
        <div class="modal" :class="{ show: showDeleteModal, 'd-block': showDeleteModal }" tabindex="-1" v-if="showDeleteModal">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title text-danger">Confirmer la suppression</h5>
                        <button type="button" class="btn-close" @click="handleCancel"></button>
                    </div>
                    <div class="modal-body">
                        <div class="text-center">
                            <i class="bx bx-error-circle text-danger display-4"></i>
                            <p class="mt-3">Êtes-vous sûr de vouloir supprimer la matière <strong>"{{ selectedMatiere?.nom_matiere }}"</strong> ?</p>
                            <p class="text-muted">Cette action est irréversible.</p>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" @click="handleCancel" :disabled="loading">
                            Annuler
                        </button>
                        <button type="button" class="btn btn-danger" @click="handleDelete" :disabled="loading">
                            <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
                            <span v-if="loading">En cours...</span>
                            <span v-else>Supprimer</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>


  </VerticalLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import LoadingButton from '@/components/LoadingButton.vue';
import ExportButton from '@/components/ExportButton.vue';
import VerticalLayout from '@/layouts/VerticalLayout.vue';
import PageTitle from '@/components/PageTitle.vue';
import FormField from '@/components/FormField.vue';
import TablePagination from '@/components/TablePagination.vue';
import { categorieService } from '@/services/categorie';
import { showSuccessMessage, showErrorMessage } from '@/helpers/notification';
import { usePermissionStore } from '@/stores/permissionStore';
import SearchBox from '@/components/SearchBox.vue';

// Définition des permissions requises pour chaque action
const permissions = {
  create: ['categorie:create'],
  update: ['categorie:update'],
  delete: ['categorie:delete'],
  export: ['categorie:export']
};

// Utilisation du store de permissions
const permissionStore = usePermissionStore();

// Vérification des permissions
const canCreate = computed(() => permissionStore.checkPermissions(permissions.create));
const canUpdate = computed(() => permissionStore.checkPermissions(permissions.update));
const canDelete = computed(() => permissionStore.checkPermissions(permissions.delete));
const canExport = computed(() => permissionStore.checkPermissions(permissions.export));

// État
  // État
  const matieres = ref([
                    { id_matiere: 1, nom_matiere: 'Mathématiques' },
                    { id_matiere: 2, nom_matiere: 'Physique-Chimie' },
                    { id_matiere: 3, nom_matiere: 'Sciences de la Vie et de la Terre' },
                    { id_matiere: 4, nom_matiere: 'Histoire-Géographie' },
                    { id_matiere: 5, nom_matiere: 'Français' },
                    { id_matiere: 6, nom_matiere: 'Anglais' },
                    { id_matiere: 7, nom_matiere: 'Éducation Physique et Sportive' },
                    { id_matiere: 8, nom_matiere: 'Arts Plastiques' },
                    { id_matiere: 9, nom_matiere: 'Musique' },
                    { id_matiere: 10, nom_matiere: 'Technologie' },
                    { id_matiere: 11, nom_matiere: 'Économie-Gestion' },
                    { id_matiere: 12, nom_matiere: 'Philosophie' }
                ]);

                const searchQuery = ref('');
                const currentPage = ref(1);
                const itemsPerPage = ref(8);
                const showModal = ref(false);
                const showDeleteModal = ref(false);
                const loading = ref(false);
                const isEditing = ref(false);
                const selectedMatiere = ref(null);

                // Formulaire
                const form = ref({
                    nom_matiere: ''
                });

                const formErrors = ref({});

                // // Permissions simulées
                // const canCreate = ref(true);
                // const canUpdate = ref(true);
                // const canDelete = ref(true);
                // const canExport = ref(true);

                // Computed properties
                const filteredMatieres = computed(() => {
                    let filtered = matieres.value;
                    
                    if (searchQuery.value) {
                        filtered = filtered.filter(matiere =>
                            matiere.nom_matiere.toLowerCase().includes(searchQuery.value.toLowerCase())
                        );
                    }
                    
                    const startIndex = (currentPage.value - 1) * itemsPerPage.value;
                    const endIndex = startIndex + itemsPerPage.value;
                    
                    return filtered.slice(startIndex, endIndex);
                });

                const totalItems = computed(() => {
                    if (searchQuery.value) {
                        return matieres.value.filter(matiere =>
                            matiere.nom_matiere.toLowerCase().includes(searchQuery.value.toLowerCase())
                        ).length;
                    }
                    return matieres.value.length;
                });

                const totalPages = computed(() => {
                    return Math.ceil(totalItems.value / itemsPerPage.value);
                });

                const startIndex = computed(() => {
                    return (currentPage.value - 1) * itemsPerPage.value;
                });

                // Méthodes
                const openAddModal = () => {
                    isEditing.value = false;
                    showModal.value = true;
                };

                const openEditModal = (matiere) => {
                    isEditing.value = true;
                    selectedMatiere.value = matiere;
                    form.value = { ...matiere };
                    showModal.value = true;
                };

                const openDeleteModal = (matiere) => {
                    selectedMatiere.value = matiere;
                    showDeleteModal.value = true;
                };

                const resetForm = () => {
                    form.value = {
                        nom_matiere: ''
                    };
                    formErrors.value = {};
                    selectedMatiere.value = null;
                };

                const validateForm = () => {
                    const errors = [];
                    if (!form.value.nom_matiere.trim()) errors.push('Le nom de la matière est requis');
                    return errors;
                };

                const handleSubmit = async () => {
                    loading.value = true;
                    
                    try {
                        const errors = validateForm();
                        if (errors.length > 0) {
                            alert(errors.join('\n'));
                            loading.value = false;
                            return;
                        }

                        // Simulation d'un délai réseau
                        await new Promise(resolve => setTimeout(resolve, 1000));

                        if (isEditing.value && selectedMatiere.value) {
                            const index = matieres.value.findIndex(m => m.id_matiere === selectedMatiere.value.id_matiere);
                            if (index !== -1) {
                                matieres.value[index] = { ...matieres.value[index], ...form.value };
                                alert('Matière modifiée avec succès');
                            }
                        } else {
                            const newMatiere = {
                                id_matiere: Math.max(...matieres.value.map(m => m.id_matiere)) + 1,
                                nom_matiere: form.value.nom_matiere
                            };
                            matieres.value.unshift(newMatiere);
                            alert('Matière créée avec succès');
                        }
                        
                        showModal.value = false;
                        resetForm();
                    } catch (error) {
                        alert('Erreur lors de la soumission');
                    } finally {
                        loading.value = false;
                    }
                };

                const handleDelete = async () => {
                    loading.value = true;
                    
                    try {
                        // Simulation d'un délai réseau
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        
                        matieres.value = matieres.value.filter(m => m.id_matiere !== selectedMatiere.value?.id_matiere);
                        alert('Matière supprimée avec succès');
                        showDeleteModal.value = false;
                    } catch (error) {
                        alert('Erreur lors de la suppression');
                    } finally {
                        loading.value = false;
                    }
                };

                const handleCancel = () => {
                    showModal.value = false;
                    showDeleteModal.value = false;
                    resetForm();
                    selectedMatiere.value = null;
                    isEditing.value = false;
                };

</script>

<style scoped>
.search-box {
  max-width: 300px;
}
</style>


