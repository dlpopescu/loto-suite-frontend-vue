<template>
  <div class="la-grid">
    <div v-for="(item, i) in items" :key="i" class="la-grid-row">
      <span class="label">{{ item.label }}:</span>
      <span class="amount">{{ formatNumberWithDecimals(item.amount) }} RON</span>
    </div>
    <div class="separator"></div>
    <div class="la-grid-row total">
      <span class="label">TOTAL:</span>
      <span style="color: var(--color-text-primary);">{{formatNumberWithDecimals(total)}} RON</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    default: () => []
  }
})

const total = computed(() => {
  return props.items.reduce((total, item) => {
    return total + (item?.amount ?? 0)
  }, 0)
})

const formatNumberWithDecimals = (value) => {
  value = value ?? 0;
  const num = typeof value === 'string' ? parseFloat(value) : value

  return num.toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2})
}

</script>

<style scoped>
.la-grid {
  background: var(--color-white);
  border: 1px solid var(--color-text-primary);
  border-radius: 4px;
  padding: 8px;
  font-family: 'Fira Mono', monospace;
  font-size: var(--font-size-small);
}

.la-grid-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}

.la-grid-row.total {
  font-weight: 600;
  font-size: var(--font-size-regular);
}

.label {
  color: var(--color-text-primary);
  text-align: right;
  padding-right: 10px;
}

.separator {
  border-bottom: 1px solid var(--color-text-primary);
  margin: 4px 0;
}
</style>