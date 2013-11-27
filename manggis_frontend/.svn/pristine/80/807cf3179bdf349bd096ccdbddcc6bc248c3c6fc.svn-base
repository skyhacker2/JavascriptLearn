#!/bin/sh
serverLogin="root@192.168.10.61"
serverBasePath="/var/www/manggis.internal/static"
clientBasePath="../manggis_web/src/main/webapp/cdn-internal/static"

if [ -d "${clientBasePath}/$1" ]; then
	scp -r ${clientBasePath}/$1/* ${serverLogin}:${serverBasePath}/$1
elif [ -f "${clientBasePath}/$1" ]; then
	scp -r ${clientBasePath}/$1 ${serverLogin}:${serverBasePath}/$1
else
	echo "No such file or directory!"
fi