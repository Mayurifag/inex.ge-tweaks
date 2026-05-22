.PHONY: install dev build lint test stylelint smoke format formatting ci clean

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
	npm run formatting

formatting:
	npm run formatting

smoke:
	npm run smoke:build

ci: lint test stylelint formatting smoke

clean:
	rm -rf node_modules dist
