set -e
# MAIN APP INSTALLATION
npm i
npm run build

# MAIN APP AUTOSTART
echo '/home/pi/solar-energy-ui/dist/linux-armv7l-unpacked/solar-energy-ui' > ~/.xinitrc
chmod +x ~/.xinitrc
