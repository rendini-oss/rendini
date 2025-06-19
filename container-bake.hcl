variable "NODE_TAG" {
    type    = string
    default = "24.2.0-bookworm-slim@sha256:b30c143a092c7dced8e17ad67a8783c03234d4844ee84c39090c9780491aaf89"
}

target "nunjucks-renderer" {
    args = {
        IMAGE_ID = "docker.io/library/node:${NODE_TAG}"
    }
    context = "./renderers/node/nunjucks"
    dockerfile = "./containerfile"
    tags = ["localhost/rendini/nunjucks-renderer:latest"]
}

group "default" {
    targets = ["nunjucks-renderer"]
}
