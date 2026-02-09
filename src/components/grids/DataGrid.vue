<template>
  <div :style="gridStyle">
    <GridCell 
      v-for="item in props.data"
      :key="item"
      :data="item"
      :isSelected="internalSelected.includes(item)"
      :isHighlighted="internalHighlighted.includes(item)"
      :styling="props.styling"
      @click="toggleSelected(item)"/>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import GridCell from './GridCell.vue'

const props = defineProps({
  data: {
    type: Array,
    required: true
  },
  colCount: {
    type: Number,
    default: 10
  },
  maxSelectionCount: {
    type: Number,
    default: undefined
  },
  styling: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:modelValue'])

const internalSelected = ref([])
const internalHighlighted = ref([])

const gridStyle = computed(() => ({
  display: 'grid',
  gridTemplateColumns: `repeat(${props.colCount}, 1fr)`,
  gap: '4px',
  width: 'auto',
  maxWidth: 'max-content'
}))

function toggleSelected(item) {
  const index = internalSelected.value.indexOf(item)
  
  if (index > -1) {
    internalSelected.value.splice(index, 1)
  } else {
    if (internalSelected.value.length < props.maxSelectionCount) {
      internalSelected.value.push(item)
    } else if (props.maxSelectionCount === 1) {
      internalSelected.value = [item]
    }
  }
  
  emit('update:modelValue', [...internalSelected.value])
}

function clearSelections() {
  internalSelected.value = []
  internalHighlighted.value = []
}

function highlightCell(number) {
  if (!internalHighlighted.value.includes(number)) {
    internalHighlighted.value.push(number)
  }
}

defineExpose({
  clearSelections,
  highlightCell
})

</script>

<style scoped>
</style>