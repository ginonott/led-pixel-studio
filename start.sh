#!/usr/bin/env bash
function cleanup {
    echo "Cleaning up..."

    for pid in $(ps -ef | grep "next" | awk '{print $2}'); do kill -9 $pid; done
    for pid in $(ps -ef | grep "flask" | awk '{print $2}'); do kill -9 $pid; done
}

# clean up any previous instances
cleanup

# start the server first so we can start asap
cd server
pip install -r requirements.txt
FLASK_APP=studio.app.py flask run -h 0.0.0.0 &
API_SERVER=$!

cd ../client
npm i
npm run dev &
CLIENT_SERVER=$!

# kill proceses on exit
trap "cleanup $CLIENT_SERVER $API_SERVER" EXIT

wait $CLIENT_SERVER $API_SERVER

