import { authService } from "../services/IocContainer.js";
import router from '../router.js';
import { useLoadingStore } from '../stores/loading.js';

export const API_BASE = import.meta.env.VITE_API_BASE || '';

export function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

export async function send(method, url, body, extraHeaders = {}, authenticate = false) {
    try {
        useLoadingStore().start();

        const headers = { ...extraHeaders };

        try {
            if (authenticate) {
                const token = await authService.getAuthToken();
                headers['Authorization'] = `Bearer ${token}`;
            }
        } catch (error) {
            router.replace('/');
            throw error;
        }

        const response = await fetch(url, { method: method, headers: headers, body: body});
        if (response?.status === 401 || response?.status === 403) {
            authService.clearToken();
            router.replace('/');
        }

        const json = await response.json();
        return new HttpResponse(json);
    } catch (error) {
        throw error;
    } finally {
        useLoadingStore().stop();
    }
}

export const normalizeNumber = (value) => {
  const num = typeof value === 'string' ? parseInt(value) : value
  return num < 10 ? '0' + num : num.toString()
}

class HttpResponse {
  constructor(data = {}) {
    this.data = data.data || null;
    this.statusCode = data.status_code || 0;
    this.message = data.message || '';
    this.ok = data.ok || false;
  }
}