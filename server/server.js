const path = require('path');
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const multer = require('multer');
const fs = require('fs');

// === Konfiguration ===
const PORT = 3000;
const STATIC_DIR = path.join(__dirname, '..', 'client');
const UPLOAD_DIR = path.join(__dirname, 'uploads');
const MAX_FILES = 10;

// Upload-Verzeichnis anlegen
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
}

// Multer für Datei-Uploads konfigurieren
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Express-App einrichten
const app = express();
app.use(express.static(STATIC_DIR));
app.get('/', (req, res) => res.sendFile(path.join(STATIC_DIR, 'index.html')));

// HTTP- und WebSocket-Server
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Synchronisierte Daten
let currentValue = '';
let fileList = [];

// Datei-Liste aktualisieren und ältere löschen
function updateFileList() {
  fileList = fs.readdirSync(UPLOAD_DIR)
    .map(name => ({ name, time: fs.statSync(path.join(UPLOAD_DIR, name)).mtimeMs }))
    .sort((a, b) => b.time - a.time)
    .map(f => ({ name: f.name }));

  while (fileList.length > MAX_FILES) {
    const oldest = fileList.pop();
    fs.unlinkSync(path.join(UPLOAD_DIR, oldest.name));
  }
}

// Upload-Endpoint
app.post('/upload', upload.single('file'), (req, res) => {
  updateFileList();
  // WebSocket-Broadcast Datei-Liste
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'file-list', files: fileList }));
    }
  });
  res.json({ success: true });
});

// Dateien abrufen
app.get('/files', (req, res) => {
  updateFileList();
  res.json(fileList);
});

// Datei-Download
app.get('/files/:filename', (req, res) => {
  res.download(path.join(UPLOAD_DIR, req.params.filename));
});

// WebSocket-Verbindungen
wss.on('connection', ws => {
  ws.send(currentValue);
  updateFileList();
  ws.send(JSON.stringify({ type: 'file-list', files: fileList }));

  ws.on('message', msg => {
    currentValue = msg.toString();
    // Text-Broadcast
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(currentValue);
      }
    });
  });
});

// Server starten
server.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`));