# INSTALL REQUIRED PACKAGES
sudo apt-get install -y libudev-dev &&

# MAIN APP INSTALLATION
npm i &&
npm run build &&
sudo mkdir /opt/solar-energy
sudo cp -rf dist/linux-armv7l-unpacked/** /opt/solar-energy/

# MAIN APP AUTOSTART
echo '/opt/solar-energy/solar-energy-ui' > ~/.xinitrc
chmod +x ~/.xinitrc

#while read p; do sudo systemctl disable "$p"; done < unused-packages.list

reboot
