# ⚡ ZenoFocus

**A minimal, native Pomodoro timer for Linux — built with Tauri + React**

[![Build](https://img.shields.io/github/actions/workflow/status/daniacosta-dev/zenofocus/release.yml?style=flat-square&label=build)](https://github.com/daniacosta-dev/zenofocus/actions)
[![License](https://img.shields.io/github/license/daniacosta-dev/zenofocus?style=flat-square)](LICENSE)
[![Version](https://img.shields.io/github/v/release/daniacosta-dev/zenofocus?style=flat-square)](https://github.com/daniacosta-dev/zenofocus/releases)
[![Platform](https://img.shields.io/badge/platform-Linux-orange?style=flat-square)](https://github.com/daniacosta-dev/zenofocus/releases)

![ZenoFocus Screenshot](docs/screenshot.png)

[🇬🇧 English](#english) · [🇪🇸 Español](#español)

</div>

---

## English

### Table of Contents
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Tech Stack](#tech-stack)
- [Contributing](#contributing)
- [Donate](#donate)
- [License](#license)

### Features

- **⏱ Pomodoro Timer** — Focus, short break, and long break modes with visual progress ring
- **📋 Task Management** — Create, edit, delete, and prioritize your daily tasks
- **📅 Agenda** — Visual timeline from 7am to 8pm with scheduled tasks and automatic reminders
- **📊 Stats** — Daily score, weekly history, and time breakdown by category
- **🪟 Floating Widget** — Always-on-top mini timer you can drag anywhere on screen
- **🔔 System Notifications** — Native GNOME notifications when sessions end
- **🖥 Tray Icon** — Quick access from your system tray
- **⚙️ Configurable** — Standard (25/5/15) or custom durations, autostart, sound
- **🌍 Bilingual** — Full Spanish and English support
- **💾 Persistent** — All tasks and settings saved to disk automatically

### Installation

#### Option 1 — .deb package (Ubuntu, Debian, Pop!_OS, Mint)

```bash
wget https://github.com/daniacosta-dev/zenofocus/releases/latest/download/zenofocus_amd64.deb
sudo dpkg -i zenofocus_amd64.deb
```

#### Option 2 — AppImage (any distro)

```bash
wget https://github.com/daniacosta-dev/zenofocus/releases/latest/download/zenofocus_amd64.AppImage
chmod +x zenofocus_amd64.AppImage
./zenofocus_amd64.AppImage
```

> **Note for GNOME users:** For the tray icon to appear, install the [AppIndicator extension](https://extensions.gnome.org/extension/615/appindicator-support/).

### Usage

1. **Add tasks** to your sidebar before starting
2. **Select a task** to set it as active
3. **Start the timer** — 25 minutes of focused work
4. **Take a break** when the session ends
5. **Repeat** — every 4 pomodoros take a long break
6. **Check Stats** to review your day

The floating **widget** can be opened from the tray icon menu and dragged anywhere on your screen.

### Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript |
| Desktop | Tauri v2 (Rust) |
| State | Zustand |
| Persistence | tauri-plugin-store |
| Notifications | notify-send (via Rust) |
| Build | Vite |

### Contributing

Contributions are welcome! Here's how to get started:

```bash
# Clone the repo
git clone https://github.com/daniacosta-dev/zenofocus.git
cd zenofocus

# Install dependencies
npm install

# Install Rust (if needed)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Linux system dependencies
sudo apt install -y libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf

# Run in development mode
npm run tauri dev
```

Please open an issue before submitting a large PR. Bug fixes and translations are always appreciated.

### Donate

If ZenoFocus helps you stay productive, consider supporting its development:

[![Ko-fi](https://img.shields.io/badge/Ko--fi-Support-ff5e5b?style=flat-square&logo=ko-fi)](https://ko-fi.com/daniacosta)
[![GitHub Sponsors](https://img.shields.io/badge/GitHub-Sponsor-ea4aaa?style=flat-square&logo=github)](https://github.com/sponsors/daniacosta-dev)

---

## Español

### Tabla de Contenidos
- [Características](#características)
- [Instalación](#instalación)
- [Uso](#uso)
- [Stack tecnológico](#stack-tecnológico)
- [Contribuir](#contribuir)
- [Donar](#donar)
- [Licencia](#licencia)

### Características

- **⏱ Timer Pomodoro** — Modos foco, descanso corto y largo con anillo de progreso visual
- **📋 Gestión de tareas** — Crea, edita, elimina y prioriza tus tareas del día
- **📅 Agenda** — Timeline visual de 7am a 8pm con tareas programadas y recordatorios automáticos
- **📊 Stats** — Score del día, historial semanal y tiempo por categoría
- **🪟 Widget flotante** — Mini timer siempre visible que puedes arrastrar por la pantalla
- **🔔 Notificaciones del sistema** — Notificaciones nativas de GNOME al terminar cada sesión
- **🖥 Tray icon** — Acceso rápido desde la bandeja del sistema
- **⚙️ Configurable** — Duración estándar (25/5/15) o personalizada, autostart, sonido
- **🌍 Bilingüe** — Soporte completo en español e inglés
- **💾 Persistente** — Todas las tareas y configuraciones se guardan automáticamente en disco

### Instalación

#### Opción 1 — Paquete .deb (Ubuntu, Debian, Pop!_OS, Mint)

```bash
wget https://github.com/daniacosta-dev/zenofocus/releases/latest/download/zenofocus_amd64.deb
sudo dpkg -i zenofocus_amd64.deb
```

#### Opción 2 — AppImage (cualquier distro)

```bash
wget https://github.com/daniacosta-dev/zenofocus/releases/latest/download/zenofocus_amd64.AppImage
chmod +x zenofocus_amd64.AppImage
./zenofocus_amd64.AppImage
```

> **Nota para usuarios de GNOME:** Para que aparezca el tray icon, instala la [extensión AppIndicator](https://extensions.gnome.org/extension/615/appindicator-support/).

### Uso

1. **Agrega tareas** a tu sidebar antes de iniciar
2. **Selecciona una tarea** para establecerla como activa
3. **Inicia el timer** — 25 minutos de trabajo enfocado
4. **Toma un descanso** cuando termine la sesión
5. **Repite el ciclo** — cada 4 pomodoros toma un descanso largo
6. **Revisa Stats** para ver tu progreso del día

El **widget flotante** se abre desde el menú del tray icon y puedes arrastrarlo a cualquier parte de la pantalla.

### Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React + TypeScript |
| Desktop | Tauri v2 (Rust) |
| Estado | Zustand |
| Persistencia | tauri-plugin-store |
| Notificaciones | notify-send (vía Rust) |
| Build | Vite |

### Contribuir

¡Las contribuciones son bienvenidas! Así puedes empezar:

```bash
# Clona el repositorio
git clone https://github.com/daniacosta-dev/zenofocus.git
cd zenofocus

# Instala dependencias
npm install

# Instala Rust (si es necesario)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Instala dependencias del sistema (Linux)
sudo apt install -y libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf

# Ejecuta en modo desarrollo
npm run tauri dev
```

Por favor abre un issue antes de enviar un PR grande. Los bugfixes y traducciones siempre son bienvenidos.

### Donar

Si ZenoFocus te ayuda a ser más productivo, considera apoyar su desarrollo:

[![Ko-fi](https://img.shields.io/badge/Ko--fi-Apoyar-ff5e5b?style=flat-square&logo=ko-fi)](https://ko-fi.com/daniacosta)
[![GitHub Sponsors](https://img.shields.io/badge/GitHub-Sponsor-ea4aaa?style=flat-square&logo=github)](https://github.com/sponsors/daniacosta-dev)

---

## License

MIT © [daniacosta-dev](https://github.com/daniacosta-dev)