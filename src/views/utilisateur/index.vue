<template>
  <VerticalLayout>
    <div class="container-fluid">
      <PageTitle title="Mon Profil" />
      <!-- En-tête avec informations du parent -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card">
            <div class="card-body">
              <div class="d-flex align-items-center mb-3">
                <div class="avatar-lg me-3">
                  <div class="avatar-title bg-soft-primary text-primary display-4 m-0 rounded-circle">
                    <i class="bx bxs-user-circle"></i>
                  </div>
                </div>
                <div>
                  <h4 class="mb-1">{{ currentParent.prenom }} {{ currentParent.nom }}</h4>
                  <p class="text-muted mb-0"><i class="bx bx-envelope me-1"></i>{{ currentParent.email }}</p>
                  <p class="text-muted mb-0"><i class="bx bx-phone me-1"></i>{{ currentParent.telephone }}</p>
                </div>
                <div class="ms-auto">
                  <LoadingButton
                    variant="primary"
                    @click="openEditModal(currentParent)"
                  >
                    <i class="bx bx-edit me-1"></i> Modifier mon profil
                  </LoadingButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Section des informations personnelles -->
      <div class="card mb-4">
        <div class="card-header">
          <h5 class="card-title mb-0">Informations personnelles</h5>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6 mb-3">
              <h6 class="text-muted fw-normal">Nom complet</h6>
              <p>{{ currentParent.prenom }} {{ currentParent.nom }}</p>
            </div>
            <div class="col-md-6 mb-3">
              <h6 class="text-muted fw-normal">Email</h6>
              <p>{{ currentParent.email }}</p>
            </div>
            <div class="col-md-6 mb-3">
              <h6 class="text-muted fw-normal">Téléphone</h6>
              <p>{{ currentParent.telephone }}</p>
            </div>
            <div class="col-md-6 mb-3">
              <h6 class="text-muted fw-normal">Adresse</h6>
              <p>{{ currentParent.adresse || 'Non renseignée' }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Section des enfants -->
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="card-title mb-0">Mes enfants</h5>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-centered table-hover">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Prénom</th>
                  <th>Date de naissance</th>
                  <th>Classe</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="enfant in currentParent.enfants" :key="enfant.id">
                  <td>{{ enfant.nom }}</td>
                  <td>{{ enfant.prenom }}</td>
                  <td>{{ enfant.date_naissance ? formatDate(enfant.date_naissance) : 'Non renseignée' }}</td>
                  <td>
                    <span class="badge bg-soft-success text-success">
                      {{ enfant.classe || 'Non assignée' }}
                    </span>
                  </td>
                  <td>
                    <div class="d-flex gap-2">
                      <button class="btn btn-sm btn-soft-primary" @click="viewChildDetails(enfant)">
                        <i class="bx bx-show"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de modification du profil -->
    <b-modal 
      v-model="showModal"
      title="Modifier mon profil"
      @hidden="resetForm"
      :ok-disabled="loading"
      :ok-title="loading ? loadingText : 'Enregistrer'"
      :cancel-title="'Annuler'"
      @ok="handleSubmit"
      @cancel="handleCancel"
      :hide-footer="false"
    >
      <form ref="profileForm" @submit.prevent="handleSubmit">
        <div class="row g-3">
          <div class="col-md-6">
            <FormField
              id="utilisateur-nom"
              v-model="formData.nom"
              label="Nom"
              type="text"
              required
              :error="formErrors?.nom?.[0]"
            />
          </div>
          <div class="col-md-6">
            <FormField
              id="utilisateur-prenom"
              v-model="formData.prenom"
              label="Prénom"
              type="text"
              required
              :error="formErrors?.prenom?.[0]"
            />
          </div>
          <div class="col-md-6">
            <FormField
              id="utilisateur-email"
              v-model="formData.email"
              label="Email"
              type="email"
              disabled
              :error="formErrors?.email?.[0]"
            />
          </div>
          <div class="col-md-6">
            <FormField
              id="utilisateur-telephone"
              v-model="formData.telephone"
              label="Téléphone"
              type="tel"
              required
              :error="formErrors?.telephone?.[0]"
            />
          </div>
          <div class="col-md-12">
            <FormField
              id="utilisateur-adresse"
              v-model="formData.adresse"
              label="Adresse"
              type="text"
              required
              :error="formErrors?.adresse?.[0]"
            />
          </div>
          <div class="col-12">
            <h6 class="mb-2">Changer le mot de passe</h6>
            <div class="row g-3">
              <div class="col-md-6">
                <FormField
                  id="utilisateur-current-password"
                  v-model="formData.currentPassword"
                  label="Mot de passe actuel"
                  type="password"
                  :error="formErrors?.currentPassword?.[0]"
                />
              </div>
              <div class="col-md-6">
                <FormField
                  id="utilisateur-new-password"
                  v-model="formData.newPassword"
                  label="Nouveau mot de passe"
                  type="password"
                  :error="formErrors?.newPassword?.[0]"
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </b-modal>

    <!-- Modal de détails de l'enfant -->
    <b-modal
      v-model="showChildDetailsModal"
      title="Détails de l'enfant"
      :hide-footer="true"
    >
      <div v-if="selectedChild">
        <div class="d-flex align-items-center mb-4">
          <div class="avatar-md me-3">
            <div class="avatar-title bg-soft-primary text-primary display-6 m-0 rounded-circle">
              <i class="bx bx-user"></i>
            </div>
          </div>
          <div>
            <h5 class="mb-1">{{ selectedChild.prenom }} {{ selectedChild.nom }}</h5>
            <p class="text-muted mb-0">{{ selectedChild.classe || 'Classe non assignée' }}</p>
          </div>
        </div>

        <div class="row mb-3">
          <div class="col-md-6 mb-3">
            <h6 class="text-muted fw-normal">Date de naissance</h6>
            <p>{{ selectedChild.date_naissance ? formatDate(selectedChild.date_naissance) : 'Non renseignée' }}</p>
          </div>
          <div class="col-md-6 mb-3">
            <h6 class="text-muted fw-normal">Âge</h6>
            <p>{{ calculateAge(selectedChild.date_naissance) }}</p>
          </div>
        </div>

        <div class="d-flex justify-content-end mt-4">
          <button class="btn btn-secondary" @click="showChildDetailsModal = false">Fermer</button>
        </div>
      </div>
    </b-modal>
    <!-- </div> -->
  </VerticalLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import VerticalLayout from '@/layouts/VerticalLayout.vue';
import PageTitle from '@/components/PageTitle.vue';
import LoadingButton from '@/components/LoadingButton.vue';
import FormField from '@/components/FormField.vue';
import { showSuccessMessage, showErrorMessage } from '@/helpers/notification';

// État global
const showModal = ref(false);
const showChildDetailsModal = ref(false);
const loading = ref(false);
const formErrors = ref({});
const selectedChild = ref(null);

// Données du parent connecté (simulées pour le mockup)
const currentParent = ref({
  id: 1,
  nom: 'ZINSOU',
  prenom: 'Christophe',
  email: 'christophe.zinsou@email.com',
  telephone: '0123456789',
  adresse: '123 Rue des Écoles, 75001 Paris',
  enfants: [
    { 
      id: 1, 
      nom: 'ZINSOU', 
      prenom: 'Lucas', 
      date_naissance: '2012-03-20',
      classe: 'CM2'
    },
    { 
      id: 2, 
      nom: 'ZINSOU', 
      prenom: 'Emma', 
      date_naissance: '2015-07-10',
      classe: 'CE1'
    }
  ]
});

// Formatage de la date
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('fr-FR');
};

