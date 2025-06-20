#!/bin/bash
# GraphQL API test script for Rendini

echo "Testing Rendini Vue Render API..."

echo -e "\nQuery 0: Rendering GraphiQL"
curl -s -X GET "http://localhost:3000/graphiql"

echo -e "\n\nQuery 1: Rendering default template:"
curl -s -X POST "http://localhost:3000/graphql" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { render(path: \"/default\") { content contentType metadata } }"
  }' | jq '.'

echo -e "\n\nQuery 2: Getting render map:"
curl -s -X POST "http://localhost:3000/graphql" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { renderMap { path priority changeFrequency lastModified } }"
  }' | jq '.'

echo -e "\n\nQuery 3: Rendering with context parameters:"
curl -s -X POST "http://localhost:3000/graphql" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { render(path: \"/default\", context: { device: \"mobile\", locale: \"en-US\", preview: true }) { contentType metadata } }"
  }' | jq '.'

echo -e "\n"
