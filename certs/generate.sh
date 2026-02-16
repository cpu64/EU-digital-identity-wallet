#!/bin/bash

ROOT_CA_KEY="root-ca.key"
ROOT_CA_CRT="root-ca.crt"
ROOT_CA_SRL="root-ca.srl"
WILDCARD_KEY="wildcard.test.key"
WILDCARD_CRT="wildcard.test.crt"
WILDCARD_CSR="wildcard.test.csr"
ROOT_CA_CNF="root-ca.cnf"
WILDCARD_CNF="wildcard.test.cnf"

echo "Generating root CA key..."
openssl genrsa -out $ROOT_CA_KEY 4096

echo "Creating root CA certificate..."
openssl req -x509 -new -nodes -key $ROOT_CA_KEY -out $ROOT_CA_CRT -sha256 -days 150 -config $ROOT_CA_CNF

echo "Generating wildcard certificate CSR..."
openssl genrsa -out $WILDCARD_KEY 2048
openssl req -new -key $WILDCARD_KEY -out $WILDCARD_CSR -config $WILDCARD_CNF

echo "Signing wildcard certificate with root CA..."
openssl x509 -req -in $WILDCARD_CSR -CA $ROOT_CA_CRT -CAkey $ROOT_CA_KEY -CAcreateserial -out $WILDCARD_CRT -days 825 -sha256 -extensions v3_req -extfile $WILDCARD_CNF

echo "Deleting sensitive/unnecessary files..."
rm -f $ROOT_CA_KEY $ROOT_CA_SRL $WILDCARD_CSR

echo "Certificate generation completed successfully!"
