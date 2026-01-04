import { defineStore } from 'pinia'
import { getAllGames, getDrawDates } from '../api/business'

export const useBusinessStore = defineStore('loto', {
  state: () => ({
    games: [],
    dates: [],
    gameId: '',
    dateId: ''
  }),  
  getters: {
    selectedGame(state) {
      return state.games.find(g => g.id === state.gameId) || null
    },
    selectedDate(state) {
      return state.dates.find(g => g.date === state.dateId) || null
    }
  },
  actions: {
    async fetchGames() {
      if (this.games.length === 0) {
        const gamesResponse = await getAllGames()
        this.games = gamesResponse || []
      }

      if (this.gameId === '' && this.games.length > 0) {
        this.gameId = this.games[0].id;
      }
    },
    async fetchDates(daysBack = 30) {
      if (this.dates.length === 0) {
        const datesResponse = await getDrawDates(daysBack)
        this.dates = datesResponse || []
      }

      if (this.dateId === '' && this.dates.length > 0) {
        this.dateId = this.dates[0].date;
      }
    },
    async getGameById(gameId) {
      if (this.games.length === 0) {
        const gamesResponse = await getAllGames()
        this.games = gamesResponse || []
      }
      
      return this.games.find(g => g.id === gameId);
    },
  }
})
