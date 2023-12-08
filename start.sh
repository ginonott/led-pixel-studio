#!/usr/bin/env bash
function cleanup {
    echo "Exiting..."

    kill $1 $2
}

# start the server first so we can start asap
cd server
FLASK_APP=studio.app.py flask run -h 0.0.0.0 &
API_SERVER=$!

cd ../client
npm run build
npm run start &
CLIENT_SERVER=$!

# kill proceses on exit
trap "cleanup $CLIENT_SERVER $API_SERVER" EXIT

wait $CLIENT_SERVER $API_SERVER

