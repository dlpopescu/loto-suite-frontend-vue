import {arrayBufferToBase64, send} from './utils.js';
import {API_BASE} from './utils.js';

export async function getAllGames() {
    const response = await send(
        'GET', 
        `${API_BASE}/api/games`, 
        null, 
        {}, 
        true);

    if (!response.ok) throw new Error('Failed to fetch games');
    
    const json = await response.json();
    return json.data || json;
}

export async function getGameById(gameId) {
    const allGames = await getAllGames();
    return allGames.find(g => g.id === gameId);
}

export async function getDrawDates(daysBack) {
    const response = await send(
        'GET', 
        `${API_BASE}/api/draw/dates?days_back=${daysBack}`, 
        null, 
        {}, 
        true);

    if (!response.ok) throw new Error('Failed to fetch draw dates');
    const json = await response.json();
    return json.data || json;
}

export async function getDrawResults(game, date) {
    const response = await send(
        'GET', 
        `${API_BASE}/api/draw/results?game=${encodeURIComponent(game)}&date=${encodeURIComponent(date)}`, 
        null, 
        {}, 
        true);

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch draw results');
    }

    const json = await response.json();
    return json.data || json;
}

export async function checkNumbers(gameId, variante, noroc, date) {   
    const jsonPayload = JSON.stringify(
        {
            game_id: gameId,       
            variante: variante,        
            noroc: noroc,              
            date: date
        });

    console.log('Check numbers payload:', jsonPayload);

    const response = await send(
        'POST', 
        `${API_BASE}/api/ticket/check`, 
        jsonPayload, 
        { 'Content-Type': 'application/json' }, 
        true);

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to check numbers');
    }

    const checkResultJson = await response.json();
    const checkResult = checkResultJson.data || checkResultJson;
    
    console.log('Check numbers result:', checkResult);
    
    return checkResult;
}

export async function scanTicket(gameId, imageData) {
    const response = await send(
        'POST', 
        `${API_BASE}/api/ticket/scan`, 
        JSON.stringify({ game_id: gameId, image_data: arrayBufferToBase64(imageData) }), 
        { 'Content-Type': 'application/json' }, 
        true);

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to scan ticket');
    }
    return await response.json();
}