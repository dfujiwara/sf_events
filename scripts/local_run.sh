#! /usr/bin/env bash
echo 'Submitting sample json'

cd $(dirname "$0")
curl -d "@sample_pubsub_payload.json" \
    -X POST \
    -H "Ce-Type: true" \
    -H "Ce-Specversion: true" \
    -H "Ce-Source: true" \
    -H "Ce-Id: true" \
    -H "Content-Type: application/json" \
    http://localhost:8080
