#!/bin/bash
# GraphQL API test script for Rendini

echo "Testing Rendini Nunjucks GraphQL API..."

echo -e "\nQuery 0: Rendering GraphiQL"
curl -s -X GET "http://localhost:3001/graphiql" | head -20

echo -e "\n\nQuery 1: Rendering home template:"
curl -s -X POST "http://localhost:3001/graphql" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { v1 { render(path: \"/home\", params: { user: \"GraphQL User\" }) { content contentType metadata } } }"
  }' | jq '.'

echo -e "\n\nQuery 2: Getting render map:"
curl -s -X POST "http://localhost:3001/graphql" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { v1 { renderMap { path priority changeFrequency lastModified } } }"
  }' | jq '.'

echo -e "\n\nQuery 3: Rendering with context parameters:"
curl -s -X POST "http://localhost:3001/graphql" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { v1 { render(path: \"/about\", context: { device: \"mobile\", locale: \"en-US\", preview: true }) { contentType metadata } } }"
  }' | jq '.'

echo -e "\n"
