<template>
  <div class="container">
    <div class="main-width ticket-panel">
      <div class="ticket-header">Joc / Data tragere:</div>
      <div class="ticket-field">
        <SelectEx :disabled="isLoading" 
          v-model="selectedGameId" :dataSet="businessStore.games" 
          keyProp="id" valueProp="id" displayProp="displayName"
          :emits="['game-changed']" @game-changed="onGameChanged"/>
      </div>
      <div class="ticket-field">
        <SelectEx :disabled="isLoading" 
          v-model="selectedDateId" :dataSet="businessStore.dates" 
          keyProp="date" valueProp="date" displayProp="displayDate"
          :emits="['date-changed']" @date-changed="onDateChanged"/>
      </div>
      <div v-if="isLoading" class="loading-section">
        <span class="spinner-blue" aria-hidden="true"></span>
      </div>
      <div v-if="!isLoading && !drawResult" class="no-results">
        Nu exista rezultate pentru data selectata.
      </div>
      <div v-if="!isLoading && drawResult" class="draw-results">
        <div v-for="(v, i) in drawResult.variante" :key="i" class="result-row">
          <span v-if="i === 0" class="result-label">Numere extrase:</span>
          <span v-else class="result-label placeholder">Numere extrase:</span>
          <span class="result-value">
            <template v-for="(n, idx) in v.numere" :key="idx">
              <DataGridCell 
                :data="n" 
                :readOnly="true"
                :style="{
                  '--dg-cell-border': isJokerGame ? idx === v.numere.length - 1 ? 'var(--color-joker)' : 'var(--color-success-text)' : 'var(--color-success-text)',
                  '--dg-cell-color': isJokerGame ? idx === v.numere.length - 1 ? 'var(--color-joker)' : 'var(--color-success-text)' : 'var(--color-success-text)'
                }"/>
            </template>
          </span>
        </div>
        <div v-if="drawResult?.noroc" class="result-row">
          <span class="result-label">{{norocGameName}}:</span>
          <span class="result-value">{{drawResult?.noroc?.numar}}</span>
        </div>
      </div>
    </div>
    <Bilet v-if="businessStore.game.id && drawResult"
      class="main-width"
      style="margin-top: 10px;"
      ref="biletRef"
      @delete="deleteBilet"
      @check="checkBilet"
      @scan="scanBilet"
    />  
    <!-- <input type="file" ref="fileInputRef" style="display:none" @change="onFileChange" /> -->
    <LabeledAmountsGrid 
      v-if="checkResult" :items="castiguri" 
      class="main-width" style="margin-top: 10px;" 
    /> 
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import Bilet from './components/Bilet.vue'
import LabeledAmountsGrid from './components/grids/LabeledAmountsGrid.vue'
import SelectEx from './components/SelectEx.vue'
import { useBusinessStore } from './stores/business'
import { useLoadingStore } from './stores/loading.js'
import { useErrorStore } from './stores/errors.js'
import { drawService, checkService, scanService } from './services/IocContainer.js';
import DataGridCell from './components/grids/DataGridCell.vue'

const errorStore = useErrorStore();
const businessStore = useBusinessStore()

const norocGameName = computed(() => businessStore.selectedGame?.numeNoroc || 'NOROC')

const selectedGameId = computed({
  get: () => businessStore.selectedGame?.id,
  set: (value) => businessStore.setGameId(value)
});

const isJokerGame = computed (() => selectedGameId.value === 'joker')

const selectedDateId = computed({
  get: () => businessStore.selectedDate?.date,
  set: (value) => businessStore.setDate(value)
});

const loadingStore = useLoadingStore();
const { isLoading } = storeToRefs(loadingStore);

const route = useRoute();

const biletRef = ref(null)
const fileInputRef = ref(null)
const drawResult = ref(null);
const checkResult = ref(null);
const scanResult = ref(null);
const norocValue = ref('')

const castiguri = computed(() => {
  const castiguriVariante = checkResult.value?.varianteJucate
    ? checkResult.value.varianteJucate.flatMap(v => v.castiguri || [])
    : []

  const totalVariante = castiguriVariante.reduce((total, castig) => {
    return total + (castig?.valoare ?? 0)
  }, 0)

  const castiguriNoroc = checkResult.value?.norocJucat?.castiguri || []
  const totalNoroc = castiguriNoroc.reduce((total, castig) => {
    return total + (castig?.valoare ?? 0)
  }, 0)

  const items = [
    { label: 'Castiguri variante', amount: totalVariante },
    { label: `Castiguri ${norocGameName.value}`, amount: totalNoroc }
  ]

  return items;
})

