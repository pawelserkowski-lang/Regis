# Developer Notes

This document provides technical details and instructions for developing the **Regis Agent** tools and the **Cyberdeck Protocol** application.

## Project Structure

The repository is organized into two main parts:

1.  **Root Directory**: Contains the "Regis" local agent scripts and status reporting tools.
2.  **`cyber-deck-protocol/`**: Contains the Electron-based React application acting as the UI/Interface.

### Directory Layout

```
.
├── regis.py                 # Main Python script for generating status reports
├── regis_cli.py             # CLI wrapper for Regis with logging
├── status_report.json       # The generated status report (output)
├── status_template.json     # JSON schema/template for reports
├── cyber-deck-protocol/     # Electron Application
│   ├── src/                 # React source code
│   ├── electron/            # Electron main process code
│   ├── package.json         # Dependencies and scripts
│   └── ...
└── ...
```

## Regis Agent (Root)

Regis is a local agent persona designed to manage and generate project status reports.

### Prerequisites

- Python 3.10+

### Usage

To generate a new status report based on the hardcoded logic in the script:

```bash
python regis.py
```

This will update `status_report.json`.

To run the CLI version with logging:

```bash
python regis_cli.py
```

Logs are written to `regis_debug.log`.

## Cyberdeck Protocol (Electron App)

The Cyberdeck is a modern interface built with Electron, React, Vite, and TailwindCSS.

### Prerequisites

- Node.js (v18+ recommended)
- npm

### Setup

Navigate to the project directory and install dependencies:

```bash
cd cyber-deck-protocol
npm install
```

### Development

To start the application in development mode (with hot reload):

```bash
npm run dev
```

This will launch the Vite dev server and the Electron window.

### Build

To build the application for production:

```bash
npm run build
```

The output artifacts will be located in `dist/` or `dist-electron/`.

## Status Report Format

The `status_report.json` follows the structure defined in `status_template.json`. It includes:
- **Status/Mode**: Current state of the project.
- **Progress**: Phase, steps, and ETA.
- **Thinking/Analysis**: AI reasoning logs.
- **Issues/Risk**: Detected problems and security risks.
- **Code/Tests**: Snippets and test results.

When modifying `regis.py`, ensure the output structure matches the template to maintain compatibility with any tools consuming this JSON.
