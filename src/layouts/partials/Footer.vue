<template>
  <footer class="footer">
    <b-container fluid>
      <b-row>
        <b-col cols="12" class="text-center">
          {{ currentYear }} &copy; L3-AL. Réalisé par
          <!-- <Icon icon="solar:hearts-bold-duotone" class="fs-18 align-middle text-danger" /> -->
          <router-link to="" class="fw-bold footer-text" target="_blank">BOURAIMA Moutawakil && HOUNYE Octavio</router-link>
        </b-col>
      </b-row>
    </b-container>
  </footer>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { currentYear } from "@/helpers/constants";
</script>