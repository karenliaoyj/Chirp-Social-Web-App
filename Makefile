GIT_SHORT_HASH := git-$(shell git rev-parse --short=10 HEAD)
DEPLOY_DOCKER_REGISTRY := chirpcmuwebapp
DEPLOY_DOCKER_TAG := $(GIT_SHORT_HASH)


.PHONY: test
test:
	@make -C webserver maven-test


.PHONY: build
build:
	@make -C webserver maven-build


.PHONY: docker-build
docker-build:
	docker build \
		--tag $(DEPLOY_DOCKER_REGISTRY)/$(MODULE):$(DEPLOY_DOCKER_TAG) \
		-f Dockerfile.$(MODULE) \
		.


.PHONY: docker-push
docker-push:
	docker push $(DEPLOY_DOCKER_REGISTRY)/$(MODULE):$(DEPLOY_DOCKER_TAG)