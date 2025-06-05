// server.js

const path = require('path');
const express = require('express');
const http = require('http');
const WebSocket = require('ws');

// === Variablen definieren ===
const PORT = 3000;                             // Port, auf dem der Server l�uft
const STATIC_DIR = path.join(__dirname, '..', 'client');

// === Express-App einrichten ===
const app = express();

// Statische Dateien ausliefern (HTML, JS, CSS, ...)
app.use(express.static(STATIC_DIR));

// index.html als Root ausliefern
app.get('/', (req, res) => {
  res.sendFile(path.join(STATIC_DIR, 'index.html'));
});

// === HTTP-Server erstellen ===
const server = http.createServer(app);

// === WebSocket-Server auf demselben Port ===
const wss = new WebSocket.Server({ server });

// Aktueller Datenwert (Text), der zwischen allen Clients synchronisiert wird
let currentValue = '';

// Bei neuer WebSocket-Verbindung
wss.on('connection', (ws) => {
  // 1. Neuer Client verbindet sich ? sendet aktuellen Wert
  ws.send(currentValue);

  // 2. Wenn der Client eine Nachricht sendet, �berschreiben wir den currentValue
  ws.on('message', (message) => {
    currentValue = message.toString();

    // 3. Broadcast: neuen Wert an alle verbundenen Clients senden
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(currentValue);
      }
    });
  });
});

// === Server starten ===
server.listen(PORT, () => {
  console.log(`Server l�uft auf Port ${PORT}`);
});
