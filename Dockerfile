# === 1. Basis-Image: Node 18 (Alpine) ===
FROM node:18-alpine

# === 2. Arbeitsverzeichnis im Container ===
WORKDIR /usr/src/app

# === 3. Copy package.json und package-lock.json aus server/ ===
#     damit Docker die „npm install“-Schritte cachen kann
COPY server/package.json server/package-lock.json ./server/

# === 4. In server/-Verzeichnis wechseln und Abhängigkeiten installieren ===
WORKDIR /usr/src/app/server
RUN npm install --production

# === 5. Server-Code kopieren ===
#     (server.js und alle anderen Dateien aus server/)
COPY server/ ./

# === 6. Client-Code kopieren ===
WORKDIR /usr/src/app
COPY client/ ./client/

# === 7. Expose Port 3000 (server.js lauscht darauf) ===
EXPOSE 3000

# === 8. Startbefehl: Node-Server starten ===
WORKDIR /usr/src/app/server
CMD ["npm", "start"]
