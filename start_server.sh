#!/usr/bin/bash 

cd server
pkill -f "studio.app"

pip install -r requirements.txt
nohup python -m studio.app &
tail nohup.out