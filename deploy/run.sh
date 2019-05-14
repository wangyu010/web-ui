#!/bin/bash

WEB_ADAPTER_BACKEND_HOST=${WEB_ADAPTER_BACKEND_HOST:-web-adapter}
WEB_SUGGEST_BACKEND_HOST=${WEB_SUGGEST_BACKEND_HOST:-economist}

cp deploy/nginx.conf /etc/nginx/nginx.conf
cp deploy/nginx.site.conf /etc/nginx/conf.d/site.conf

sed -i "s/{{WEB_ADAPTER_BACKEND_HOST}}/${WEB_ADAPTER_BACKEND_HOST}/g" /etc/nginx/conf.d/site.conf
sed -i "s/{{WEB_SUGGEST_BACKEND_HOST}}/${WEB_SUGGEST_BACKEND_HOST}/g" /etc/nginx/conf.d/site.conf

ulimit -n 65536
exec 2>&1
exec openresty -c /etc/nginx/nginx.conf
