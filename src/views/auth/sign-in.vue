<template>
  <AuthLayout>
    <div class="d-flex align-items-center min-vh-100">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-12 col-lg-10">
            <div class="auth-wrapper d-flex">
              <!-- Section de bienvenue (gauche) -->
              <div class="welcome-section bg-primary p-4 p-lg-5 d-none d-lg-flex flex-column justify-content-between">
                <div>
                  <h1 class="welcome-text text-white mb-4">Bienvenue !</h1>
                  <p class="text-white-50 welcome-description">Pour rester connecté avec nous, veuillez vous connecter avec vos informations personnelles</p>
                </div>
                <div class="text-center">
                  <img src="@/assets/images/schoolTracker1.png" alt="" class="img-fluid welcome-image mb-4" style="max-width: 300px;">
                </div>
              </div>
              <!-- Section de connexion (droite) -->
              <div class="login-form-section p-4 p-lg-5 flex-grow-1 bg-white">
                <div class="auth-logo text-center mb-4">
                  <LogoBox customClass="mx-auto" :smLogoHeight="0" :logoHeight="96" smLogoClass="me-1" />
                </div>
                <h2 class="text-center mb-4">Créer un compte</h2>
                <!-- <div class="social-auth text-center mb-4">
                  <button class="btn btn-light mx-2"><i class="fab fa-facebook-f"></i></button>
                  <button class="btn btn-light mx-2"><i class="fab fa-google"></i></button>
                  <button class="btn btn-light mx-2"><i class="fab fa-linkedin-in"></i></button>
                </div>
                <p class="text-center text-muted mb-4">ou utilisez votre email pour l'inscription</p> -->
                <div class="p-2">
                  <b-form @submit.prevent="handleSignIn" class="form-horizontal">
                    <div v-if="error.length > 0" class="mb-2 text-danger">
                      {{ error }}
                    </div>

                    <div class="mb-3">
                      <label for="example-email" class="form-label">Email</label>
                      <b-form-input
                        type="email"
                        id="example-email"
                        name="example-email"
                        placeholder="Entrez votre email"
                        v-model="v.email.$model"
                      />
                      <div v-if="v.email.$error" class="text-danger">
                        <span v-for="(err, idx) in v.email.$errors" :key="idx">
                          {{ err.$message }}
                        </span>
                      </div>
                    </div>

                    <div class="mb-3">
                      <div class="float-end">
                        <router-link :to="{ name: 'auth.reset-password' }" class="text-muted">Mot de passe oublié ?</router-link>
                      </div>
                      <label class="form-label" for="example-password">Mot de passe</label>
                      <div class="input-group auth-pass-inputgroup">
                        <input
                          type="password"
                          id="example-password"
                          class="form-control"
                          placeholder="Entrez votre mot de passe"
                          v-model="v.password.$model"
                        />
                      </div>
                      <div v-if="v.password.$errors" class="text-danger">
                        <span v-for="(err, idx) in v.password.$errors" :key="idx">
                          {{ getMessage(err) }}
                        </span>
                      </div>
                    </div>

                    <div class="form-check">
                      <input type="checkbox" class="form-check-input" id="customControlInline">
                      <label class="form-check-label" for="customControlInline">Se souvenir de moi</label>
                    </div>

                    <div class="mt-3 d-grid">
                      <b-button variant="primary" type="submit" :disabled="loading" class="btn btn-primary waves-effect waves-light">
                        <span v-if="loading">Connexion...</span>
                        <span v-else>Se Connecter</span>
                      </b-button>
                    </div>
                  </b-form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AuthLayout>
</template>

<style lang="scss" scoped>
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

.auth-wrapper {
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
}

