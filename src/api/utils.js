import { useTokenStore } from "../stores/token_store";

export const API_BASE = 'https://dlpopescu.ro';

export function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

export async function send(method, url, body, extraHeaders = {}, authenticate = false) {
    const headers = { ...extraHeaders };

    if (authenticate) {
        try {
            const token = await useTokenStore().getValidToken();
            headers['Authorization'] = `Bearer ${token}`;
        } catch (error) {
            console.error('Failed to get valid token:', error);
            throw error;
        }
    }

    const response = await fetch(url, {
        method: method,
        headers: headers,
        body: body
    });

    return response;
}