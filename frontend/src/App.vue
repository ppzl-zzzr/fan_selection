<template>
  <div class="app-shell">
    <div class="hero">
      <div>
        <p class="badge-pill">智能风机选型 | Vue + Node</p>
        <h1>风机选型控制台</h1>
        <p>实时筛选、导入 Excel 数据，快速定位最合适的机型。</p>
      </div>
      <div class="card" style="min-width: 260px; text-align: right;">
        <p class="tagline">当前数据量</p>
        <h2 style="margin: 6px 0 0;">{{ stats.total }} 台</h2>
        <p class="tagline" style="margin-top: 6px;">涵盖 {{ stats.range }} 风量区间</p>
      </div>
    </div>

    <fan-selection
      :loading="loading"
      :filters="filters"
      @update:filters="filters = $event"
      @search="loadFans"
    />

    <import-export-panel
      :last-updated="lastUpdated"
      :api-base="apiBase"
      @refresh="loadFans"
    />

    <fan-table :fans="fans" :loading="loading" />
  </div>
</template>

<script setup>
import { onMounted, reactive, ref, computed } from 'vue';
import FanSelection from './components/FanSelection.vue';
import FanTable from './components/FanTable.vue';
import ImportExportPanel from './components/ImportExportPanel.vue';

const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api';
const fans = ref([]);
const loading = ref(false);
const lastUpdated = ref('未更新');
const filters = reactive({
  flowMin: 1500,
  flowMax: 6000,
  pressureMin: 200,
  pressureMax: 700
});

const stats = computed(() => {
  if (!fans.value.length) return { total: 0, range: '0-0 m³/h' };
  const min = Math.min(...fans.value.map((f) => f.airflow || 0));
  const max = Math.max(...fans.value.map((f) => f.airflow || 0));
  return { total: fans.value.length, range: `${min} - ${max} m³/h` };
});

async function loadFans() {
  loading.value = true;
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) params.append(key, value);
  });

  try {
    const res = await fetch(`${apiBase}/fans?${params.toString()}`);
    fans.value = await res.json();
    const now = new Date();
    lastUpdated.value = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
}

onMounted(loadFans);
</script>
