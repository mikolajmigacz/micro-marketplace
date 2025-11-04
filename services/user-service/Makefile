.PHONY: help install build test test-watch test-cov lint lint-check format clean

help:
	@echo "User Service - Available Commands"
	@echo "=================================="
	@echo "make install      - Install dependencies"
	@echo "make build        - Build project"
	@echo "make test         - Run tests"
	@echo "make test-watch   - Run tests in watch mode"
	@echo "make test-cov     - Run tests with coverage"
	@echo "make test-ci      - Run tests in CI mode"
	@echo "make lint         - Lint and fix code"
	@echo "make lint-check   - Check linting (without fix)"
	@echo "make format       - Format code with Prettier"
	@echo "make clean        - Clean dist and coverage"

install:
	pnpm install

build: install
	npm run build

test: install
	npm test

test-watch: install
	npm run test:watch

test-cov: install
	npm run test:cov

test-ci: install
	npm test -- --coverage --ci

lint: install
	npm run lint

lint-check: install
	npm run lint:check

format: install
	npm run format

clean:
	rm -rf dist coverage node_modules
