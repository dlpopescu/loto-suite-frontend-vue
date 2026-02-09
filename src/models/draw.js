export class DrawDate {
  constructor(data = {}) {
    this.date = data.date || '';
    this.displayDate = data.display_date || '';
  }
}

export class Extragere {
  constructor(data = {}) {
    this.gameId = data.game_id || '';
    this.dataExtragere = data.game_date || '';
    this.variante = (data.variante || []).map(v => new VariantaExtrasa(v));
    this.noroc = data.noroc ? new NorocExtras(data.noroc) : null;

    this.sortNumereVarianta();
  }

  sortNumereVarianta() {
    if (!(this.variante || []).length) {
      return;
    }

    this.variante.forEach(varianta => {
        if (this.gameId === 'joker') {
            const mainNumbers = varianta.numere.slice(0, varianta.numere.length - 1);
            const jokerNumber = varianta.numere.slice(varianta.numere.length - 1);
            mainNumbers.sort((a, b) => a - b);
            varianta.numere = [...mainNumbers, ...jokerNumber];
        } else {
            varianta.numere.sort((a, b) => a - b);
        }
    });
  }
}

export class VariantaExtrasa {
  constructor(data = {}) {
    this.numere = data.numere || [];
  }
}

export class NorocExtras {
  constructor(data = {}) {
    this.numar = data.numar || '';
  }
}