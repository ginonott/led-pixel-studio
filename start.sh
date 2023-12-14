#!/usr/bin/env bash

# start the server first so we can start asap
cd server
pkill -f "flask"

pip install -r requirements.txt
nohup python -m studio.app &

cd ../client
pkill -f "next dev"
npm i
nohup npm run dev &

cd ../

# give npm time to install and start
sleep 30

# preload the home page
# redirect output to devnull
curl 0.0.0.0:3000 > /dev/null &
curl 0.0.0.0:3000/8/editor > /dev/null &

# tail the client and server logs
tail client/nohup.out server/nohup.out