import {API_BASE, send} from './utils.js';
import { useTokenStore } from "../stores/token_store";  

export async function loginUser(username, password) {
    const response = await send(
        'POST', 
        `${API_BASE}/api/auth`, 
        JSON.stringify({ username: username, password: btoa(password) }), 
        { 'Content-Type': 'application/json' }, 
        false);

    if (response.ok){
        const tokenData = await response.json();
        console.log('Login successful, received tokens:', tokenData);
        useTokenStore().setTokens(
            tokenData.data.token, 
            tokenData.data.refresh_token, 
            Date.now() + tokenData.data.expires_at * 1000
        );
    }

    console.log('Login response status:', response.status);
    return response;
}

export async function logoutUser() {
    try {
        await send(
            'POST',
            `${API_BASE}/api/auth/logout`,
            null,
            {},
            false
        );
    } catch (error) {
        console.error('Logout API call failed:', error);
    } finally {
        useTokenStore().clear();
    }
}