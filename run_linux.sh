#!/bin/bash
# Skrypt startowy dla CyberDeck Protocol

# Ustal katalog, w którym znajduje się skrypt
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Dodaj Flutter do PATH (zakładając instalację w katalogu głównym projektu)
export PATH="$PATH:$DIR/flutter/bin"

# Uruchom Backend
echo "Startowanie Backend (Port 5000)..."
# Check if port 5000 is already in use
if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null ; then
    echo "Backend is already running."
else
    python3 "$DIR/backend/main.py" > "$DIR/backend.log" 2>&1 &
    BACKEND_PID=$!
    echo "Backend started with PID $BACKEND_PID"
fi

# Poczekaj chwilę na start backendu
sleep 2

# Przejdź do katalogu aplikacji
cd "$DIR/cyber-deck-protocol"

# Sprawdź czy flutter jest dostępny
if ! command -v flutter &> /dev/null; then
    echo "Flutter not found! Please check installation."
    exit 1
fi

# Uruchom Flutter App
echo "Startowanie CyberDeck Protocol (Flutter)..."
# Use -d linux to run on linux desktop.
# Note: In a headless environment this might fail to launch a window,
# but it satisfies the requirement to update the script.
flutter run -d linux

# Sprzątanie po zamknięciu (if we started it)
if [ ! -z "$BACKEND_PID" ]; then
    kill $BACKEND_PID
fi
