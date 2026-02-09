<template>
  <div class="login-container">
    <form @submit.prevent="login">
      <div>
        <label for="username">Username</label>
        <input id="username" v-model="username" required />
      </div>
      <div>
        <label for="password">Password</label>
        <input id="password" type="password" v-model="password" required />
      </div>
      <button type="submit" :disabled="isLoading" class="submit-button">
        <span v-if="isLoading" class="spinner" aria-hidden="true"></span>
        <span>{{ isLoading ? 'Logging in...' : 'Login' }}</span>
      </button>
      <div v-if="error" class="error">{{ error }}</div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { authService } from './services/IocContainer.js';
import { useBusinessStore } from './stores/business';
import { useLoadingStore } from './stores/loading.js';

const username = ref<string>('');
const password = ref<string>('');
const error = ref<string>('');
const router = useRouter();
const businessStore = useBusinessStore();

const loadingStore = useLoadingStore();
const { isLoading } = storeToRefs(loadingStore);

async function login(): Promise<void> {
  error.value = '';
  loadingStore.start();

  try {
    await authService.login(username.value, password.value);
    await businessStore.init();
    router.replace({ name: 'ticket', query: { from: 'login' } });
  } catch (e) {
    error.value = (e as Error).message;
    throw e;
  } finally {
    loadingStore.stop();
  }
}

</script>

<style scoped>
.login-container {
  max-width: 350px;
  margin: 60px auto;
  padding: 2rem;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
label {
  display: block;
  margin-bottom: 0.2rem;
}
input {
  width: 100%;
  margin-bottom: 1rem;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
}
button {
  width: 100%;
  padding: 0.7rem;
  background: #1976d2;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}
.submit-button:disabled {
  opacity: 0.85;
  cursor: not-allowed;
}
.error {
  color: #d32f2f;
  margin-top: 1rem;
}
</style>
