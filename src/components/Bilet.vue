<template>
  <div class="bilet">
    <div class="bilet-variante">
      <div v-for="n in numarVariante" :key="n" :class="['varianta']">
        <span style="font-size: var(--font-size-small); color:var(--color-text-primary);">{{getVariantKey(n)}}</span>
        <div class="varianta-grids">
          <NumberGrid 
            :key="getVariantKey(n)"
            :minValue="minNumarVarianta"
            :maxValue="maxNumarVarianta"
            :colCount="gridColumnCount"
            :maxSelectionCount="maxSelectionCountVarianta"
            v-model:selectedNumbers="selectedNumbers[n-1]"
            :highlightedNumbers="matchingNumbers[n-1] || []"
            :styling="{
              selected: {
                borderColor: 'var(--color-main)',
                backgroundColor: 'var(--color-main)',
                textColor: 'var(--color-white)'
              },
              highlight: {
                borderColor: 'var(--color-success-text)',
                backgroundColor: 'var(--color-success-text)',
                textColor: 'var(--color-white)'
              }
            }"
          />
          <div v-if="gameId === 'joker'">
            <NumberGrid 
              :minValue="minNumarJoker"
              :maxValue="maxNumarJoker"
              :colCount="gridColumnCount"
              :maxSelectionCount="maxSelectionCountJoker"
              v-model:selectedNumbers="selectedJokerNumbers[n-1]"
              :highlightedNumbers="matchingJokerNumbers[n-1] || []"
              :styling="{
                regular: {
                  borderColor: 'var(--color-joker)',
                  backgroundColor: 'var(--color-white)',
                  textColor: 'var(--color-joker)'
                },
                selected: {
                  borderColor: 'var(--color-joker)',
                  backgroundColor: 'var(--color-joker)',
                  textColor: 'var(--color-white)'
                },
                highlight: {
                  borderColor: 'var(--color-success-text)',
                  backgroundColor: 'var(--color-success-text)',
                  textColor: 'var(--color-white)'
                }
              }"
            />
          </div>
        </div>
      </div>
    </div>    
    <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 10px;">
      <Noroc 
        ref="norocRef"
        v-model="norocModel" 
        :max-length="norocLen"
        :label="norocGameName"
        :castigator="norocCastigator"/>
      <div style="border-left: 1px dashed var(--color-text-secondary);">
        <!-- <button class="bilet-button bilet-button-scan" style="margin-left: 2px; " @click="scaneazaBilet">Scaneaza</button> -->
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
        <!-- <button class="bilet-button bilet-button-verifica" style="margin-left: 2px; margin-right: 4px;" @click="verificaBilet">Verifica</button> -->
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import NumberGrid from './NumberGrid.vue'
import Noroc from './Noroc.vue'

const props = defineProps({
  game: {
    type: Object,
    default: () => ({})
  },
  norocValue: {
    type: String,
    default: ''
  }
})

const norocRef = ref(null)
const selectedNumbers = ref([])
const selectedJokerNumbers = ref([])
const matchingNumbers = ref([])
const matchingJokerNumbers = ref([])
const norocCastigator = ref(false)

const emit = defineEmits(['noroc-changed', 'sterge-bilet', 'verifica-bilet'])

defineExpose({
  highlightNumbers,
  setNorocCastigator,
  reset,
  getSelections: () => ({
    variants: selectedNumbers.value,
    jokers: selectedJokerNumbers.value,
    noroc: props.norocValue
  })
})

onMounted(() => {
  reset()
})

watch(() => props.game?.id, (newGameId, oldGameId) => {
  if (newGameId !== oldGameId) {
    reset()
  }
}, { immediate: true })

function setNorocCastigator(isWinner) {
  norocCastigator.value = isWinner
}

function highlightNumbers(mainNumbers, jokerNumbers) {
  matchingNumbers.value = mainNumbers || []
  matchingJokerNumbers.value = jokerNumbers || []
}

function reset() {
  const numVariants = numarVariante.value 
  selectedNumbers.value = Array(numVariants).fill().map(() => [])
  selectedJokerNumbers.value = Array(numVariants).fill().map(() => [])
  highlightNumbers(null, null);
  
  if (norocRef.value) {
    norocRef.value.clearInput()
  }
}

const gameId = computed(() => props.game?.id || '')
const norocGameName = computed(() => props.game?.nume_noroc || 'NOROC')
const norocLen = computed(() => props.game?.numar_cifre_noroc || 7)
const numarVariante = computed(() =>  props.game?.numar_max_variante || 1)
const minNumarVarianta = computed(() =>  props.game?.min_value_numar_varianta || 1)
const maxNumarVarianta = computed(() =>  props.game?.max_value_numar_varianta || 49)
const gridColumnCount = computed( () => {
  return 10;
})

const minNumarJoker = computed (() => 1)
const maxNumarJoker = computed (() => 20)
const maxSelectionCountVarianta = computed (() => maxNumarVarianta.value - 1)
const maxSelectionCountJoker = computed (() => 1)

const norocModel = computed({
  get() {
    return props.norocValue
  },
  set(value) {
    emit('noroc-changed', value)
  }
})

function getVariantKey (index) {
  return String.fromCharCode(64 + index);
}

function stergeBilet() {
  reset();
  emit('sterge-bilet')
}

function scaneazaBilet() {
  reset();
}

function verificaBilet() {
  emit('verifica-bilet')
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
  padding-top: 8px;
  padding-bottom: 8px;
  padding-right: 8px;
  width: auto;
  max-width: max-content;
  display: flex;
} 

.varianta span {
  /* width: 26px; */
  padding-left: 4px;
  padding-right: 8px;
  text-align: center;
  font-weight: 700;
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

</style>
