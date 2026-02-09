export class CheckRequest {
  constructor(data = {}) {
    this.gameId = data.game_id || '';
    this.date = data.date || '';
    this.norocJucat = data.noroc || '';
    this.varianteJucate = (data.variante || []).map(v => new VariantaJucata(v));
  }

  toJSON() {
    return {
      game_id: this.gameId,
      date: this.date,
      noroc: this.norocJucat,
      variante: this.varianteJucate
    };
  }
}

export class CheckResult {
  constructor(data = {}) {
    this.varianteJucate = data.variante_jucate.map(v => new VariantaJucata(v));
    this.norocJucat = new NorocJucat(data.noroc_jucat);
    this.castiguriTotale = data.valoare_totala_castig;
    this.castigator = data.castigator;
  }
}

export class VariantaJucata {
  constructor(data = {}) {
    this.id = data.id || '';
    this.numere = data.numere.map(v => new NumarVariantaJucata(v));
    this.castiguri = (data.castiguri || []).map(c => new Castig(c));
    this.castigator = data.castigator || false;
  }
}

export class NumarVariantaJucata {
  constructor(data = {}) {
    this.numar = data.numar || '';
    this.castigator = data.castigator || false;
  }
}

export class NorocJucat {
  constructor(data = {}) {
    this.numar = data.numar || '';
    this.castiguri = (data.castiguri || []).map(c => new Castig(c));
    this.castigator = data.castigator || false;
  }
}

export class Castig {
  constructor(data = {}) {
    this.id = data.id || '';
    this.descriere = data.descriere || '';
    this.valoare = data.valoare || 0;
  }
}
