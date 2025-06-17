<template>
  <div :class="customClass ?? 'logo-box'">
    <router-link to="/" class="logo-dark">
      <!-- <img :src="logoSmall" :height="smLogoHeight" :class="smLogoClass ?? 'logo-sm'" alt="logo sm"> -->
      <img :src="logoDark" :height="logoHeight" :class="logoClass ?? 'logo-lg'" alt="logo dark">
    </router-link>

    <router-link to="/" class="logo-light">
      <!-- <img :src="logoSmall" :height="smLogoHeight" :class="smLogoClass ?? 'logo-sm'" alt="logo sm"> -->
      <img :src="logoLight" :height="logoHeight" :class="logoClass ?? 'logo-lg'" alt="logo light">
    </router-link>
  </div>
</template>

<script setup lang="ts">
import logoSmall from "@/assets/images/schoolTracker1.png";
import logoDark from "@/assets/images/schoolTracker1.png";
import logoLight from "@/assets/images/schoolTracker1.png";

type PropsType = {
  customClass?: string;
  logoClass?: string;
  smLogoClass?: string;
  logoHeight?: number;
  smLogoHeight?: number;
};

defineProps<PropsType>();
</script>

<style lang="scss" scoped>
.logo-lg {
  margin-left: 6px;
  height: 75px !important;
}
</style>
