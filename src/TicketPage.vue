<template>
  <div class="container">
    <table class="main-width" style="margin-top: 10px;">
      <tbody style="font-size: var(--font-size-regular);">
        <tr>
          <td colspan="6" style="text-align: center;font-weight: 600;color: var(--color-success-text);letter-spacing: 0.03em; ">Joc / Data tragere:</td>
        </tr>
        <tr>
          <td colspan="6">
            <SelectEx 
              v-model="businessStore.gameId" :dataSet="businessStore.games" 
              keyProp="id" valueProp="id" displayProp="display_name"
              :emits="['game-changed']" @game-changed="onGameChanged"/>
          </td>
        </tr>
        <tr>
          <td colspan="6">
            <SelectEx 
              v-model="businessStore.dateId" :dataSet="businessStore.dates" 
              keyProp="date" valueProp="date" displayProp="label"
              :emits="['date-changed']" @date-changed="onDateChanged"/>
          </td>
        </tr>
        <tr>
          <td colspan="6">
            <div class="pre-rezultate">
              <pre v-if="!hasDrawResults()">Nu exista rezultate pentru data selectata.</pre>
              <pre v-if="hasDrawResults()">Rezultate extragere:</pre>
              <pre v-if="hasRezultateVarianta">Numere: {{numereExtraseVarianta}}</pre>
              <pre v-if="hasRezultateVariantaSpeciala">Numere (varianta speciala): {{numereExtraseVariantaSpeciala}}</pre>
              <pre v-if="drawResult?.noroc">{{norocGameName}}: {{drawResult?.noroc?.numar}}</pre>
            </div>
          </td>
        </tr>
      </tbody>
    </table> 
    <Bilet v-if="businessStore.gameId && hasDrawResults()"
      class="main-width"
      style="margin-top: 1px;"
      ref="biletRef"
      @delete="deleteBilet"
      @check="checkBilet"
      @scan="scanBilet"
    />  
    <input type="file" ref="fileInputRef" style="display:none" @change="onFileChange" />
    <Castiguri 
      v-if="(checkResult?.castiguri_total ?? 0) > 0"
      class="main-width"
      style="margin-top: 10px;"
      :castiguriVarianta="castiguriVarianta" 
      :castiguriVariantaSpeciala="castiguriVariantaSpeciala" 
      :castiguriNoroc="castiguriNoroc" 
      :norocGameName="`${businessStore.selectedGame.nume_noroc}`" /> 
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Bilet from './components/Bilet.vue'
import Castiguri from './components/Castiguri.vue'
import SelectEx from './components/SelectEx.vue'
import { checkNumbers, getDrawResults, scanTicket } from './api/business.js'
import { computed } from 'vue'
import { useBusinessStore } from './stores/business_store.js'
import { normalizeNumber } from './utils/utils.js'
import { useErrorStore } from './stores/error_store.js';

const businessStore = useBusinessStore()
const errorStore = useErrorStore();
const route = useRoute();

const biletRef = ref(null)
const fileInputRef = ref(null)

const drawResult = ref(null);
const checkResult = ref(null);
const scanResult = ref(null);

const norocValue = ref('')

const castiguriVarianta = ref([])
const castiguriVariantaSpeciala = ref([])
const castiguriNoroc = ref([])

const isJokerGame = computed(() => businessStore.gameId.toLowerCase() === 'joker')
const norocGameName = computed(() => businessStore.selectedGame?.nume_noroc || 'NOROC')

const hasRezultateVarianta = computed(() => drawResult.value?.varianta && drawResult.value.varianta.id !== -1)
const numereExtraseVarianta = computed(() => {
  const numbers = [];
  if (hasRezultateVarianta.value) {
    drawResult.value.varianta.numere.forEach(n => numbers.push(normalizeNumber(n.numar)));
  }

  return numbers.join(', ');
});

const hasRezultateVariantaSpeciala = computed(() => drawResult.value?.varianta_speciala && drawResult.value.varianta_speciala.id !== -1)
const numereExtraseVariantaSpeciala = computed(() => {
  const numbers = [];
  if (hasRezultateVariantaSpeciala.value) {
    drawResult.value.varianta_speciala.numere.forEach(n => numbers.push(normalizeNumber(n.numar)));
  }

  return numbers.join(', ');
});

const hasCastiguriNoroc = computed (() => castiguriNoroc.value && castiguriNoroc.value.some(c => c.win_count > 0));

onMounted(async () => {  
  try{
    if (route.query.from !== 'login') {
      await businessStore.fetchGames();
      await businessStore.fetchDates(30);
    }

    await fetchDrawResults();
  } catch (err) {
    errorStore.showError(err.message || 'Initialization error');
  }
})

function deleteBilet() {
  scanResult.value = null;
  checkResult.value = null;
  resetCastiguriToDefault();
}

