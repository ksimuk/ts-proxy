# DOCKER-VERSION 0.7.1
FROM ubuntu:12.04
MAINTAINER Maximka "maxim.kraev@gmail.com"

# fix deps for node
RUN echo "deb http://archive.ubuntu.com/ubuntu precise universe" > /etc/apt/sources.list.d/universe.list

# Base software install
RUN apt-get -y update
RUN apt-get -y install python-software-properties wget

RUN apt-add-repository -y ppa:videolan/stable-daily
RUN apt-add-repository -y ppa:chris-lea/node.js
RUN echo "deb http://repo.acestream.org/ubuntu/ precise main" > /etc/apt/sources.list.d/acestream.list
RUN wget -O - http://repo.acestream.org/keys/acestream.public.key | apt-key add -
RUN apt-get -y update
RUN apt-get -y install acestream-engine nodejs vlc

#add user
RUN adduser stream --disabled-password

# Ports
#       web  video torrent
EXPOSE 18080 18081 28081
ENV HOME /home/stream

