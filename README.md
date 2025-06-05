# ShareIt

**ShareIt** is a Progressive Web App (PWA) that enables real-time text synchronization across all connected browser instances (tabs/clients). The application consists of two main components:

1. **Client** (`client/`):

   * Static assets (HTML, CSS, JavaScript, Manifest, Service Worker, Icons)
   * Renders a large text area, handles WebSocket communication, clipboard functions, and connection status indicator

2. **Server** (`server/`):

   * Node.js Express server serving static files and providing a WebSocket endpoint
   * Maintains the current text value in a variable and broadcasts changes to all connected clients

Using Docker Compose, the entire project can be easily run in a containerized environment.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Directory Structure](#directory-structure)
3. [Prerequisites](#prerequisites)
4. [Installation and Local Usage (without Docker)](#installation-and-local-usage-without-docker)
5. [Running with Docker Compose](#running-with-docker-compose)
6. [PWA Features](#pwa-features)
7. [License](#license)

---

## Project Overview

ShareIt provides bi-directional real-time synchronization of text among multiple clients through a single large text area:

* **Text Area**: A `<textarea>` element in the browser where users can type or paste text.
* **WebSocket Communication**: Whenever a user clicks the �Send� button (or uses the clipboard button), the text is sent to the server over a WebSocket connection.
* **Broadcast**: The server saves the new text and immediately broadcasts it to all currently connected clients.
* **Connection Status Indicator**: A colored circle (green/red) indicates if the WebSocket connection is active. If the connection is lost, the client automatically attempts to reconnect every 2 seconds.
* **Clipboard Functions**:

  * �Send Clipboard� Button: Reads text directly from the system clipboard and sends it to the server (without updating the local text area; the broadcast from the server will update all text areas).
  * �Copy� Button: Copies the current text from the text area to the system clipboard.

Additionally, ShareIt is configured as a PWA so that, when served over HTTPS, it can be installed by browsers to run as a standalone app without typical browser chrome.

---

## Directory Structure

```
shareIt/
+-- client/                     # All static PWA assets
|   +-- index.html               # Main HTML file
|   +-- main.js                  # Client-side logic (WebSocket, buttons, connection status)
|   +-- styles.css               # Optional external CSS (can also be inline in index.html)
|   +-- manifest.json            # PWA manifest (app name, icons, display mode)
|   +-- service-worker.js        # Minimal Service Worker for PWA installation
|   +-- favicon.ico              # Favicon (optional, avoids 404 errors)
|   +-- icons/                   
|       +-- icon-192.png         # PWA icon (192�192)
|       +-- icon-512.png         # PWA icon (512�512)
|
+-- server/                     # Node.js server code
|   +-- server.js                # Express + WebSocket logic
|   +-- package.json             # Dependencies (express, ws)
|   +-- package-lock.json        # npm lockfile
|
+-- Dockerfile                  # Instructions to build the Docker image
+-- docker-compose.yml          # Docker Compose configuration
+-- .dockerignore               # Excludes unnecessary files from the Docker build
```

---

## Prerequisites

* **Git** (for cloning the repository)
* **Node.js = 18** (only required if you want to run without Docker)
* **npm** (for local installation)
* **Docker = 20.x** and **Docker Compose = 1.29.x** (for containerized deployment)

---

## Installation and Local Usage (without Docker)

If you want to run ShareIt locally with Node.js and npm, follow these steps:

1. Clone the repository:

   ```bash
   git clone https://github.com/zebrajaeger/shareIt.git
   cd shareIt
   ```

2. Install dependencies:

   ```bash
   cd server
   npm install
   ```

   This will create a `package-lock.json` in the `server/` folder (if it does not already exist).

3. Start the server:

   ```bash
   npm start
   ```

   By default, the server listens on port **3000**.

   * Open your browser to `http://localhost:3000/`
   * The page will load `client/index.html` and establish a WebSocket connection for text synchronization.

4. Optional: Live-reload during development:

   * If you have `nodemon` installed globally (`npm install -g nodemon`), you can run:

     ```bash
     nodemon server.js
     ```

     in the `server/` directory to automatically restart the server on code changes.
   * For client-side changes, you can optionally run BrowserSync:

     ```bash
     npx browser-sync start --proxy "localhost:3000" --files "client/**/*.*"
     ```

     This is only necessary if you want automatic page reloads when modifying client files.

---

## Running with Docker Compose

The recommended way to run ShareIt in an isolated environment is with Docker Compose. This eliminates the need to install Node.js and npm locally.

1. Clone the repository:

   ```bash
   git clone https://github.com/zebrajaeger/shareIt.git
   cd shareIt
   ```

2. Build the Docker image:

   ```bash
   docker-compose build
   ```

   This command reads the `Dockerfile` in the project root, installs npm dependencies inside the container, and copies both server and client files into the image.

3. Start the container in detached mode:

   ```bash
   docker-compose up -d
   ```

   * Docker Compose will create and run a container named `text-sync-container` based on the `text-sync-app:latest` image.
   * The container runs the Node.js server, listening on port 3000 inside the container.

4. Open ShareIt in your browser:

   ```
   http://localhost:3000/
   ```

   � You should see the PWA page with the large text area, connection status indicator, and buttons.

   * To test synchronization, open the same URL in two browser tabs and type text in one tab � it should appear in both.

5. View container logs:

   ```bash
   docker-compose logs -f
   ```

   This shows server output and WebSocket connection messages.

6. Stop and remove the container:

   ```bash
   docker-compose down
   ```

   The `restart: unless-stopped` setting ensures the container restarts on failure unless you manually stop it.

---

## PWA Features

ShareIt is set up as a PWA so that it behaves like a native app:

1. **Manifest**

   * The file `client/manifest.json` includes:

     * `name`, `short_name`, `start_url`, `display: "standalone"`, `background_color`, `theme_color`, and paths to icons (`icons/icon-192.png` & `icons/icon-512.png`).
   * This informs browsers to offer an �Install� option.

2. **Service Worker**

   * `client/service-worker.js` is a minimal Service Worker that includes `install` and `activate` events.
   * Once registered by the browser, the app can be installed and later opened in a standalone window without browser UI.

3. **Icons**

   * Place `client/icons/icon-192.png` (192�192) and `client/icons/icon-512.png` (512�512) in the `icons/` folder.
   * These images are used in the installation dialog and as the homescreen/desktop icon.

4. **Local Installation (Development)**

   * Start the server (locally or via Docker).
   * Open `http://localhost:3000/` in Chrome/Edge: You should see an �Install� icon (? or ?) in the address bar.
   * Click it and follow the prompts to install the app.
   * The app will open in a standalone window, omitting the typical browser address bar.

---

## License

ShareIt is released under the MIT License. See the [LICENSE](LICENSE) file for more details.

---

**Repository:**
[https://github.com/zebrajaeger/shareIt](https://github.com/zebrajaeger/shareIt)

Enjoy using ShareIt! Contributions, issues, and pull requests are welcome. If you encounter any problems or have questions, please open an issue in the GitHub repository.
