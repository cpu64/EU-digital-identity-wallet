FROM python:3.13-slim

RUN apt-get update && \
    apt-get install -y --no-install-recommends ca-certificates && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY app/app.py .

CMD update-ca-certificates && python app.py
