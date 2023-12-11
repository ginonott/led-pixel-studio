#!/usr/bin/env bash

# start the server first so we can start asap
cd server
kill `cat server.pid`

pip install -r requirements.txt
nohup FLASK_APP=studio.app.py flask run -h 0.0.0.0 --reload &
echo $! > server.pid

cd ../client
kill `cat client.pid`
npm i
nohup npm run dev &
echo $! > client.pid