FROM python:3.13-slim

RUN apt-get update && \
    apt-get install -y --no-install-recommends ca-certificates && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .

RUN pip install --prefer-binary --no-cache-dir --break-system-packages --root-user-action ignore -r requirements.txt

COPY app/ .

CMD update-ca-certificates && hypercorn app:app --bind "0.0.0.0:8000"
