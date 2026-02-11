import { send, API_BASE } from "../api/utils";

class AuthToken {
    constructor(data = {}) {
        if (!data) { return; }

        this.token = data.token || '';
        this.refreshToken = new RefreshToken(data.refresh_token || '');
        this.expiresAt = data.expires_at ? data.expires_at * 1000 : 0;
    }

    clear(){
        this.token = '';
        this.refreshToken = null;
        this.expiresAt = 0;
    }
}

class RefreshToken {
    constructor(data = {}) {
        if (!data) { return; }

        this.token = data.token || '';
        this.username = data.username || '';
        this.expiresAt = data.expires_at ? data.expires_at * 1000 : 0;
    }

    clear(){
        this.token = '';
        this.refreshToken = '';
        this.expiresAt = 0;
    }
}

export class AuthService {
    constructor() {
        this.authToken = new AuthToken();
    }

    async login(username, password) {
        try {
            const requestBody = JSON.stringify({ username: username, password: password });
            const httpResponse = await send(
                'POST', `${API_BASE}/api/auth/login`, 
                requestBody, { 'Content-Type': 'application/json' }, 
                false);

            if (!httpResponse.ok){
                throw new Error(httpResponse.message || 'login failed');
            }

            this.authToken = new AuthToken(httpResponse.data);
        } catch (error) {
            throw error;
        }
    }

    async logout() {
        try {
            const refreshToken = this.authToken?.refreshToken?.token;
            if (refreshToken) {
                const requestBody = JSON.stringify({ refresh_token: refreshToken });
                await send(
                    'POST', `${API_BASE}/api/auth/logout`,
                    requestBody, { 'Content-Type': 'application/json' }, 
                    false);
            }
        } catch (error) {
            console.error('Logout API call failed:', error);
        } finally {
            this.authToken?.clear();
        }
    }

    async refreshToken() {
        try {
            const refreshToken = this.authToken?.refreshToken?.token;

            if (!refreshToken) {
                this.authToken?.clear();
                throw new Error('No refresh token available');
            }

            const requestBody = JSON.stringify({ refresh_token: refreshToken });
            const httpResponse = await send(
                'POST', `${API_BASE}/api/auth/refresh`,
                requestBody, { 'Content-Type': 'application/json' }, 
                false);

            if (!httpResponse.ok) {
                throw new Error(httpResponse.message || 'Failed to refresh auth token');
            }

            this.authToken = new AuthToken(httpResponse.data);
        } catch (error) {
            throw error;
        }
    }

    async getAuthToken() {
        try {
            if (this.isTokenExpired()) {
                await this.refreshToken();
            }

            if (!this.authToken?.token) {
                throw new Error('No valid auth token available');
            }
        } catch (error) {
            this.authToken?.clear();
            throw error;
        }
    }

    isTokenExpired() {
        if (!this.authToken?.expiresAt) return true;
        return Date.now() >= this.authToken.expiresAt;
    }

    clearToken(){
        this.authToken?.clear();
    }
}