.PHONY: install dev build lint test stylelint smoke format ci clean

install:
	npm ci

dev:
	npm run dev

build:
	npm run build

lint:
	npx eslint .

test:
	npm test

stylelint:
	npm run stylelint

format:
	npx prettier --check .

smoke:
	npm run smoke:build

ci: lint test stylelint format build smoke

clean:
	rm -rf node_modules dist