// Calcul de l'âge à partir de la date de naissance
const calculateAge = (birthDate) => {
  if (!birthDate) return 'Non renseigné';
  
  const today = new Date();
  const birth = new Date(birthDate);
  
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return `${age} ans`;
};

// Gestion du formulaire
const resetForm = () => {
  formData.value = {
    nom: currentParent.value.nom,
    prenom: currentParent.value.prenom,
    email: currentParent.value.email,
    telephone: currentParent.value.telephone,
    adresse: currentParent.value.adresse,
    currentPassword: '',
    newPassword: ''
  };
  formErrors.value = {};
};

const formData = ref({
  nom: '',
  prenom: '',
  email: '',
  telephone: '',
  adresse: '',
  currentPassword: '',
  newPassword: ''
});

// Initialisation du formulaire avec les données du parent connecté
onMounted(() => {
  resetForm();
});

const validateForm = () => {
  const errors = [];
  if (!formData.value.nom.trim()) errors.push('Le nom est requis');
  if (!formData.value.prenom.trim()) errors.push('Le prénom est requis');
  if (!formData.value.telephone?.trim()) errors.push('Le téléphone est requis');
  if (!formData.value.adresse?.trim()) errors.push('L\'adresse est requise');
  
  // Validation du changement de mot de passe si demandé
  if (formData.value.currentPassword && !formData.value.newPassword) {
    errors.push('Veuillez saisir un nouveau mot de passe');
  }
  if (!formData.value.currentPassword && formData.value.newPassword) {
    errors.push('Veuillez saisir votre mot de passe actuel');
  }
  
  return errors;
};

// Actions
const handleSubmit = async (event) => {
  event.preventDefault();
  try {
    loading.value = true;
    formErrors.value = {};
    const errors = validateForm();
    if (errors.length > 0) {
      showErrorMessage(errors.join('\n'));
      return;
    }

    // Simulation d'une requête API pour mettre à jour le profil
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mise à jour des données du parent
    currentParent.value = {
      ...currentParent.value,
      nom: formData.value.nom,
      prenom: formData.value.prenom,
      telephone: formData.value.telephone,
      adresse: formData.value.adresse
    };

    showSuccessMessage('Profil mis à jour avec succès');
    showModal.value = false;
  } catch (error) {
    showErrorMessage('Erreur lors de la mise à jour du profil');
  } finally {
    loading.value = false;
  }
};

const openEditModal = (parent) => {
  resetForm();
  showModal.value = true;
};

const viewChildDetails = (child) => {
  selectedChild.value = child;
  showChildDetailsModal.value = true;
};

const handleCancel = () => {
  showModal.value = false;
  resetForm();
};

const loadingText = ref(`<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> En cours...`);
</script>