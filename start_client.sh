#!/usr/bin/bash 

cd client
pkill -f "next dev"
npm i
nohup npm run dev &


# give npm time to install and start
sleep 30

# preload the home page
# redirect output to devnull
curl -s 0.0.0.0:3000 > /dev/null &
curl -s 0.0.0.0:3000/8/editor > /dev/null &