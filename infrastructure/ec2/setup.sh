#!/usr/bin/env bash
set -euo pipefail

sudo apt-get update
sudo apt-get install -y nginx curl git
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2
echo "EC2 base setup completed."
