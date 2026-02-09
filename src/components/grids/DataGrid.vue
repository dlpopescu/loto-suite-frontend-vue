<template>
  <div :style="gridStyle">
    <DataGridCell 
      v-for="item in props.data"
      :key="item?.id ?? item"
      :data="item"
      :isSelected="!props.readOnly && selectedCells.includes(item)"
      :isHighlighted="!props.readOnly && highlightedCells.includes(item)"
      :readOnly="props.readOnly"
      @click="!props.readOnly && toggleSelected(item)"/>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import DataGridCell from './DataGridCell.vue'

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
  readOnly: {
    type: Boolean,
    default: false
  },
})

const emit = defineEmits(['update:modelValue'])

const selectedCells = ref([])
const highlightedCells = ref([])

const gridStyle = computed(() => ({
  display: 'grid',
  gridTemplateColumns: `repeat(${props.colCount}, 1fr)`,
  gap: '4px',
  width: 'auto',
  maxWidth: 'max-content'
}))

function toggleSelected(cell) {
  highlightedCells.value = []

  const index = selectedCells.value.indexOf(cell)
  
  if (index > -1) {
    selectedCells.value.splice(index, 1)
  } else if (props.maxSelectionCount == 1) {
    selectedCells.value = [cell]
  } else if (selectedCells.value.length < props.maxSelectionCount) {
    selectedCells.value.push(cell)
  }
  
  emit('update:modelValue', [...selectedCells.value])
}

function clear(){
  selectedCells.value = [];
  highlightedCells.value = [];
}

function highlightCell(number) {
  if (!highlightedCells.value.includes(number)) {
    highlightedCells.value.push(number);
  }
}

defineExpose({
  clear,
  highlightCell
})

</script>

<style scoped>
</style>