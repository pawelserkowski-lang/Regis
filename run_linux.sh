#!/bin/bash
# Skrypt startowy dla CyberDeck Protocol

# Ustal katalog, w którym znajduje się skrypt
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Przejdź do katalogu aplikacji
cd "$DIR/cyber-deck-protocol"

# Uruchom tryb deweloperski
echo "Startowanie CyberDeck Protocol..."
npm run dev
