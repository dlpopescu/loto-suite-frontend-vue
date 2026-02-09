import { AuthService } from "./AuthService.js";
import { CheckService } from "./CheckService.js";
import { DrawService } from "./DrawService.js";
import { GameService } from "./GameService.js";
import { ScanService } from "./ScanService.js";

export const authService = new AuthService();
export const checkService = new CheckService();
export const drawService = new DrawService();
export const gameService = new GameService();
export const scanService = new ScanService();