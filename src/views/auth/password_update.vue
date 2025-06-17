<template>
  <AuthLayout>
    <b-row class="justify-content-center">
      <b-col xl="12" class="auth-wrapper">
        <b-card no-body class="auth-card">
          <b-card-body class="p-0">
            <b-row class="g-0">
              <b-col xs="12" lg="7" xl="6" class="_border-end login-section">
                <div class="p-4 p-md-5" style="position: relative; z-index: 1;">
                  <div class="p-4 bg-white rounded-3">
                    <LogoBox customClass="mx-auto mb-4 text-center auth-logo" :smLogoHeight="0" :logoHeight="96"
                      smLogoClass="me-1" />
                    <h2 class="fw-bold text-center fs-18">Nouveau mot de passe</h2>
                    <p class="text-muted text-center mt-1 mb-4">Veuillez entrer et confirmer votre nouveau mot de passe.
                    </p>

                    <div class="px-4">
                      <b-form @submit.prevent="handlePasswordConfirm" class="authentication-form">
                        <div v-if="error" class="mb-2 text-danger">{{ error }}</div>

                        <b-form-group label="Nouveau mot de passe" class="mb-3">
                          <b-form-input type="password" id="new-password" v-model.trim="formData.newPassword"
                            placeholder="Entrez votre nouveau mot de passe" />
                          <div v-if="v$.newPassword.$error" class="text-danger">
                            <span v-for="(err, idx) in v$.newPassword.$errors" :key="idx">
                              {{ err.$message }}
                            </span>
                          </div>
                        </b-form-group>

                        <b-form-group label="Confirmer le mot de passe" class="mb-3">
                          <b-form-input type="password" id="confirm-password" v-model.trim="formData.confirmPassword"
                            placeholder="Confirmez votre nouveau mot de passe" />
                          <div v-if="v$.confirmPassword.$error" class="text-danger">
                            <span v-for="(err, idx) in v$.confirmPassword.$errors" :key="idx">
                              {{ err.$message }}
                            </span>
                          </div>
                        </b-form-group>
                        <div class="mb-1 text-center d-grid">
                          <b-button variant="primary" type="submit">Confirmer le mot de passe</b-button>
                        </div>
                      </b-form>
                    </div>
                  </div>
                </div>
                <div class="background-overlay"></div>
              </b-col>
              <!-- Section Aide -->
              <b-col lg="5" xl="6" xs="0" class="d-flex align-items-center welcome-section d-md-flex d-none">
                <div class="p-4 p-md-5 w-100">
                  <h2 class="welcome-text text-center mb-4">
                    Validation de Sécurité
                  </h2>
                  <div class="text-center">
                    <p class="welcome-description mb-4">
                      La confirmation de votre nouveau mot de passe est une étape cruciale pour garantir la sécurité de
                      votre compte. Cette double vérification permet d'éviter les erreurs de saisie et assure que vous
                      pourrez accéder à votre compte en toute confiance. Prenez le temps de vérifier attentivement votre
                      saisie avant de valider.
                    </p>
                  </div>
                </div>
              </b-col>
            </b-row>
          </b-card-body>
        </b-card>
        <p class="mb-0 text-center mt-3">Retour à la <router-link :to="{ name: 'auth.sign-in' }"
            class="text-reset fw-bold ms-1">page de connexion</router-link></p>
      </b-col>
    </b-row>
  </AuthLayout>
</template>

<script setup lang="ts">
import { useVuelidate } from '@vuelidate/core';
import { required, sameAs, minLength, helpers } from '@vuelidate/validators';
import { ref, computed } from 'vue';
import AuthLayout from '@/layouts/AuthLayout.vue';
import { useRoute, useRouter } from 'vue-router';
import { authService } from '@/services/auth';
import Swal from 'sweetalert2';

const router = useRouter();
const route = useRoute();
const token = route.query.token as string;
const email = route.query.email as string;

const formData = ref({
  newPassword: '',
  confirmPassword: ''
});

const error = ref('');

const strongPassword = helpers.regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/);

const rules = computed(() => ({
  newPassword: {
    required: helpers.withMessage('Le mot de passe est requis', required),
    minLength: helpers.withMessage('Le mot de passe doit contenir au moins 8 caractères', minLength(8)),
    strongPassword: helpers.withMessage(
      'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial',
      strongPassword
    )
  },
  confirmPassword: {
    required: helpers.withMessage('La confirmation du mot de passe est requise', required),
    sameAsPassword: helpers.withMessage(
      'Les mots de passe ne correspondent pas',
      sameAs(formData.value.newPassword)
    )
  }
}));

const v$ = useVuelidate(rules, formData);

const handlePasswordConfirm = async () => {
  error.value = '';
  const isFormCorrect = await v$.value.$validate();

  if (!isFormCorrect) {
    error.value = 'Veuillez corriger les erreurs dans le formulaire.';
    return;
  }

  if (!token || !email) {
    await Swal.fire({
      icon: 'error',
      title: 'Lien invalide',
      text: 'Lien de réinitialisation invalide',
      confirmButtonText: 'Ok'
    });
    router.push({ name: 'auth.sign-in' });
    return;
  }

  try {
    await authService.password_update({
      email: email,
      token: token,
      password: formData.value.newPassword,
      password_confirmation: formData.value.confirmPassword
    });

    await Swal.fire({
      icon: 'success',
      title: 'Succès',
      text: 'Mot de passe réinitialisé avec succès',
      confirmButtonText: 'Se connecter'
    });

    router.push({ name: 'auth.sign-in' });
  } catch (e: any) {
    error.value = e.response?.data?.error || 'Une erreur est survenue';
    await Swal.fire({
      icon: 'error',
      title: 'Erreur',
      text: error.value,
      confirmButtonText: 'Réessayer'
    });
  }
};
</script>

<style lang="scss" scoped>
.login-section {
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: #F8B354;
    pointer-events: none;
    display: block;
    /* Cache l'image par défaut */
  }

  @media (min-width: 992px) {
    &::before {
      background: url('@/assets/images/img-23.png') center/cover;
      display: block;
      /* Affiche l'image à partir de 992px */
    }
  }
}

@media (max-width: 767.98px) {
  .auth-card {
    margin: 1rem;
  }

  .p-md-5 {
    padding: 1.5rem !important;
  }

  .authentication-form {
    .form-control {
      font-size: 0.9rem;
    }
  }
}

@media (max-width: 575.98px) {
  .auth-card {
    margin: 0.5rem;
  }

  .p-md-5 {
    padding: 1rem !important;
  }
}

.welcome-text {
  font-size: 2.5rem;
  font-weight: bold;
  letter-spacing: 2px;

  span {
    display: inline-block;
    transition: transform 0.3s ease;

    &:hover {
      transform: translateY(-5px);
    }
  }
}

.welcome-description {
  font-size: 1rem;
  line-height: 1.6;
  color: #6c757d;
  max-width: 600px;
  margin: 0 auto;
}

.welcome-section {
  @media (max-width: 991.98px) {
    display: none !important;
  }
}
</style>