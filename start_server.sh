#!/usr/bin/bash 

# check if root
if [ "$EUID" -ne 0 ]
  then echo "Please run as root"
  exit
fi

cd server
pkill -f "studio.app"

pip install -r requirements.txt
nohup python -m studio.app &
tail nohup.out