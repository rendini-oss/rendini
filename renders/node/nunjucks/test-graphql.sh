#!/bin/bash
# GraphQL API test script for Rendini

echo "Testing Rendini Nunjucks Render API..."

echo -e "\nGetting all render targets:"
curl -s -X POST "http://localhost:3000/graphql" \
  -H "Content-Type: application/json" \
  -d '{"query":"{ renderTargets { name template } }"}'

echo -e "\n\nRendering home template with data:"
curl -s -X POST "http://localhost:3000/graphql" \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation { render(name: \"home\", data: {title: \"Welcome to Rendini\", user: \"GraphQL User\"}) { name html } }"}'

echo -e "\n"
