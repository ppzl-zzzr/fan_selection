const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, 'data', 'fans.db');
if (!fs.existsSync(path.dirname(dbPath))) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
}

const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS fans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      model TEXT UNIQUE,
      airflow REAL,
      pressure REAL,
      power REAL,
      rpm INTEGER,
      efficiency REAL
    )`
  );
});

const seedFans = [
  { model: 'AX-300', airflow: 1500, pressure: 250, power: 1.5, rpm: 1450, efficiency: 0.78 },
  { model: 'AX-450', airflow: 2500, pressure: 310, power: 2.2, rpm: 1480, efficiency: 0.82 },
  { model: 'AX-600', airflow: 3400, pressure: 420, power: 3.0, rpm: 1500, efficiency: 0.86 },
  { model: 'AX-750', airflow: 4700, pressure: 520, power: 5.5, rpm: 1450, efficiency: 0.88 },
  { model: 'AX-900', airflow: 6500, pressure: 650, power: 7.5, rpm: 1440, efficiency: 0.9 }
];

function seed() {
  db.get('SELECT COUNT(*) as count FROM fans', (err, row) => {
    if (err) return console.error('Failed to count fans', err);
    if (row.count === 0) {
      const stmt = db.prepare(
        'INSERT INTO fans (model, airflow, pressure, power, rpm, efficiency) VALUES (?, ?, ?, ?, ?, ?)'
      );
      seedFans.forEach((fan) => {
        stmt.run(fan.model, fan.airflow, fan.pressure, fan.power, fan.rpm, fan.efficiency);
      });
      stmt.finalize();
      console.log('Seeded default fan data');
    }
  });
}

function listFans(filters = {}) {
  const conditions = [];
  const params = [];

  if (filters.flowMin != null) {
    conditions.push('airflow >= ?');
    params.push(Number(filters.flowMin));
  }
  if (filters.flowMax != null) {
    conditions.push('airflow <= ?');
    params.push(Number(filters.flowMax));
  }
  if (filters.pressureMin != null) {
    conditions.push('pressure >= ?');
    params.push(Number(filters.pressureMin));
  }
  if (filters.pressureMax != null) {
    conditions.push('pressure <= ?');
    params.push(Number(filters.pressureMax));
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const sql = `SELECT * FROM fans ${whereClause} ORDER BY airflow ASC`;

  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

function getFan(id) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM fans WHERE id = ?', [id], (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function createFan(payload) {
  const { model, airflow, pressure, power, rpm, efficiency } = payload;
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO fans (model, airflow, pressure, power, rpm, efficiency) VALUES (?, ?, ?, ?, ?, ?)',
      [model, airflow, pressure, power, rpm, efficiency],
      function (err) {
        if (err) return reject(err);
        resolve({ id: this.lastID, ...payload });
      }
    );
  });
}

function updateFan(id, payload) {
  const { model, airflow, pressure, power, rpm, efficiency } = payload;
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE fans SET model = ?, airflow = ?, pressure = ?, power = ?, rpm = ?, efficiency = ? WHERE id = ?',
      [model, airflow, pressure, power, rpm, efficiency, id],
      function (err) {
        if (err) return reject(err);
        resolve({ changes: this.changes });
      }
    );
  });
}

function deleteFan(id) {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM fans WHERE id = ?', [id], function (err) {
      if (err) return reject(err);
      resolve({ changes: this.changes });
    });
  });
}

function upsertFans(fans) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      const stmt = db.prepare(
        'INSERT INTO fans (model, airflow, pressure, power, rpm, efficiency) VALUES (?, ?, ?, ?, ?, ?)' +
          ' ON CONFLICT(model) DO UPDATE SET airflow=excluded.airflow, pressure=excluded.pressure, power=excluded.power, rpm=excluded.rpm, efficiency=excluded.efficiency'
      );
      fans.forEach((fan) => {
        stmt.run(fan.model, fan.airflow, fan.pressure, fan.power, fan.rpm, fan.efficiency);
      });
      stmt.finalize((err) => {
        if (err) return reject(err);
        resolve({ count: fans.length });
      });
    });
  });
}

module.exports = {
  seed,
  listFans,
  getFan,
  createFan,
  updateFan,
  deleteFan,
  upsertFans
};
