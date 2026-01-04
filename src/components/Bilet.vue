<template>
    <div class="bilet">
      <div class="bilet-variante">
        <Varianta 
          v-for="n in numarVariante" 
          :id="n" 
          @update-selection="doOnVariantSelectionsUpdated"
          ref="varianteRefs" />
      </div>
      <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 8px;">
        <div class="noroc-container">
          <span style="font-size: var(--font-size-small); color:var(--color-text-primary); ">{{norocGameName}}</span>
          <input
            type="text"
            inputmode="numeric"
            pattern="[0-9]*"
            ref="norocInputRef"
            :maxlength="norocLen"
            :class="['noroc-input', { 'castigator': norocCastigator }]"
            @input="onNorocInput"
            autocomplete="off"/>
        </div>
        <div style="border-left: 1px dashed var(--color-text-secondary);">
          <button class="bilet-button" @click="scaneazaBilet" style="margin-left: 8px;">
            <svg viewBox="0 0 24 24">
              <path
                d="M20 5h-3.2l-1.8-2H9L7.2 5H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2m-8 14a5 5 0 1 1 5-5a5 5 0 0 1-5 5m0-8a3 3 0 1 0 3 3a3 3 0 0 0-3-3Z"/>
            </svg>
          </button>  
          <button class="bilet-button bilet-button-sterge" @click="stergeBilet" style="margin-left: 4px;">
            <svg viewBox="0 0 24 24">
              <path
                d="M9 3v1H4v2h16V4h-5V3H9m1 5v10h2V8h-2m4 0v10h2V8h-2z"/>
            </svg>
          </button>  
          <button class="bilet-button bilet-button-verifica" style="margin-left: 4px;margin-right: 8px;" @click="verificaBilet">
            <svg viewBox="0 0 24 24">
              <path
                d="M12 2A10 10 0 1 0 22 12A10 10 0 0 0 12 2m-1 15l-4-4l1.41-1.41L11 13.17l4.59-4.59L17 10l-6 7z"/>
            </svg>
          </button>
      </div>
    </div>
  </div>
</template>

<script setup>
  
import { ref, computed, onMounted, watch } from 'vue'
import { useBusinessStore } from '../stores/business_store'
import { isFunction } from '../utils/utils'
import Varianta from './Varianta.vue'

const businessStore = useBusinessStore()
const norocInputRef = ref(null)
const ticketSelections = ref([])
const norocCastigator = ref(false)
const varianteRefs = ref([]);
// const matchingNumbers = ref([])
// const matchingJokerNumbers = ref([])

const selectedGame = computed(() => businessStore.selectedGame || {})
const norocGameName = computed(() => selectedGame.value.nume_noroc || 'NOROC')
const norocLen = computed(() => selectedGame.value.numar_cifre_noroc || 7)
const numarVariante = computed(() =>  selectedGame.value.numar_max_variante || 1)

const emit = defineEmits(['check', 'delete', 'scan'])

defineExpose({
  // highlightNumbers,
  setNorocCastigator,
  reset
})

onMounted(() => {
  reset()
})

watch(() =>  businessStore.gameId, (newGameId, oldGameId) => {
  if (newGameId && newGameId !== oldGameId) {
      reset()
    }
}, { immediate: true })

function setNorocCastigator(isWinner) {
  norocCastigator.value = isWinner
}

// function highlightNumbers(mainNumbers, jokerNumbers) {
//   matchingNumbers.value = mainNumbers || []
//   matchingJokerNumbers.value = jokerNumbers || []
// }

function reset() {
  ticketSelections.value = []
  norocCastigator.value = false

  varianteRefs.value.forEach(varianta => {
    if (varianta && isFunction(varianta.clearSelections)) {
      varianta.clearSelections();
    }
  });

  if (norocInputRef.value) {
    norocInputRef.value.value = '';
  }

  // highlightNumbers(null, null);
}

function stergeBilet() {
  reset();
  emit('delete')
}

function scaneazaBilet() {
  // reset();
  // emit('scan')
}

function verificaBilet() {
  emit(
    'check', 
    {
      variants: ticketSelections.value,
      noroc: norocInputRef.value.value
    })
}

function onNorocInput(e) {
  const val = e.target.value.replace(/[^0-9]/g, '');
  norocInputRef.value.value = val;
  norocCastigator.value = false;
}

function doOnVariantSelectionsUpdated(selections) {
  const idx = ticketSelections.value.findIndex(s => s.variant_id === selections.variant_id);

  if (idx !== -1) {
    ticketSelections.value[idx] = selections;
  } else {
    ticketSelections.value.push(selections);
  }
}

</script>

<style scoped>
.bilet {
  border: 1px solid var(--color-text-primary);
  display:flex;
  max-width: max-content;
  width: auto;
  flex-direction: column;
  padding-bottom: 10px;
}

.bilet-variante {
  display: grid;
  width: auto;
  max-width: max-content;
}

.varianta {
  border-bottom: 1px dashed var(--color-text-secondary);
  padding: 8px;
  width: auto;
  max-width: max-content;
  display: flex;
} 

.varianta span {
  /* width: 26px; */
  text-align: center;
  /* font-weight: 700; */
  padding-right: 2px;
  align-self: center;
}

.varianta-grids {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-left: 8px;
}

.varianta-joker span {
  font-weight: 700;
  text-align: center;
}

.bilet-button {
  display: inline-flex;
  background: var(--color-white);
  color: var(--color-info);
  border-radius: 4px;
  border: 1px solid var(--color-info);
  cursor: pointer;
  padding: 4px 4px;
}

.bilet-button:hover {
  background: var(--color-info);
  color: var(--color-white);
  border: 1px solid var(--color-info);
}

.bilet-button svg {
  width: 20px;
  height: 20px;
  fill: currentColor;
}

.bilet-button-sterge {
  color: var(--color-red);
  border: 1px solid var(--color-red);
}

.bilet-button-sterge:hover {
  color: var(--color-white);
  background: var(--color-red);
  border: 1px solid var(--color-red);
}

.bilet-button-verifica {
  color: var(--color-success-text);
  border: 1px solid var(--color-success-text);
}

.bilet-button-verifica:hover {
  background: var(--color-success-text);
  color: var(--color-white);
  border: 1px solid var(--color-success-text);
}

.noroc-container {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-left: 8px;
}

.noroc-input {
  font-size: var(--font-size-small);
  width: 100px;
  text-align: center;
  box-sizing: border-box;
  font-family: "Fira Mono", monospace;
  padding: 5px;
  border-radius: 4px;
  border: 1px solid var(--color-main);
}

.noroc-input.castigator {
  color: var(--color-white);
  background: var(--color-success-text);
  border: 1px solid var(--color-success-text);
}

</style>
