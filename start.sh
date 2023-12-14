#!/usr/bin/env bash

# start the server first so we can start asap
cd server
pkill -f "flask"

pip install -r requirements.txt
FLASK_APP=studio.app.py nohup flask run -h 0.0.0.0 &

cd ../client
pkill -f "next dev"
npm i
nohup npm run dev &

cd ../

# preload the home page
curl 0.0.0.0:3000 &

# tail the client and server logs
tail client/nohup.out server/nohup.out