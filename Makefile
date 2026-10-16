.PHONY: install dev build preview check test
install:
	npm ci
dev:
	npm run dev
build:
	npm run build
preview:
	npm run preview
check:
	npm run check
test:
	npm test
