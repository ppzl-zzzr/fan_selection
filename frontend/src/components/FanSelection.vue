<template>
  <div class="card">
    <div class="section-title">
      <div>
        <h2>性能筛选</h2>
        <p class="tagline">输入目标风量与风压范围，系统会返回最匹配的机型。</p>
      </div>
      <span class="badge">实时筛选</span>
    </div>

    <form @submit.prevent="() => $emit('search')">
      <div class="grid grid-cols-2">
        <label>
          <p>风量下限 (m³/h)</p>
          <input type="number" v-model.number="localFilters.flowMin" min="0" />
        </label>
        <label>
          <p>风量上限 (m³/h)</p>
          <input type="number" v-model.number="localFilters.flowMax" min="0" />
        </label>
        <label>
          <p>风压下限 (Pa)</p>
          <input type="number" v-model.number="localFilters.pressureMin" min="0" />
        </label>
        <label>
          <p>风压上限 (Pa)</p>
          <input type="number" v-model.number="localFilters.pressureMax" min="0" />
        </label>
      </div>
      <div style="display: flex; gap: 10px; margin-top: 12px;">
        <button class="btn btn-primary" type="submit" :disabled="loading">
          {{ loading ? '筛选中...' : '开始筛选' }}
        </button>
        <button class="btn btn-secondary" type="button" @click="reset">重置</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { watch, reactive } from 'vue';

const props = defineProps({
  loading: Boolean,
  filters: Object
});

const emit = defineEmits(['update:filters', 'search']);
const localFilters = reactive({ ...props.filters });

watch(
  () => ({ ...props.filters }),
  (value) => {
    Object.assign(localFilters, value);
  }
);

watch(
  () => ({ ...localFilters }),
  (value) => {
    emit('update:filters', value);
  },
  { deep: true }
);

function reset() {
  Object.assign(localFilters, {
    flowMin: 1500,
    flowMax: 6000,
    pressureMin: 200,
    pressureMax: 700
  });
  emit('update:filters', { ...localFilters });
  emit('search');
}
</script>
