#!/bin/bash
# GraphQL API test script for Rendini

echo "Testing Rendini Mashup GraphQL API..."

echo -e "\nQuery 0: Rendering GraphiQL"
curl -s -X GET "http://localhost:3000/graphiql" | head -20
