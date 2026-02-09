import { defineStore } from 'pinia';

export const useErrorStore = defineStore('error', {
  state: () => ({
    message: '',
    visible: false,
  }),
  actions: {
    showError(msg, duration = 3000) {
      this.message = msg;
      this.visible = true;
      setTimeout(() => {
        this.visible = false;
        this.message = '';
      }, duration);
    },
    hideError() {
      this.visible = false;
      this.message = '';
    }
  }
});
