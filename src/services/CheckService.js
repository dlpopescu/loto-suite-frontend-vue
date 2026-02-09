import { send, API_BASE } from "../api/utils";
import { CheckRequest, CheckResult } from '../models/check';

export class CheckService {
    constructor() {}
    
    async checkNumbers(gameId, variante, noroc, date) {   
        const checkRequest = new CheckRequest({
            game_id: gameId,
            date: date,
            noroc: noroc,
            variante: variante
        });

        const requestBody = JSON.stringify(checkRequest.toJSON());
        const httpResponse = await send(
            'POST', `${API_BASE}/api/ticket/check`, 
            requestBody, { 'Content-Type': 'application/json' }, 
            true);

        if (!httpResponse.ok) 
        { 
            throw new Error(httpResponse.message || 'Failed to check numbers'); 
        }

        return new CheckResult(httpResponse.data);
    }
}

