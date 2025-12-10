<template>
  <div class="card">
    <div class="section-title">
      <div>
        <h2>风机列表</h2>
        <p class="tagline">按风量升序排列，方便对比功率与效率。</p>
      </div>
      <div class="badge" v-if="fans.length">共 {{ fans.length }} 台</div>
    </div>

    <div v-if="loading" style="display: flex; align-items: center; gap: 10px;">
      <span class="loader"></span>
      <span>数据加载中...</span>
    </div>

    <div v-else-if="!fans.length" class="alert warning">
      没有符合条件的机型，请调整筛选范围或导入数据。
    </div>

    <div v-else style="overflow-x: auto;">
      <table class="table">
        <thead>
          <tr>
            <th>型号</th>
            <th>风量 (m³/h)</th>
            <th>风压 (Pa)</th>
            <th>功率 (kW)</th>
            <th>转速 (rpm)</th>
            <th>效率</th>
            <th>匹配度</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="fan in fans" :key="fan.id">
            <td>{{ fan.model }}</td>
            <td>{{ fan.airflow }}</td>
            <td>{{ fan.pressure }}</td>
            <td>{{ fan.power }}</td>
            <td>{{ fan.rpm }}</td>
            <td>{{ Number(fan.efficiency).toFixed(2) }}</td>
            <td>
              <span class="badge" :style="{ background: badgeColor(fan).bg, color: badgeColor(fan).fg }">
                {{ badgeColor(fan).label }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  fans: {
    type: Array,
    default: () => []
  },
  loading: Boolean
});

function badgeColor(fan) {
  if (fan.efficiency >= 0.88) return { bg: 'rgba(34,197,94,0.15)', fg: '#15803d', label: '高效' };
  if (fan.efficiency >= 0.82) return { bg: 'rgba(59,130,246,0.15)', fg: '#1d4ed8', label: '标准' };
  return { bg: 'rgba(248,113,113,0.15)', fg: '#b91c1c', label: '待优化' };
}
</script>
