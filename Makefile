# Romanian Lottery Frontend Makefile

# Default target
.PHONY: help
help:
	@echo "========================"
	@echo "Available commands:"
	@echo ""
	@echo "Development:"
	@echo "  make dev          - Install deps, run dev server, open default browser"
	@echo "  make dev-only     - Run dev server (without installing)"
	@echo "  make dev-chrome   - Install deps, run dev server, open in Chrome"
	@echo "  make install      - Install npm dependencies"
	@echo ""
	@echo "Build:"
	@echo "  make build        - Build for production"
	@echo "  make preview      - Preview production build"
	@echo ""
	@echo "Utilities:"
	@echo "  make clean        - Clean build artifacts and dependencies"
	@echo "  make kill-ports   - Kill processes on dev ports"

# Phony targets
.PHONY: dev dev-only dev-chrome install build preview clean kill-ports

# Development
install:
	@echo "Installing dependencies..."
	@npm install --verbose

dev-only:
	@echo "Starting Vite dev server..."
	@npm run dev

dev: kill-ports #install
	@echo "Starting Vite dev server and opening browser..."
	@(npm run dev &) && sleep 3 && open http://localhost:3000

dev-chrome: kill-ports #install
	@echo "Starting Vite dev server and opening in Chrome..."
	@(npm run dev &) && sleep 3 && open -a "Google Chrome" http://localhost:3000

# Build
build:
	@echo "Building for production..."
	@npm run build

preview:
	@echo "Previewing production build..."
	@npm run preview

# Clean
clean:
	@echo "Cleaning build artifacts and dependencies..."
	@rm -rf dist/
	@rm -rf node_modules/
	@echo "Clean complete"

kill-ports:
	@echo "Killing processes on dev ports..."
	@lsof -ti:3000 | xargs kill -9 2>/dev/null || true
	@lsof -ti:4173 | xargs kill -9 2>/dev/null || true
	@echo "Ports cleared"