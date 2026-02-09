<template>
  <div 
    :class="['data-cell', 
      { 
        'selected': isSelected, 
        'highlighted': isHighlighted,
        'read-only': readOnly
      }
    ]"
    @click="$emit('click')">
    {{ data }}
  </div>
</template>

<script setup>
const props = defineProps({
  data: {
    type: [String, Number],
    required: true
  },
  isSelected: {
    type: Boolean,
    default: false
  },
  isHighlighted: {
    type: Boolean,
    default: false
  },
  readOnly: {
    type: Boolean,
    default: false
  }
})

defineEmits(['click'])

</script>

<style scoped>

.data-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 24px;
  width: 24px;
  border: 1px solid var(--dg-cell-border, #333);
  border-radius: clamp(0px, var(--dg-cell-radius, 12px), 12px);
  font-size: var(--font-size-small);
  cursor: pointer;
  user-select: none;
  pointer-events: auto;
  font-family: 'Fira Mono', monospace;
  background-color: var(--dg-cell-bg, #fff);
  color: var(--dg-cell-color, #333);
}

.data-cell:hover { 
  background: var(--dg-cell-hover-bg, var(--dg-cell-selected-bg, var(--dg-cell-bg, #333))) !important;
  color: var(--dg-cell-hover-color, var(--dg-cell-selected-color, var(--dg-cell-color, #fff))) !important;
  border-color: var(--dg-cell-hover-border, var(--dg-cell-selected-border, var(--dg-cell-border, #333))) !important;
}

.data-cell.selected {
  font-weight: bold;
  border-color: var(--dg-cell-selected-border, #333);
  background-color: var(--dg-cell-selected-bg, #333);
  color: var(--dg-cell-selected-color, #fff);
}

.data-cell.highlighted {
  border-color: var(--dg-cell-highlight-border, #0a0);
  background-color: var(--dg-cell-highlight-bg, #0a0);
  color: var(--dg-cell-highlight-color, #fff);
}

.data-cell.selected.highlighted {
  font-weight: bold;
}

.data-cell.read-only {
  cursor: default;
  pointer-events: none;
}

</style>
