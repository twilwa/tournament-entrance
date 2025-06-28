# Makefile for launch compatibility
.PHONY: setup teardown

setup:
	@echo "Setting up project..."
  # TODO: Add install command here
	# @npm install || bun install || yarn install
	@echo "Setup complete!"

teardown:
	@echo "Tearing down project..."
  # TODO: Add teardown command here
	# @rm -rf node_modules
	@echo "Teardown complete!"
