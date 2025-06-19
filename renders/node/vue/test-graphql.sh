#!/bin/bash
# GraphQL API test script for Rendini

echo "Testing Rendini Vue Render API..."

echo -e "\nGetting all render targets:"
curl -s -X GET "http://localhost:3000/api/render-targets" \
  -H "Content-Type: application/json"

echo -e "\n\nRendering default template with data:"
curl -s -X POST "http://localhost:3000/api/render" \
  -H "Content-Type: application/json" \
  -d '{"name":"default"}'

# echo -e "\nGetting all render targets:"
# curl -s -X POST "http://localhost:3000/graphql" \
#   -H "Content-Type: application/json" \
#   -d '{"query":"{ renderTargets { name template } }"}'

# echo -e "\n\nRendering home template with data:"
# curl -s -X POST "http://localhost:3000/graphql" \
#   -H "Content-Type: application/json" \
#   -d '{"query":"mutation { render(name: \"home\", data: {title: \"Welcome to Rendini\", user: \"GraphQL User\"}) { name html } }"}'

echo -e "\n"
