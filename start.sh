#!/usr/bin/env bash
function cleanup {
    echo "Exiting..."

    kill $1 $2
}

cd client
npm run dev &
CLIENT_SERVER=$!

cd ../server
FLASK_APP=studio.app.py flask run -h 0.0.0.0 &
API_SERVER=$!

# kill proceses on exit
trap "cleanup $CLIENT_SERVER $API_SERVER" EXIT

wait $CLIENT_SERVER $API_SERVER

