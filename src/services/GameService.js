import { send, API_BASE } from "../api/utils";
import { Game } from "../models/game";

export class GameService {
    constructor() {
        this.cache = null;
    }

    async getAllGames() {
        if (this.cache) {
            return this.cache;
        }

        const httpResponse = await send(
            'GET', `${API_BASE}/api/games`, 
            null, {}, 
            true);

        if (!httpResponse.ok) 
        {
            throw new Error(httpResponse.message || 'Failed to fetch games');
        }

        this.cache = httpResponse.data.map(game => new Game(game));
        return this.cache;
    }

    async getGameById(gameId) {
        const allGames = await this.getAllGames();
        return allGames.find(g => g.id === gameId);
    }
}

