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

# Stop any and all docker containers with a name containing "rendini"
.PHONY: stop
stop:
	@./stop.sh

.PHONY: clean
clean: stop
	@echo "Cleaning Rendini..."
	@rm --recursive --force ./renderers/node/nunjucks/dist
	@echo "Successfully cleaned Rendini."

.PHONY: reset
reset: clean
	@echo "Resetting Rendini..."
	@rm --recursive --force ./renderers/node/nunjucks/node_modules
	@echo "Successfully reset Rendini."
