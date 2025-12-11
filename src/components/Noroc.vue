<template>
  <div class="noroc-container">
    <span v-if="label" style="font-size: var(--font-size-small); color:var(--color-text-primary); font-weight: 700; ">{{label}}</span>
    <input
      type="text"
      id="noroc-input"
      ref="norocInputRef"
      :maxlength="maxLength"
      :class="['noroc-input', { 'castigator': isCastigator }]"
      v-model="norocValue"
      @input="onInput"
      autocomplete="off"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  maxLength: {
    type: Number,
    default: 7
  },
  label: {
    type: String,
    default: ''
  },
  castigator: {
    type: Boolean,
    default: false
  },
})

const emit = defineEmits(['update:modelValue'])

const norocValue = ref(props.modelValue)
const norocInputRef = ref(null)
const isCastigator = ref(props.castigator)

watch(() => props.modelValue, (val) => {
  norocValue.value = val
})

watch(() => props.castigator, (val) => {
  isCastigator.value = val
})

function onInput(e) {
  const val = e.target.value.replace(/[^0-9]/g, '');
  norocValue.value = val;
  isCastigator.value = false;
  emit('update:modelValue', val)
}

function focusInput() {
  if (norocInputRef.value) {
    norocInputRef.value.focus();
  }
}

function clearInput() {
  norocValue.value = '';
  isCastigator.value = false;
  emit('update:modelValue', '');
}

defineExpose({
  focusInput,
  clearInput
})
</script>

<style scoped>

.noroc-container {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-left: 4px;
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
