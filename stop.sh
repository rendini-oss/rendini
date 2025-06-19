#!/bin/sh

set -e

main() {
  echo "Stopping Rendini..."

  echo "Searching for running Rendini containers..."
  stopped_container_count=0
  docker ps --filter "name=rendini" --format "{{.ID}}" | while read -r container_id; do
    if [ -n "$container_id" ]; then
      stopped_container_count=$((stopped_container_count + 1))
      echo "Found Rendini container: $container_id"
      docker stop "$container_id"
    fi
  done

  if [ $stopped_container_count -eq 0 ]; then
    echo "No running Rendini containers found."
  else
    echo "$stopped_container_count Rendini container(s) stopped."
  fi

  echo "Successfully stopped Rendini."
}

main
