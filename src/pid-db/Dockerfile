FROM postgres:18-alpine

COPY init.sql /docker-entrypoint-initdb.d/10-init.sql
RUN echo "CREATE DATABASE walletdb; CREATE DATABASE cadb;" > /docker-entrypoint-initdb.d/20-createdbs.sql