function resetCastiguriToDefault() {
  if (castiguriVarianta.value.length > 0) {
    castiguriVarianta.value = castiguriVarianta.value.map(castig => ({
      ...castig,
      win_count: 0
    }));
  }
  
  if (castiguriVariantaSpeciala.value.length > 0) {
    castiguriVariantaSpeciala.value = castiguriVariantaSpeciala.value.map(castig => ({
      ...castig,
      win_count: 0
    }));
  }
  
  if (castiguriNoroc.value.length > 0) {
    castiguriNoroc.value = castiguriNoroc.value.map(castig => ({
      ...castig,
      win_count: 0
    }));
  }
}

async function checkBilet(data) {
  try {
    let checkData = [];

    data.variants.forEach(variant => {
      let numbers = [...(variant.numbers || [])];
      if (isJokerGame.value && variant.joker) {
        numbers.push(variant.joker);
      }

      checkData.push({
        id: variant.variant_id,
        numere: numbers.map(num => ({ numar: num }))
      });
    });

    const result = await checkNumbers(
      businessStore.gameId,
      checkData,
      data.noroc,
      businessStore.dateId
    );

    console.log('Check result:', result);

    castiguriVarianta.value = result.castiguri_varianta || []
    castiguriVariantaSpeciala.value = result.castiguri_varianta_speciala || []
    castiguriNoroc.value = result.castiguri_noroc || []

    // const matching = [];
    // const matchingJokers = [];

    // if (result.variante_jucate && result.variante_jucate.length > 0) {
    //   result.variante_jucate.forEach((variant, variantIndex) => {
    //     const matchedNumbers = [];
    //     const matchedJokerNumbers = [];

    //     if (variant.numere && variant.numere.length > 0) {
    //       variant.numere.forEach((numar, index) => {
    //         if (numar.castigator) {
    //           if (isJokerGame) {
    //             const isJokerNumber = index === variant.numere.length - 1;
    //             if (isJokerNumber) {
    //               matchedJokerNumbers.push(numar.numar);
    //             } else {
    //               matchedNumbers.push(numar.numar);
    //             }
    //           } else {
    //             matchedNumbers.push(numar.numar);
    //           }
    //         }
    //       });
    //     }
        
    //     matching[variantIndex] = matchedNumbers;
    //     matchingJokers[variantIndex] = matchedJokerNumbers;
    //   });
    // }

    if (biletRef.value) {
      // biletRef.value.highlightNumbers(matching, matchingJokers);
      biletRef.value.setNorocCastigator(hasCastiguriNoroc.value);
    }

    checkResult.value = result;
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
      const result = await scanTicket(businessStore.gameId, arrayBuffer);
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
  await fetchDrawResults();
}

async function onDateChanged() {
  scanResult.value = null;
  checkResult.value = null;
  await fetchDrawResults();
}

async function fetchDrawResults() {
    const gameId = businessStore.gameId.trim();
    if (!gameId) return;

    const dateId = businessStore.dateId.trim();
    if (!dateId) return;

  try {

    const result = await getDrawResults(gameId, dateId);
    
    const variantaLength = result.varianta?.numere?.length || 0;
    if (variantaLength > 0) {
      if (isJokerGame) {
        const mainNumbers = result.varianta.numere.slice(0, 5);
        const jokerNumber = result.varianta.numere.slice(5);
        mainNumbers.sort((a, b) => a.numar - b.numar);
        result.varianta.numere = [...mainNumbers, ...jokerNumber];
      } else {
        result.varianta.numere.sort((a, b) => a.numar - b.numar);
      }
    }
    
    const variantaSpecialaLength = result.varianta_speciala?.numere?.length || 0;
    if (variantaSpecialaLength > 0) {
      if (isJokerGame) {
        const mainNumbers = result.varianta_speciala.numere.slice(0, 5);
        const jokerNumber = result.varianta_speciala.numere.slice(5);
        mainNumbers.sort((a, b) => a.numar - b.numar);
        result.varianta_speciala.numere = [...mainNumbers, ...jokerNumber];
      } else {
        result.varianta_speciala.numere.sort((a, b) => a.numar - b.numar);
      }
    }

    drawResult.value = result;
  } catch (err) {
    errorStore.showError(err.message || 'Failed to fetch draw results');
  }
}

function hasDrawResults() {
  if (!drawResult.value) return false;
  
  const variantaLength = drawResult.value?.varianta?.numere?.length || 0;
  const variantaSpecialaLength = drawResult.value?.varianta_speciala?.numere?.length || 0;
  return  variantaLength > 0 ||variantaSpecialaLength > 0;
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

.pre-rezultate pre {
  margin: 4px 0;
  font-family: 'Nunito', sans-serif;
  font-size: var(--font-size-small);
  border: 1px solid var(--color-border);
}

</style>