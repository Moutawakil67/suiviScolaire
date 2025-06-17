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
                    <h2 class="fw-bold text-center fs-18">Modification du mot de passe</h2>
                    <p class="text-muted text-center mt-1 mb-4">Veuillez entrer votre ancien mot de passe et définir un
                      nouveau.</p>

                    <div class="px-4">
                      <b-form @submit.prevent="handlePasswordChange" class="authentication-form">
                        <div v-if="error.length > 0" class="mb-2 text-danger">{{ error }}</div>

                        <b-form-group label="Ancien mot de passe" class="mb-3">
                          <b-form-input type="password" id="old-password" v-model="v.oldPassword.$model"
                            placeholder="Entrez votre ancien mot de passe" />
                          <div v-if="v.oldPassword.$error" class="text-danger">
                            <span v-for="(err, idx) in v.oldPassword.$errors" :key="idx">
                              {{ err.$message }}
                            </span>
                          </div>
                        </b-form-group>

                        <b-form-group label="Nouveau mot de passe" class="mb-3">
                          <b-form-input type="password" id="new-password" v-model="v.newPassword.$model"
                            placeholder="Entrez votre nouveau mot de passe" />
                          <div v-if="v.newPassword.$error" class="text-danger">
                            <span v-for="(err, idx) in v.newPassword.$errors" :key="idx">
                              {{ err.$message }}
                            </span>
                          </div>
                        </b-form-group>

                        <b-form-group label="Confirmer le nouveau mot de passe" class="mb-3">
                          <b-form-input type="password" id="confirm-password" v-model="v.confirmPassword.$model"
                            placeholder="Confirmez votre nouveau mot de passe" />
                          <div v-if="v.confirmPassword.$error" class="text-danger">
                            <span v-for="(err, idx) in v.confirmPassword.$errors" :key="idx">
                              {{ err.$message }}
                            </span>
                          </div>
                        </b-form-group>

                        <div class="mb-1 text-center d-grid">
                          <b-button variant="primary" type="submit">Modifier le mot de passe</b-button>
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
                    Protection de Votre Compte
                  </h2>
                  <div class="text-center">
                    <p class="welcome-description mb-4">
                      La mise à jour régulière de votre mot de passe est une pratique essentielle pour maintenir la
                      sécurité de votre compte. En changeant votre mot de passe périodiquement, vous renforcez la
                      protection de vos données sensibles. Assurez-vous de choisir un nouveau mot de passe unique et
                      complexe, différent de ceux que vous utilisez sur d'autres plateformes.
                    </p>
                  </div>
                </div>
              </b-col>
            </b-row>
          </b-card-body>
        </b-card>
        <p class="mb-0 text-center mt-3">Retour au <router-link :to="{ name: 'auth.sign-in' }"
            class="text-reset fw-bold ms-1">tableau de bord</router-link></p>
      </b-col>
    </b-row>
  </AuthLayout>
</template>

<script setup lang="ts">
import { useVuelidate } from '@vuelidate/core';
import { required, minLength, sameAs } from '@vuelidate/validators';
import { ref, computed } from 'vue';
import AuthLayout from '@/layouts/AuthLayout.vue';

const error = ref('');
const formData = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const rules = computed(() => ({
  oldPassword: { required, minLength: minLength(8) },
  newPassword: { required, minLength: minLength(8) },
  confirmPassword: { required, sameAs: sameAs(formData.value.newPassword) }
}));

const v = useVuelidate(rules, formData);

const handlePasswordChange = async () => {
  const isFormCorrect = await v.value.$validate();
  if (!isFormCorrect) {
    error.value = 'Veuillez corriger les erreurs dans le formulaire.';
    return;
  }

  try {
    // Implémentez ici la logique de changement de mot de passe
    error.value = '';
  } catch (err) {
    error.value = 'Une erreur est survenue lors du changement de mot de passe.';
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