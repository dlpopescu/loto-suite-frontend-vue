import { defineStore } from 'pinia'
import { gameService, drawService } from '../services/IocContainer.js'
import type { Game } from '../models/game.js'
import type { DrawDate, Extragere } from '../models/draw.js'

interface BusinessStoreState {
  date: DrawDate | null
  dates: DrawDate[]
  games: Game[]
  draws: Extragere[]
  game: Game | null
}

export const useBusinessStore = defineStore('loto', {
  state: (): BusinessStoreState => ({
    date: null,
    dates: [],
    games: [],
    draws: [],
    game: null
  }),  
  getters: {
    selectedDate(state): DrawDate | null {
      return state.date || null
    },
    selectedGame(state): Game | null {
      return state.game || null
    },
  },
  actions: {
    setGameId(gameId: string): void {
      this.game = this.games.find(g => g.id === gameId) || null
    },
    setDate(date: string): void {
      this.date = this.dates.find(g => g.date === date) || null
    },
    async init(): Promise<void> {
      this.games = await gameService.getAllGames()
      if (!this.game && this.games?.length > 0) {
        this.game = this.games[0]
      }

      this.dates = await drawService.getDrawDates()
      if (!this.date && this.dates?.length > 0) {
        this.date = this.dates[0]
      }

      this.draws = await drawService.getAllDraws(this.game?.id)
    }
  }
})
