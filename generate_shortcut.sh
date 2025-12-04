#!/bin/bash
# Skrypt do generowania skrótu .desktop dla bieżącej instalacji

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
EXECUTABLE_PATH="$DIR/run_linux.sh"

# Sprawdzenie czy ikona istnieje (używamy standardowej, jeśli nie znajdziemy specyficznej)
ICON="utilities-terminal"

# Tworzenie pliku .desktop
cat > "$DIR/CyberDeck.desktop" << EOL
[Desktop Entry]
Version=1.0
Type=Application
Name=CyberDeck Protocol
Comment=Markdown Protocol Editor & Agent Interface
Exec="$EXECUTABLE_PATH"
Icon=$ICON
Terminal=true
Categories=Development;Office;
Path=$DIR
EOL

chmod +x "$DIR/CyberDeck.desktop"

echo "========================================================"
echo " Utworzono plik skrótu: CyberDeck.desktop"
echo " Ścieżka wykonywalna: $EXECUTABLE_PATH"
echo "========================================================"
echo "Możesz skopiować ten plik na Pulpit lub do ~/.local/share/applications/"
echo "Przykład: cp CyberDeck.desktop ~/Desktop/"
