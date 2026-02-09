<template>
    <div :key="id" :class="['varianta']">
        <span style="font-size: var(--font-size-small); color:var(--color-text-primary);">
            {{String.fromCharCode(64 + id)}}
        </span>
        <div class="varianta-grids">
            <DataGrid 
                ref="numereGridRef"
                v-model="selectedVariantNumbers"
                :data="availableVariantNumbers"
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
            <DataGrid 
                v-if="isJokerGame"
                ref="jokerGridRef"
                v-model="selectedJokerNumbers"
                :data="availableJokerNumbers"
                :maxSelectionCount="1"
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
  clearSelections,
  highlightNumber,
})

import { computed, ref, watch } from 'vue'
import { useBusinessStore } from '../stores/business'
import DataGrid from './grids/DataGrid.vue'

const businessStore = useBusinessStore()

const isJokerGame = computed(() => businessStore.game.id === 'joker')
const maxSelectionCountVarianta = computed(() => businessStore.game.variantMaxNumber - 1)

const numereGridRef = ref(null)
const selectedVariantNumbers = ref([])
const availableVariantNumbers = computed(() => 
  {
    const len = businessStore.game.variantMaxNumber - businessStore.game.variantMinNumber + 1
    return Array.from({ length: len }, (_, i) => i + businessStore.game.variantMinNumber)
  }
)

const jokerGridRef = ref(null)
const selectedJokerNumbers = ref([])
const availableJokerNumbers = computed(() => Array.from({ length: 20 }, (_, i) => i + 1))

const emit = defineEmits(['update-selection'])

watch(
  [selectedVariantNumbers, selectedJokerNumbers],
  emitSelections
);

function emitSelections() {
    emit(
        'update-selection', 
        {
            id: props.id,
            numbers: selectedVariantNumbers.value.slice(),
            joker : (isJokerGame.value && selectedJokerNumbers.value?.length == 1) ? selectedJokerNumbers.value?.[0] : null
        })
}

function clearSelections(){
    numereGridRef.value?.clearSelections();  
    selectedVariantNumbers.value = []

    jokerGridRef.value?.clearSelections(); 
    selectedJokerNumbers.value = [] 
}

function highlightNumber(numar, isJokerNumber) {
    const gridRef = isJokerNumber ? jokerGridRef : numereGridRef;
    gridRef.value?.highlightCell(numar);
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