#!/usr/bin/bash 

cd server
sudo -E sh -c "pkill -f 'studio.app'"

sudo -E sh -c "pip install -r requirements.txt"
sudo -E sh -c "nohup python -m studio.app &"
tail nohup.out