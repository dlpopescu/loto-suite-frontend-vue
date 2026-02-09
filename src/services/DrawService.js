import { send, API_BASE } from "../api/utils";
import { DrawDate, Extragere } from "../models/draw";

export class DrawService {
    constructor() {
        this.cache = new Map();
    }

    async getAllDraws(gameId) {
        const httpResponse = await send(
            'GET', `${API_BASE}/api/draws?game=${encodeURIComponent(gameId)}`, 
            null, {}, 
            true);
        if (!httpResponse.ok) {
            throw new Error(httpResponse.message || 'Failed to fetch draw results');
        }
        
        const draws = [];
        if (Array.isArray(httpResponse.data)) {
            httpResponse.data.forEach(rawDraw => {
                const draw = new Extragere(rawDraw);
                draws.push(draw);
                
                if (draw.dataExtragere) {
                    const key = `${gameId}-${draw.dataExtragere}`;
                    this.cache.set(key, draw);
                }
            });
        }

        return draws;
    }

    async getDrawForDate(gameId, date) {
        const key = `${gameId}-${date}`;

        if (this.cache.has(key)) {
            return this.cache.get(key);
        }

        const allDraws = await this.getAllDraws(gameId);
        const draw = allDraws.find(d => d.dataExtragere === date);
        if (draw) {
            this.cache.set(key, draw);
        }

        return draw;
    }

    async getDrawDates() {
        const httpResponse = await send(
            'GET', `${API_BASE}/api/draws/dates`, 
            null, {}, 
            true);

        if (!httpResponse.ok) 
        {
            throw new Error(httpResponse.message || 'Failed to fetch draw dates');
        }
        
        const drawDates = httpResponse.data.map(rawDate => new DrawDate(rawDate));
        return drawDates;
    }
}

