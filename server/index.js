const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const XLSX = require('xlsx');
const { seed, listFans, getFan, createFan, updateFan, deleteFan, upsertFans } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const upload = multer({ dest: path.join(__dirname, 'uploads') });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

seed();

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Fan selection backend running' });
});

app.get('/api/fans', async (req, res) => {
  try {
    const fans = await listFans(req.query);
    res.json(fans);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to list fans' });
  }
});

app.get('/api/fans/:id', async (req, res) => {
  try {
    const fan = await getFan(req.params.id);
    if (!fan) return res.status(404).json({ error: 'Fan not found' });
    res.json(fan);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch fan' });
  }
});

app.post('/api/fans', async (req, res) => {
  try {
    const fan = await createFan(req.body);
    res.status(201).json(fan);
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to create fan' });
  }
});

app.put('/api/fans/:id', async (req, res) => {
  try {
    await updateFan(req.params.id, req.body);
    const fan = await getFan(req.params.id);
    res.json(fan);
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to update fan' });
  }
});

app.delete('/api/fans/:id', async (req, res) => {
  try {
    await deleteFan(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to delete fan' });
  }
});

app.post('/api/import', upload.single('file'), async (req, res) => {
  try {
    const filePath = req.file.path;
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });
    const normalized = rows
      .map((row) => ({
        model: row.model || row.Model || row['型号'] || row['model'],
        airflow: Number(row.airflow || row.Airflow || row['风量'] || row['airflow']),
        pressure: Number(row.pressure || row.Pressure || row['风压'] || row['pressure']),
        power: Number(row.power || row.Power || row['功率'] || row['power']),
        rpm: Number(row.rpm || row.RPM || row['转速'] || row['rpm']),
        efficiency: Number(row.efficiency || row.Efficiency || row['效率'] || row['efficiency'])
      }))
      .filter((row) => row.model);

    await upsertFans(normalized);
    fs.unlinkSync(filePath);
    res.json({ imported: normalized.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Failed to import Excel' });
  }
});

app.get('/api/export', async (_req, res) => {
  try {
    const fans = await listFans();
    const worksheet = XLSX.utils.json_to_sheet(fans);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Fans');
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', 'attachment; filename="fans.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

const distPath = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
