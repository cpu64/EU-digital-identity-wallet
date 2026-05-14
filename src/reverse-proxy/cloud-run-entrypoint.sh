#!/bin/sh
set -e
# Remove all local-only configs and use only the cloud run conf
rm -f /etc/nginx/conf.d/dns.conf
cp /etc/nginx/conf.d/cloud-run-nginx.conf /etc/nginx/conf.d/default.conf
rm -f /etc/nginx/conf.d/cloud-run-nginx.conf
nginx -t
exec nginx -g 'daemon off;'
