#!/bin/bash

set -e

cd ~/solar-energy-ui
git pull
npm run build
reboot
