<template>
  <header class="topbar">
    <b-container fluid>
      <div class="navbar-header">
        <div class="d-flex align-items-center gap-2">
          <!-- Menu Toggle Button -->
          <div class="topbar-item">
            <button type="button" class="button-toggle-menu topbar-button">
              <Icon icon="solar:hamburger-menu-broken" class="fs-24 align-middle" @click="toggleLeftSideBar" />
            </button>
          </div>

          <nav aria-label="breadcrumb">
            <ol class="breadcrumb mb-0 py-0">
              <li class="breadcrumb-item">
                <router-link to="/">Accueil</router-link>
              </li>
              <template v-if="currentBreadcrumb">
                <li 
                  v-for="(item, index) in currentBreadcrumb" 
                  :key="index"
                  :class="['breadcrumb-item', { active: index === currentBreadcrumb.length - 1 }]"
                  :aria-current="index === currentBreadcrumb.length - 1 ? 'page' : undefined"
                >
                  <router-link 
                    v-if="item.to && index !== currentBreadcrumb.length - 1" 
                    :to="item.to"
                  >
                    {{ item.text }}
                  </router-link>
                  <span v-else>{{ item.text }}</span>
                </li>
              </template>
            </ol>
          </nav>
          <!-- App Search-->
          <!-- <form class="app-search d-none d-md-block me-auto">
            <div class="position-relative">
              <input type="search" class="form-control" placeholder="Search..." autocomplete="off" value="">
              <Icon icon="solar:magnifer-broken" class="search-widget-icon" />
            </div>
          </form> -->
        </div>

        <div class="d-flex align-items-center gap-1">
          <!-- Theme Color (Light/Dark) -->
          <div class="topbar-item">
            <button type="button" class="topbar-button" id="light-dark-mode" @click="toggleTheme">
              <Icon icon="solar:moon-broken" class="fs-24 align-middle light-mode" />
              <Icon icon="solar:sun-broken" class="fs-24 align-middle dark-mode" />
            </button>
          </div>

          <!-- Category -->
          <div class="dropdown topbar-item d-none d-lg-flex">
            <button type="button" class="topbar-button" data-toggle="fullscreen" @click="toggleFullScreen">
              <Icon icon="solar:full-screen-broken" class="fs-24 align-middle fullscreen" />
              <Icon icon="solar:quit-full-screen-broken" class="fs-24 align-middle quit-fullscreen" />
            </button>
          </div>

          

          <!-- Theme Setting -->
          <div class="topbar-item d-none d-md-flex">
            <button type="button" class="topbar-button" id="theme-settings-btn" v-b-toggle="'theme-settings'">
              <Icon icon="solar:settings-broken" class="fs-24 align-middle" />
            </button>
          </div>

          <!-- User -->
          <DropDown class="topbar-item">
            <a type="button" class="topbar-button" id="page-header-user-dropdown" data-bs-toggle="dropdown"
              aria-haspopup="true" aria-expanded="false">
              <span
                class="d-flex align-items-center justify-content-center rounded-circle bg-primary text-white fw-bold"
                style="width: 32px; height: 32px; font-size: 16px; user-select: none;">
                {{ (currentUser?.prenom ?? currentUser?.name ?? 'U').slice(0, 1).toUpperCase() }}
              </span>

            </a>
            <div class="dropdown-menu dropdown-menu-end">

              <h6 class="dropdown-header">Bienvenue {{ currentUser?.prenom ?? currentUser?.name ?? 'Invité' }} !</h6>


              <router-link class="dropdown-item" :to="{ name: item.route?.name }"
                v-for="(item, idx) in profileMenuItems" :key="idx">
                <i :class="`bx ${item.icon} text-muted fs-18 align-middle me-1`"></i><span class="align-middle">{{
                  item.label }}</span>
              </router-link>

              <div class="dropdown-divider my-1"></div>

              <a href="javascript:void(0);" class="dropdown-item text-danger" @click="authStore.removeSession()">
                <i class="bx bx-log-out fs-18 align-middle me-1"></i><span class="align-middle">Déconnexion</span>
              </a>
            </div>
          </DropDown>
        </div>
      </div>
    </b-container>
  </header>
</template>

<script setup lang="ts">
import { onMounted , computed} from 'vue';
import { Icon } from "@iconify/vue";
import simplebar from 'simplebar-vue';

import { useLayoutStore } from '@/stores/layout';
import { useAuthStore } from '@/stores/auth';
import { toggleDocumentAttribute } from "@/helpers";
import { profileMenuItems, notifications } from "@/layouts/partials/data";

import DropDown from "@/components/DropDown.vue";
import avatar1 from "@/assets/images/users/avatar-1.jpg";
import { useRoute } from 'vue-router';

const route = useRoute();
const currentRoute = computed(() => route);

const currentBreadcrumb = computed(() => {
  const params = route.params;
  const basePaths = {
    id: `/commanditaire/${params.id}/campagnes`,
    campagneId: `/commanditaire/${params.id}/campagnes/${params.campagnesId}/programmes`,
  };

  return (route.meta.breadcrumb || []).map(item => {
    if (item.dynamic && params[item.dynamic]) {
      return {
        ...item,
        to: basePaths[item.dynamic]
      };
    }
    return item;
  });
});

const authStore = useAuthStore();
import { storeToRefs } from 'pinia';
const { currentUser } = storeToRefs(authStore);


const toggleFullScreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
    document.body.classList.add('fullscreen-enable');
  } else if (document.exitFullscreen) {
    document.exitFullscreen();
    document.body.classList.remove('fullscreen-enable');
  }
};

const useLayout = useLayoutStore();

const toggleTheme = () => {
  if (useLayout.layout.theme === 'light') {
    return useLayout.setTheme('dark');
  }
  useLayout.setTheme('light');
};

const toggleLeftSideBar = () => {
  if (useLayout.layout.leftSideBarSize === 'default') {
    return useLayout.setLeftSideBarSize('condensed');
  }
  if (useLayout.layout.leftSideBarSize === 'condensed') {
    return useLayout.setLeftSideBarSize('default');
  }
  toggleDocumentAttribute('class', 'sidebar-enable');
  showBackdrop();
};

const showBackdrop = () => {
  let backdrop = document.createElement('div') as HTMLDivElement;
  if (backdrop) {
    backdrop.classList.add('offcanvas-backdrop', 'fade', 'show');
    document.body.appendChild(backdrop);
    document.body.style.overflow = 'hidden';
    if (window.innerWidth > 1040) {
      document.body.style.paddingRight = '15px';
    }

    backdrop.addEventListener('click', function (e) {
      toggleDocumentAttribute('class', '');
      document.body.removeChild(backdrop);
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    });
  }
};

onMounted(() => {
  useLayout.init();
});
</script>
