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
                    <h2 class="fw-bold text-center fs-18">Réinitialisation du mot de passe</h2>
                    <p class="text-muted text-center mt-1 mb-4">Entrez votre adresse e-mail et nous vous enverrons les
                      instructions pour réinitialiser votre mot de passe.</p>

                    <div class="px-4">
                      <b-form @submit.prevent="handleResetPassword" class="authentication-form">
                        <b-form-group label="Email" class="mb-3">
                          <b-form-input v-model="email" type="email" id="example-email"
                            placeholder="Entrez votre email" />
                        </b-form-group>
                        <div class="mb-1 text-center d-grid">
                          <b-button variant="primary" type="submit" :disabled="loading">
                            {{ loading ? 'Envoi en cours...' : 'Réinitialiser le mot de passe' }}
                          </b-button>
                        </div>
                      </b-form>
                    </div>
                  </div>
                </div>
              </b-col>
              <!-- Section Aide -->
              <b-col lg="5" xl="6" xs="0" class="d-flex align-items-center welcome-section d-md-flex d-none">
                <div class="p-4 p-md-5 w-100">
                  <h2 class="welcome-text text-center mb-4">
                    Sécurité Renforcée
                  </h2>
                  <div class="text-center">
                    <p class="welcome-description mb-4">
                      La sécurité de votre compte est notre priorité. Notre système de réinitialisation de mot de passe
                      est conçu pour vous permettre de récupérer l'accès à votre compte en toute sécurité. Vous recevrez
                      un email contenant des instructions détaillées pour créer un nouveau mot de passe. Assurez-vous de
                      choisir un mot de passe fort pour protéger vos données.
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
import { ref } from 'vue';
import AuthLayout from '@/layouts/AuthLayout.vue';
import { authService } from '@/services/auth';
import Swal from 'sweetalert2';

const email = ref('');
const loading = ref(false);


const handleResetPassword = async () => {
  if (!email.value) {
    Swal.fire({
      icon: 'error',
      title: 'Erreur',
      text: 'Veuillez entrer une adresse email valide',
    });
    return;
  }
  loading.value = true;
  try {
    await authService.resetPassword(email.value);
    Swal.fire({
      icon: 'success',
      title: 'Succès',
      text: 'Email de réinitialisation envoyé',
    });
    email.value = '';
  } catch (e: any) {
    Swal.fire({
      icon: 'error',
      title: 'Erreur',
      text: e.response?.data?.message || 'Erreur lors de l’envoi de l’email',
    });
  } finally {
    loading.value = false;
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
  // .border-end {
  //   border-right: none !important;
  //   border-bottom: 1px solid #dee2e6;
  // }

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
