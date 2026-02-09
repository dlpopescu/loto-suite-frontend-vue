<template>
  <div 
    :class="['data-cell', 
      { 
        'selected': isSelected, 
        'highlighted': isHighlighted
      }
    ]"
    :style="cellStyling"
    @click="$emit('click')">
    {{ data }}
  </div>
</template>

<script setup>
import { computed } from 'vue'

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
  styling: {
    type: Object,
    default: () => ({})
  }
})

defineEmits(['click'])

const cellStyling = computed(() => {
  const defaultStyle = {
    borderColor: 'var(--color-text-primary)',
    textColor: 'var(--color-text-primary)',
    backgroundColor: 'var(--color-white)'
  }
  
  const regularStyle = props.styling.regular || defaultStyle
  const selectedStyle = props.styling.selected || regularStyle
  const highlightStyle = props.styling.highlight || selectedStyle
  const hoverStyle = props.styling.hover || selectedStyle
  
  let style
  
  if (props.isSelected && props.isHighlighted) {
    style = highlightStyle
  } else if (props.isSelected) {
    style = selectedStyle
  } else if (props.isHighlighted) {
    style = highlightStyle
  } else {
    style = regularStyle
  }
  
  return {
    border: `1px solid ${style.borderColor}`,
    color: style.textColor,
    background: style.backgroundColor,
    '--hover-bg': hoverStyle.backgroundColor,
    '--hover-text': hoverStyle.textColor,
    '--hover-border': hoverStyle.borderColor
  }
})
</script>

<style scoped>

.data-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 24px;
  width: 24px;
  border: 1px solid var(--color-main);
  border-radius: 12px;
  font-size: var(--font-size-small);
  cursor: pointer;
  user-select: none;
  font-family: 'Fira Mono', monospace;
}

.data-cell:hover { 
  background: var(--hover-bg) !important;
  color: var(--hover-text) !important;
  border-color: var(--hover-border) !important;
}

.data-cell.selected {
  font-weight: bold;
}

.data-cell.highlighted {
  font-weight: bold;
}

</style>
