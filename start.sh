#!/bin/bash

sudo docker run -u stream -v `pwd`:/home/stream:rw -rm=true -p 18080 -p 28080 -i -t ts-proxy /home/stream/start-internal.sh
