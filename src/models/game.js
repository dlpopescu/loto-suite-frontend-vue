export class Game{
    constructor(data = {}) {
        this.id = data.id || '';
        this.displayName = data.display_name || '';
        this.numeNoroc = data.nume_noroc || '';
        this.variantMinNumber = data.min_value_numar_varianta || 0;
        this.variantMaxNumber = data.max_value_numar_varianta || 0;
        this.variantsMaxCount = data.numar_max_variante || 0;
        this.numerePerVariantaExtrasa = data.numere_per_varianta_extrasa || 0;
        this.numarNorocLen = data.numar_cifre_noroc || 0;
    }
}