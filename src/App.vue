<template>
  <a v-if="showLogout" class="logout-global" href="#" @click.prevent="logout">Logout</a>
  <router-view />
  <transition name="slide-error">
    <div v-if="errorStore.visible" class="error-popup">{{ errorStore.message }}</div>
  </transition>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useErrorStore } from './stores/errors.js';
import { useBusinessStore } from './stores/business';
import { authService } from './services/IocContainer.js';

const route = useRoute();
const router = useRouter();
const errorStore = useErrorStore();
const businessStore = useBusinessStore();

const showLogout = computed(() => route.name !== 'login');

function logout() {
  authService.logout();
  businessStore.$reset();
  router.replace({ name: 'login' });
}
</script>

<style scoped>
.logout-global {
  position: fixed;
  top: 8px;
  right: 10px;
  font-size: var(--font-size-small);
  color: #1976d2;
  text-decoration: none;
  z-index: 1100;
  background: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
}

.logout-global:hover {
  text-decoration: underline;
}

.error-popup {
  position: fixed;
  top: 20px;
  right: 10px; /* Flush with screen edge */
  background: var(--color-red);
  color: var(--color-white);
  padding: 10px 20px;
  border-radius: 6px;
  z-index: 1000;
  font-size: 0.75em;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  pointer-events: none;
  will-change: transform;
}
.slide-error-enter-active, .slide-error-leave-active {
  transition: transform 0.4s cubic-bezier(.55,0,.1,1);
}
.slide-error-enter-from, .slide-error-leave-to {
  transform: translateX(120%);
}
.slide-error-enter-to, .slide-error-leave-from {
  transform: translateX(0);
}
</style>