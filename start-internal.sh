#!/bin/bash

cd /home/stream
acestreamengine --client-console --bind-all --live-buffer 10 --cache-limit 2 --cache-dir /tmp --port 28080 --api-port 18082 --max-connections=400 --max-peers=100 > ace.log 2> ace.log &
node start
