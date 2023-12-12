.SILENT:

APP_ROOT := $(abspath $(patsubst %/,%,$(dir $(abspath $(lastword $(MAKEFILE_LIST))))))

include vendor/sigwin/infra/resources/YASSG/default.mk

build/docker:
	docker compose run webpack npm ci
	docker compose run webpack npx encore production
	docker compose run --env IMGPROXY_URL=http://imgproxy:8080 app vendor/sigwin/yassg/bin/yassg yassg:generate --env prod "$(BASE_URL)"

vendor/sigwin/infra/resources/YASSG/default.mk:
	mv composer.json composer.json~ && rm -f composer.lock
	docker run --rm --user '$(shell id -u):$(shell id -g)' --volume '$(shell pwd):/app' --workdir /app composer:2 require sigwin/infra
	mv composer.json~ composer.json && rm -f composer.lock
