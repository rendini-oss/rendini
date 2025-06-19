.DEFAULT_GOAL:=all

all: install

.PHONY: install
install:
	@echo "Installing Rendini..."
	@tilt ci
	@echo "Successfully installed Rendini."

.PHONY: ci
ci: install
.PHONY: i
i: install

.PHONY: start
start:
	@echo "Starting Rendini..."
	@tilt up
	@echo "Successfully ran Rendini."

.PHONY: dev
dev: start
.PHONY: serve
serve: start
.PHONY: up
up: start
