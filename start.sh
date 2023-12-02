#!/usr/bin/env bash
function cleanup {
    echo "Killing $1 $2"

    kill $1 $2
}

cd client
npm run build && npm run start &
CLIENT_SERVER=$!

cd ../server
FLASK_APP=studio.app.py flask run &
API_SERVER=$!

# kill proceses on exit
trap "cleanup $CLIENT_SERVER $API_SERVER" EXIT

wait $CLIENT_SERVER $API_SERVER