onMounted(async () => {  
  try{
    if (route.query.from !== 'login') {
      await businessStore.init();
    }

    await refreshData();
  } catch (err) {
    errorStore.showError(err.message || 'Initialization error');
  }
})

function deleteBilet() {
  scanResult.value = null;
  checkResult.value = null;
}

async function checkBilet(data) {
  try {
    let variante = [];

    data.variants.forEach(variant => {
      let numbers = [...(variant.numbers || [])];
      let canUseVariant = isJokerGame.value 
        ? numbers.length >= businessStore.game.numerePerVariantaExtrasa - 1
        : numbers.length >= businessStore.game.numerePerVariantaExtrasa;

      if (canUseVariant) {
        if (isJokerGame.value && variant.joker) {
          numbers.push(variant.joker);
        }

        variante.push({
          id: variant.id,
          numere: numbers.map(num => ({ numar: num }))
        });
      }
    });

    const result = await checkService.checkNumbers(
      businessStore.selectedGame.id,
      variante,
      data.noroc,
      businessStore.selectedDate.date
    );

    checkResult.value = result;

    result.varianteJucate.forEach((v, idVarianta) => {
      v.numere.forEach((n, indexNumar) => {
        if (n.castigator) {
            biletRef.value?.highlightNumber(
              idVarianta, 
              n.numar, 
              isJokerGame.value && indexNumar === v.numere.length - 1);
        }
      });
    });

    if (biletRef.value) {
      biletRef.value.setNorocCastigator(result.norocJucat.castigator);
    }
  } catch (err) {
    console.error('error:', err.message || err)
  }
}

function scanBilet() {
  if (fileInputRef.value) {
    fileInputRef.value.click();
  }
}

function onFileChange(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async function(event) {
    const arrayBuffer = event.target.result;
    try {
      const result = await scanService.scanTicket(businessStore.selectedGame.id, arrayBuffer);
      console.log('Scan result: ', result);
      scanResult.value = result;
      norocValue.value = scanResult?.value.noroc?.numar || '';
    } catch (err) {
      console.error('Failed to scan ticket: ', err.message || err);
    } finally {
      e.target.value = '';
    }
  };

  reader.readAsArrayBuffer(file);
}

async function onGameChanged() {
  if (biletRef.value) {
    biletRef.value.reset();
  }

  scanResult.value = null;
  checkResult.value = null;
  await refreshData();
}

async function onDateChanged() {
  scanResult.value = null;
  checkResult.value = null;
  await refreshData();
}

async function refreshData() {
  const gameId = businessStore.selectedGame?.id;
  const date = businessStore.selectedDate?.date;

  if (!gameId || !date) {
    drawResult.value = null;
    return;
  }

  try {
    const draw = await drawService.getDrawForDate(gameId, date);
    drawResult.value = draw;
  } catch (err) {
    drawResult.value = null;
    errorStore.showError(err.message || 'failed to fetch draw results');
  }
}

</script>

<style scoped>

.main-width {
  width: 100%;
  max-width: max-content;
  margin: 0 auto;
}

.container {
    width: fit-content;
    margin: 0 auto;
    overflow-x: auto;
    overflow-y: auto;
    padding: 10px;
    height: auto;
}

.ticket-panel {
  margin-top: 10px;
}

.ticket-header {
  text-align: center;
  font-weight: 600;
  letter-spacing: 0.03em;
  font-size: var(--font-size-regular);
  margin-bottom: 10px;
}

.ticket-field {
  margin-bottom: 8px;
}

.loading-section {
  text-align: center;
  padding: 6px 0;
}

.no-results {
  font-size: var(--font-size-regular);
  padding: 6px 0;
}

.draw-results {
  font-size: 0.9em;
  font-family: 'Nunito', sans-serif;
}

.result-row {
  display: flex;
  gap: 4px;
  padding: 1px 0;
}

.result-label {
  min-width: 120px;
}

.result-value {
  word-break: break-word;
  display: flex;
  gap: 4px;
}

.result-last {
  color: var(--color-joker);
}

.result-label.placeholder {
  visibility: hidden;
}

</style>