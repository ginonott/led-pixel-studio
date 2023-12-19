#!/usr/bin/bash 

cd server
sudo pkill -f "studio.app"

sudo pip install -r requirements.txt
sudo nohup python -m studio.app &
tail nohup.out