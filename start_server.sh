#!/usr/bin/bash 

cd server
sudo -E pkill -f "studio.app"

sudo -E pip install -r requirements.txt
sudo -E nohup python -m studio.app &
tail nohup.out