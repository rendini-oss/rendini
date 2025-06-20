# SPDX-License-Identifier: Apache-2.0
# Copyright (c) 2025 Rendini Labs.

# This file is used by Docker BuildKit to define the build configuration for the Nunjucks render container.
variable "NODE_TAG" {
    type    = string
    default = "24.2.0-bookworm-slim@sha256:b30c143a092c7dced8e17ad67a8783c03234d4844ee84c39090c9780491aaf89"
}

# This target builds the Rendini Nunjucks renders container.
target "render-nunjucks" {
    args = {
        IMAGE_ID = "docker.io/library/node:${NODE_TAG}"
    }
    context = "./renders/node/nunjucks"
    dockerfile = "./containerfile"
    tags = ["localhost/rendini/render-nunjucks:latest"]
}

# This target builds all of the Rendini containers.
group "default" {
    targets = ["render-nunjucks"]
}
