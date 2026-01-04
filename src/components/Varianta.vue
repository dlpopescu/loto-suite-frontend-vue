<template>
    <div :key="id" :class="['varianta']">
        <span style="font-size: var(--font-size-small); color:var(--color-text-primary);">
            {{String.fromCharCode(64 + id)}}
        </span>
        <div class="varianta-grids">
            <NumberGrid 
                ref="numereGridRef"
                :variantId="id"
                v-model="selectedNumbers"
                :minValue="minNumarVarianta"
                :maxValue="maxNumarVarianta"
                :colCount="gridColumnCount"
                :maxSelectionCount="maxSelectionCountVarianta"
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
                }"/>
            <NumberGrid 
                v-if="isJokerGame"
                ref="jokerGridRef"
                v-model="selectedJokerNumbers"
                :variantId="id"
                :minValue="minNumarJoker"
                :maxValue="maxNumarJoker"
                :colCount="gridColumnCount"
                :maxSelectionCount="maxSelectionCountJoker"
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
                }"/>
        </div>
    </div>
</template>

<script setup>

const props = defineProps({
  id: {
    type: Number,
  },
})

defineExpose({
  clearSelections
})

import { computed, ref, watch } from 'vue'
import { useBusinessStore } from '../stores/business_store'
import NumberGrid from './NumberGrid.vue'

const businessStore = useBusinessStore()

const selectedGame = computed(() => businessStore.selectedGame || {})
const isJokerGame = computed(() => selectedGame.value.id === 'joker')
const minNumarVarianta = computed(() =>  selectedGame.value.min_value_numar_varianta || 1)
const maxNumarVarianta = computed(() =>  selectedGame.value.max_value_numar_varianta || 49)
const minNumarJoker = computed (() => 1)
const maxNumarJoker = computed (() => 20)
const maxSelectionCountVarianta = computed (() => maxNumarVarianta.value - 1)
const maxSelectionCountJoker = computed (() => 1)
const gridColumnCount = computed( () => 10)

const numereGridRef = ref(null)
const jokerGridRef = ref(null)

const selectedNumbers = ref([])
const selectedJokerNumbers = ref([])

const emit = defineEmits(['update-selection'])

watch(
  [selectedNumbers, selectedJokerNumbers],
  emitSelections
);

function emitSelections() {
    emit(
        'update-selection', 
        {
            variant_id: props.id,
            numbers: selectedNumbers.value.slice().sort((a, b) => a - b),
            joker : (isJokerGame.value && selectedJokerNumbers.value.length > 0) ? selectedJokerNumbers.value[0] : null
        })
}

function clearSelections(){
    if (numereGridRef.value) {
      numereGridRef.value.clearSelections();  
    }

    if (isJokerGame.value && jokerGridRef.value) {
      jokerGridRef.value.clearSelections();  
    }
}

</script>

<style scoped>

.varianta {
  border-bottom: 1px dashed var(--color-text-secondary);
  padding: 8px;
  width: auto;
  max-width: max-content;
  display: flex;
} 

.varianta span {
  text-align: center;
  padding-right: 2px;
  align-self: center;
}

.varianta-grids {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-left: 8px;
}

</style>