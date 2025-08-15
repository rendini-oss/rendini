# SPDX-License-Identifier: Apache-2.0
# Copyright (c) 2025 Rendini Labs.

# The path used for the buildx cache (from and to).
variable "BUILDKIT_CACHE_DIR" {
    type    = string
    default = "./.buildx/"
}

# The tag for the Node.js base image.
variable "NODE_TAG" {
    type    = string
    default = "24.2.0-bookworm-slim@sha256:b30c143a092c7dced8e17ad67a8783c03234d4844ee84c39090c9780491aaf89"
}

# Base image for Node.js containers.
target "node-base" {
    args = {
        IMAGE_ID = "docker.io/library/node:${NODE_TAG}"
    }
    cache-from = ["type=local,src=${BUILDKIT_CACHE_DIR}/node-base/latest"]
    cache-to = ["type=local,dest=${BUILDKIT_CACHE_DIR}/node-base/latest"]
    context = "./containers/node/base"
    dockerfile = "./containerfile"
    tags = ["localhost/rendini/node:latest"]
}

# This target builds the Rendini Mashup container.
target "mashup" {
    cache-from = ["type=local,src=${BUILDKIT_CACHE_DIR}/mashup/latest"]
    cache-to = ["type=local,dest=${BUILDKIT_CACHE_DIR}/mashup/latest"]
    context = "./mashup"
    contexts = {
      base = "target:node-base"
    }
    dockerfile = "./containerfile"
    tags = ["localhost/rendini/mashup:latest"]
}

# This target builds the Rendini Nunjucks rendering container.
target "render-nunjucks" {
    cache-from = ["type=local,src=${BUILDKIT_CACHE_DIR}/render-nunjucks/latest"]
    cache-to = ["type=local,dest=${BUILDKIT_CACHE_DIR}/render-nunjucks/latest"]
    context = "./renders/node/nunjucks"
    contexts = {
      base = "target:node-base"
    }
    dockerfile = "./containerfile"
    tags = ["localhost/rendini/render-nunjucks:latest"]
}

# This target builds the Rendini Vue rendering container.
target "render-vue" {
    cache-from = ["type=local,src=${BUILDKIT_CACHE_DIR}/render-vue/latest"]
    cache-to = ["type=local,dest=${BUILDKIT_CACHE_DIR}/render-vue/latest"]
    context = "./renders/node/vue"
    contexts = {
      base = "target:node-base"
    }
    dockerfile = "./containerfile"
    tags = ["localhost/rendini/render-vue:latest"]
}

# This target builds all of the Rendini containers.
group "default" {
    targets = ["node-base","mashup","render-nunjucks","render-vue"]
}
