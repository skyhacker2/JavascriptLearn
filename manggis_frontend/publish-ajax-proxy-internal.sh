#!/bin/sh
ssh root@192.168.10.64 "cd /var/war/controller; mkdir -p static/js/lib/rfl"
scp -r ../manggis_web/src/main/webapp/cdn-internal/static/js/lib/rfl/ajax-proxy.html root@192.168.10.64:/var/war/controller/static/js/lib/rfl/ajax-proxy.html