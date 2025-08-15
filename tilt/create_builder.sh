#!/bin/sh

set -e

builder_name="${1:-buildx-builder}"

echo "Creating Rendini builder..."

# Check if the builder already exists
if docker buildx inspect "${builder_name}" >/dev/null 2>&1; then
  echo "Builder '${builder_name}' already exists. Using existing builder."
  docker buildx use "${builder_name}"
elif docker buildx create --name "${builder_name}" --use >/dev/null 2>&1; then
  echo "Builder '${builder_name}' created and set as active."
fi

echo "Successfully created Rendini builder."
