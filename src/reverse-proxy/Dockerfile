FROM nginx:alpine

COPY dns.conf /etc/nginx/conf.d/
COPY cloud-run-nginx.conf /etc/nginx/conf.d/cloud-run-nginx.conf
COPY cloud-run-entrypoint.sh /
COPY index.html /usr/share/nginx/html/index.html
