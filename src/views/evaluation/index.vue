<template>
  <VerticalLayout>
    <div class="container-fluid">
      <PageTitle title="Gestion des évaluations" />
      
      <!-- Filtres -->
      <div class="card mb-4">
        <div class="card-body">
          <div class="row g-3">
            <div class="col-12 col-md-3">
              <FormField
                v-model="filters.annee_scolaire"
                label="Année scolaire"
                type="select"
                :options="anneesOptions"
                placeholder="Toutes les années"
              />
            </div>
            <div class="col-12 col-md-3">
              <FormField
                v-model="filters.classe_id"
                label="Classe"
                type="select"
                :options="classesOptions"
                placeholder="Toutes les classes"
              />
            </div>
            <div class="col-12 col-md-3">
              <FormField
                v-model="filters.trimestre"
                label="Trimestre"
                type="select"
                :options="trimestreOptions"
                placeholder="Tous les trimestres"
              />
            </div>
            <div class="col-12 col-md-3">
              <FormField
                v-model="filters.matiere_id"
                label="Matière"
                type="select"
                :options="matieresOptions"
                placeholder="Toutes les matières"
              />
            </div>
          </div>
          <div class="row mt-3">
            <div class="col-12">
              <button class="btn btn-primary me-2" @click="applyFilters">
                <i class="bx bx-search me-1"></i> Filtrer
              </button>
              <button class="btn btn-outline-secondary" @click="resetFilters">
                <i class="bx bx-refresh me-1"></i> Réinitialiser
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- En-tête avec barre de recherche et boutons -->
      <div class="row g-3 mb-4">
        <div class="col-12 col-md-6">
          <SearchBox
            v-model="searchQuery"
            placeholder="Rechercher une évaluation..."
            class="w-100"
          />
        </div>
        <div class="col-12 col-md-6 d-flex justify-content-md-end justify-content-center gap-2">
          <LoadingButton
            v-if="canCreate"
            variant="primary"
            @click="openAddModal"
          >
            <i class="bx bx-plus me-1"></i> Ajouter
          </LoadingButton>
          <ExportButton
            v-if="canExport"
            :data="evaluations"
            filename="evaluations"
            label="Exporter"
            class="flex-shrink-0"
          />
        </div>
      </div>

      <!-- Tableau des évaluations par matière -->
      <div class="card">
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-centered table-hover">
              <thead>
                <tr>
                  <th>Matière</th>
                  <th>Classe</th>
                  <th>Trimestre</th>
                  <th>Interrogations</th>
                  <th>Devoirs</th>
                  <th>Coefficient</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="evaluation in filteredEvaluations" :key="evaluation.id">
                  <td>
                    <strong>{{ evaluation.matiere.nom_matiere }}</strong>
                  </td>
                  <td>{{ evaluation.classe.nom_classe }}</td>
                  <td>
                    <span class="badge bg-info">{{ evaluation.trimestre }}</span>
                  </td>
                  <td>
                    <div class="d-flex gap-1">
                      <span 
                        v-for="(interro, index) in evaluation.interrogations" 
                        :key="index"
                        class="badge bg-success"
                        style="cursor: pointer"
                        @click="showEvaluationDetails(interro, 'Interrogation', index + 1)"
                      >
                        Int {{ index + 1 }}
                      </span>
                      <button 
                        class="btn btn-sm btn-outline-success"
                        @click="addInterrogation(evaluation)"
                        title="Ajouter une interrogation"
                      >
                        <i class="bx bx-plus"></i>
                      </button>
                    </div>
                  </td>
                  <td>
                    <div class="d-flex gap-1">
                      <span 
                        v-for="(devoir, index) in evaluation.devoirs" 
                        :key="index"
                        class="badge bg-warning"
                        style="cursor: pointer"
                        @click="showEvaluationDetails(devoir, 'Devoir', index + 1)"
                      >
                        Dev {{ index + 1 }}
                      </span>
                      <button 
                        class="btn btn-sm btn-outline-warning"
                        @click="addDevoir(evaluation)"
                        title="Ajouter un devoir"
                      >
                        <i class="bx bx-plus"></i>
                      </button>
                    </div>
                  </td>
                  <td>{{ evaluation.matiere.coefficient }}</td>
                  <td>
                    <div class="d-flex gap-2">
                      <button
                        class="btn btn-sm btn-soft-info"
                        @click="viewEvaluationSummary(evaluation)"
                        title="Voir le résumé"
                      >
                        <i class="bx bx-show"></i>
                      </button>
                      <button
                        v-if="canUpdate"
                        class="btn btn-sm btn-soft-primary"
                        @click="openEditModal(evaluation)"
                      >
                        <i class="bx bx-pencil"></i>
                      </button>
                      <button
                        v-if="canDelete"
                        class="btn btn-sm btn-soft-danger"
                        @click="openDeleteModal(evaluation)"
                      >
                        <i class="bx bx-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="filteredEvaluations.length === 0">
                  <td colspan="7" class="text-center">Aucune évaluation trouvée</td>
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
    </div>

    <!-- Modal d'ajout/modification d'évaluation -->
    <b-modal
      v-model="showModal"
      :title="isEditing ? 'Modifier l\'évaluation' : 'Ajouter une évaluation'"
      @hidden="resetForm"
      :ok-disabled="loading"
      :ok-title="buttonText"
      :cancel-title="'Annuler'"
      @ok="handleSubmit"
      @cancel="handleCancel"
      size="lg"
    >
      <form ref="evaluationForm" @submit.prevent="handleSubmit" novalidate>
        <div class="row">
          <div class="col-md-6 mb-3">
            <FormField
              v-model="formData.matiere_id"
              label="Matière"
              type="select"
              required
              :options="matieresOptions"
              :error="formErrors?.matiere_id?.[0]"
            />
          </div>
          <div class="col-md-6 mb-3">
            <FormField
              v-model="formData.classe_id"
              label="Classe"
              type="select"
              required
              :options="classesOptions"
              :error="formErrors?.classe_id?.[0]"
            />
          </div>
        </div>
        
        <div class="row">
          <div class="col-md-6 mb-3">
            <FormField
              v-model="formData.trimestre"
              label="Trimestre"
              type="select"
              required
              :options="trimestreOptions"
              :error="formErrors?.trimestre?.[0]"
            />
          </div>
          <div class="col-md-6 mb-3">
            <FormField
              v-model="formData.annee_scolaire"
              label="Année scolaire"
              type="select"
              required
              :options="anneesOptions"
              :error="formErrors?.annee_scolaire?.[0]"
            />
          </div>
        </div>
      </form>
    </b-modal>

    <!-- Modal de détails d'évaluation -->
    <b-modal
      v-model="showDetailsModal"
      :title="`${selectedEvaluationType} ${selectedEvaluationNumber} - ${selectedEvaluation?.matiere?.nom_matiere}`"
      @hidden="selectedEvaluation = null"
      :hide-footer="true"
      size="xl"
    >
      <div v-if="selectedEvaluation">
        <div class="row mb-3">
          <div class="col-md-4">
            <strong>Classe:</strong> {{ selectedEvaluation.classe?.nom_classe }}
          </div>
          <div class="col-md-4">
            <strong>Trimestre:</strong> {{ selectedEvaluation.trimestre }}
          </div>
          <div class="col-md-4">
            <strong>Date:</strong> {{ formatDate(selectedEvaluation.date_evaluation) }}
          </div>
        </div>

        <!-- Liste des notes des apprenants -->
        <div class="table-responsive">
          <table class="table table-sm table-bordered">
            <thead class="table-light">
              <tr>
                <th>Apprenant</th>
                <th>Note / 20</th>
                <th>Coefficient</th>
                <th>Note pondérée</th>
                <th>Appréciation</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="note in selectedEvaluation.notes" :key="note.id">
                <td>{{ note.apprenant?.nom }} {{ note.apprenant?.prenom }}</td>
                <td>
                  <span :class="getNoteClass(note.note)">
                    {{ note.note }}/20
                  </span>
                </td>
                <td>{{ selectedEvaluation.matiere?.coefficient }}</td>
                <td>{{ (note.note * selectedEvaluation.matiere?.coefficient).toFixed(2) }}</td>
                <td>
                  <span :class="getAppreciationClass(note.note)">
                    {{ getAppreciation(note.note) }}
                  </span>
                </td>
                <td>
                  <button 
                    class="btn btn-sm btn-outline-primary"
                    @click="editNote(note)"
                  >
                    <i class="bx bx-pencil"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Statistiques -->
        <div class="row mt-4">
          <div class="col-md-3">
            <div class="card text-center">
              <div class="card-body">
                <h5 class="card-title text-success">{{ getEvaluationStats().moyenne.toFixed(2) }}</h5>
                <p class="card-text">Moyenne</p>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card text-center">
              <div class="card-body">
                <h5 class="card-title text-info">{{ getEvaluationStats().noteMax }}</h5>
                <p class="card-text">Note max</p>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card text-center">
              <div class="card-body">
                <h5 class="card-title text-warning">{{ getEvaluationStats().noteMin }}</h5>
                <p class="card-text">Note min</p>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card text-center">
              <div class="card-body">
                <h5 class="card-title text-primary">{{ getEvaluationStats().tauxReussite }}%</h5>
                <p class="card-text">Taux de réussite</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </b-modal>

    <!-- Modal de confirmation de suppression -->
    <b-modal
      v-model="showDeleteModal"
      title="Confirmer la suppression"
      @hidden="selectedEvaluation = null"
      :ok-disabled="loading"
      :ok-title="loading ? 'Suppression...' : 'Supprimer'"
      :cancel-title="'Annuler'"
      @ok="handleDelete"
      @cancel="handleCancel"
    >
      <p>Êtes-vous sûr de vouloir supprimer cette évaluation et toutes les notes associées ?</p>
    </b-modal>
  </VerticalLayout>
</template>