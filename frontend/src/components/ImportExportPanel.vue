<template>
  <div class="card">
    <div class="section-title">
      <div>
        <h2>数据导入 / 导出</h2>
        <p class="tagline">支持 Excel 批量更新，导出当前数据库以便复核与调整。</p>
      </div>
      <div class="tagline">最近更新：{{ lastUpdated }}</div>
    </div>

    <div class="grid grid-cols-3">
      <label>
        <p>导入 Excel (.xlsx)</p>
        <input type="file" accept=".xlsx,.xls" @change="onFileChange" />
      </label>
      <div>
        <p>批量操作</p>
        <div style="display: flex; gap: 10px;">
          <button class="btn btn-primary" type="button" @click="upload" :disabled="!file">
            导入到数据库
          </button>
          <button class="btn btn-secondary" type="button" @click="clearFile">清除</button>
        </div>
      </div>
      <div style="display: flex; align-items: flex-end; justify-content: flex-end;">
        <button class="btn btn-primary" type="button" @click="download">导出 Excel</button>
      </div>
    </div>

    <div v-if="message" :class="['alert', messageType === 'error' ? 'warning' : '']" style="margin-top: 12px;">
      {{ message }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  lastUpdated: String,
  apiBase: {
    type: String,
    default: '/api'
  }
});

const emit = defineEmits(['refresh']);
const file = ref(null);
const message = ref('');
const messageType = ref('success');

function onFileChange(event) {
  const [selected] = event.target.files;
  file.value = selected || null;
}

function clearFile() {
  file.value = null;
  message.value = '';
}

async function upload() {
  if (!file.value) return;
  const form = new FormData();
  form.append('file', file.value);
  try {
    const res = await fetch(`${props.apiBase}/import`, {
      method: 'POST',
      body: form
    });
    if (!res.ok) throw new Error('导入失败，请检查 Excel 格式');
    const data = await res.json();
    messageType.value = 'success';
    message.value = `导入成功，共 ${data.imported} 条记录`;
    emit('refresh');
  } catch (err) {
    messageType.value = 'error';
    message.value = err.message;
  }
}

async function download() {
  try {
    const res = await fetch(`${props.apiBase}/export`);
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fans.xlsx';
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    messageType.value = 'error';
    message.value = '导出失败，请稍后重试';
  }
}
</script>