.welcome-section {
  position: relative;
  width: 45%;
  min-height: 600px;
  background: linear-gradient(135deg, #0020b0, #96c93d);
  color: white;
  overflow: hidden;
}

.welcome-text {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.welcome-description {
  font-size: 1.1rem;
  line-height: 1.6;
  opacity: 0.9;
}

.welcome-image {
  animation: float 6s ease-in-out infinite;
}

.login-form-section {
  width: 55%;
  background: white;
  padding: 2rem;
}

.social-auth .btn {
  width: 40px;
  height: 40px;
  padding: 0;
  line-height: 40px;
  border-radius: 50%;
  margin: 0 10px;
  transition: all 0.3s ease;
}

.social-auth .btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.login-section {
  position: relative;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: #f8b354;
    pointer-events: none;
    display: block;
    /* Cache l'image par défaut */
  }

  @media (min-width: 992px) {
    &::before {
      background: url("@/assets/images/img-23.png") center/cover;
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

<script setup lang="ts">

import Swal from 'sweetalert2';
import AuthLayout from "@/layouts/AuthLayout.vue";

import { required, email   } from "@vuelidate/validators";
import { useVuelidate } from "@vuelidate/core";

import { ref, reactive, computed } from "vue";
import { useRoute } from "vue-router";



import { useAuthStore } from "@/stores/auth";
import { authService } from "@/services/auth";
import router from "@/router";

import type { User } from "@/types/auth";

const credentials = reactive({
  email: "",
  password: "",
});

// Messages de validation en français
// const messagesFr = {
//   required: "Ce champ est requis",
//   email: "Veuillez entrer une adresse email valide"
// };

const fakeUsers: User[] = [
  {
    id: '1',
    email: 'admin@email.com',
    username: 'admin',
    password: 'password',
    firstName: 'Admin',
    lastName: 'Techzaa',
    role: 'admin',
    token: 'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJjb2RlcnRoZW1lcyIsImF1ZCI6Imh0dHBzOi8vY29kZXJ0aGVtZXMuY29tLyIsInN1YiI6InN1cHBvcnRAY29kZXJ0aGVtZXMuY29tIiwibGFzdE5hbWUiOiJDb2RlcnRoZW1lcyIsIkVtYWlsIjoic3VwcG9ydEBjb2RlcnRoZW1lcy5jb20iLCJSb2xlIjoiQWRtaW4iLCJmaXJzdE5hbWUiOiJBcm91bmQifQ.yTJpBUmQ_T1dUf-dIdgxXn16KZjhvXw6cUT1sFhnOtKJ3-67gnRCC41nNVGLJpyjv4HCLVj0ytTbmfWzWcY_2Q'
  },
  {
    id: '2',
    email: 'user@email.com',
    username: 'user',
    password: 'password',
    firstName: 'User',
    lastName: 'Techzaa',
    role: 'user',
    token: 'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJjb2RlcnRoZW1lcyIsImF1ZCI6Imh0dHBzOi8vY29kZXJ0aGVtZXMuY29tLyIsInN1YiI6InN1cHBvcnRAY29kZXJ0aGVtZXMuY29tIiwibGFzdE5hbWUiOiJDb2RlcnRoZW1lcyIsIkVtYWlsIjoic3VwcG9ydEBjb2RlcnRoZW1lcy5jb20iLCJSb2xlIjoiQWRtaW4iLCJmaXJzdE5hbWUiOiJBcm91bmQifQ.yTJpBUmQ_T1dUf-dIdgxXn16KZjhvXw6cUT1sFhnOtKJ3-67gnRCC41nNVGLJpyjv4HCLVj0ytTbmfWzWcY_2Q'
  }
]

const vuelidateRules = computed(() => ({
  email: {
    required,
    email
  },
  password: {
    required
  }
}));

function getMessage(error: any) {
  switch (error.$validator) {
    case 'required': return 'Champ requis'
    case 'email': return 'Adresse email invalide'
    default: return 'Erreur inconnue'
  }
}


const v = useVuelidate(vuelidateRules, credentials);

const useAuth = useAuthStore();
const route = useRoute();
const query = route.query;
const loading = ref(false);

const error = ref("");
const checked = ref(false);

const handleSignIn = async () => {
  alert("ok")
 const result = await v.value.$validate();

  if (result) {
    loading.value = true;
    try {
      const userData = await authService.signIn(fakeUsers[1]);
      if (userData.token) {

        useAuth.saveSession({
          ...userData.user,
          token: userData.token
        });




        await Swal.fire({
          title: 'Bienvenue !',
          html: `<h1 style="text-align:center;">${userData.firstName} ${userData.lastName}</h1>`,
          icon: 'success',
          confirmButtonText: 'Continuer',
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false,
        });


        redirectUser();

      }


  //     /* 
  //       useAuth.saveSession({
  //         ...fakeUsers[0],
  //         token: fakeUsers[0].token
  //       });
  //       redirectUser();
  //     */
    } catch (e: any) {
      console.log(e);
      if (e.response?.data?.error) {
        await Swal.fire({
          title: 'Erreur de connexion',
          text: e.response.data.error,
          icon: 'error',
          confirmButtonText: 'Réessayer',
        });
      } else {
        await Swal.fire({
          title: 'Erreur inattendue',
          text: 'Une erreur est survenue. Veuillez réessayer plus tard.',
          icon: 'error',
          confirmButtonText: 'OK',
        });
      }



    } finally {
      loading.value = false;
    }
  }


 // if (result) {
//     try {
//       const res = await HttpClient.post('/sign-in', fakeUsers[1]);
//      

//       if (res.data.token) {
//         useAuth.saveSession({
//           ...res.data,
//           token: res.data.token
//         });
//         redirectUser();
//       }
//     } catch (e: any) {
//       if (e.response?.data?.error) {
//         if (error.value.length == 0) error.value = e.response?.data?.error;
//       }
//     }
//  // }
 };

const redirectUser = () => {
  if (query.redirectedFrom) {
    return router.push(`${query.redirectedFrom}`);
  }
  return router.push("/");
};
</script>
