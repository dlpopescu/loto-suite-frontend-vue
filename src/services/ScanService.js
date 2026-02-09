import { send, API_BASE } from "../api/utils";
import { ScanResult } from '../models/scan';
import { arrayBufferToBase64 as bufferToBase64 } from "../api/utils";

export class ScanService {
    constructor() {}
    
    async scanTicket(gameId, imageData) {
        const requestBody = JSON.stringify({ game_id: gameId, image_data: bufferToBase64(imageData) });
        const httpResponse = await send(
            'POST', `${API_BASE}/api/ticket/scan`, 
            requestBody, { 'Content-Type': 'application/json' }, 
            true);

        if (!httpResponse.ok) 
        { 
            throw new Error(httpResponse.message || 'Failed to scan ticket'); 

        }

        return new ScanResult(httpResponse.data);
    }
}
