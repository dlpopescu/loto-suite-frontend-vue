import { defineStore } from 'pinia'

const API_BASE = 'https://dlpopescu.ro';

export const useTokenStore = defineStore('auth', {
  state: () => ({
    authToken: '',
    refreshToken: '',
    expiresAt: 0,
  }),
  getters: {
    isAuthenticated: (state) => !!state.authToken,
    isTokenExpired: (state) => {
      if (!state.expiresAt) return true
      return Date.now() >= state.expiresAt
    }
  },
  actions: {
    setTokens(authToken, refreshToken, expiresAt) {
      this.authToken = authToken
      this.refreshToken = refreshToken
      this.expiresAt = expiresAt
    },
    clear() {
      this.authToken = ''
      this.refreshToken = ''
      this.expiresAt = 0
    },
    getAuthToken() {
        if (!this.isAuthenticated || this.isTokenExpired) {
            return null;
        }

        return this.authToken;
    },
    getRefreshToken() {
        return this.refreshToken
    },
    async getValidToken() {
      if (!this.isAuthenticated) {
        throw new Error('Not authenticated');
      }

      let token = this.getAuthToken();
      
      // If token is expired but refresh token exists, try to refresh
      if (!token && this.getRefreshToken()) {
        try {
          token = await this.refreshToken();
        } catch (error) {
          console.error('Token refresh failed:', error);
          throw error;
        }
      }
      
      if (!token) {
        throw new Error('No valid token available');
      }
      
      return token;
    },
    async refreshToken() {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(
        `${API_BASE}/api/auth/refresh`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken })
        }
      );

      if (!response.ok) {
        this.clear();
        throw new Error('Failed to refresh token');
      }

      const tokenData = await response.json();
      this.setTokens(
        tokenData.data.token,
        tokenData.data.refresh_token,
        Date.now() + tokenData.data.expires_in * 1000
      );

      return tokenData.data.token;
    }
  }
})
