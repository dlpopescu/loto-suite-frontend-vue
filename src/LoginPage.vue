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
      <button type="submit" :disabled="loading">Login</button>
      <div v-if="error" class="error">{{ error }}</div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { loginUser } from './api/auth.js';
import { useBusinessStore } from './stores/business_store.js';

const username = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');
const router = useRouter();
const businessStore = useBusinessStore();

async function login() {
  loading.value = true;
  error.value = '';
  try {
    const response = await loginUser(username.value, password.value);
    if (!response.ok) throw new Error('Login failed. Please try again.');

    await businessStore.fetchGames();
    await businessStore.fetchDates(30);
    router.replace({ name: 'ticket', query: { from: 'login' } });
  } catch (e) {
    error.value = e.message || 'Login failed. Please try again.';
  } finally {
    loading.value = false;
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
}
.error {
  color: #d32f2f;
  margin-top: 1rem;
}
</style>
