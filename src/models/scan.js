import { VariantaJucata } from "./check";

export class ScanResult{
    constructor(data = {}) {
        this.gameId = data.game_id || '';
        this.numeJoc = data.game_name || '';
        this.dataTragere = data.game_date || '';
        this.varianteJucate = (data.variante || []).map(v => new VariantaJucata(v));
        this.norocJucat = data.noroc ? new NorocScanat(data.noroc) : null;
        this.numeNoroc = data.nume_noroc || '';
    }
}

export class NorocScanat {
    constructor(data = {}) {
        this.value = data.numar || '';
        this.castiguri = (data.castiguri || []).map(c => new Castig(c));
        this.isPlayed = data.is_played || false;
    }
}