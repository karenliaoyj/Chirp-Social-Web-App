## Pipeline status
[![pipeline status](https://gitlab.com/chirp.cmu.webapp/s23_team_24/badges/main/pipeline.svg)](https://gitlab.com/chirp.cmu.webapp/s23_team_24/-/commits/main)


## Prerequisites
- Docker, version 20.10.23
- Docker Compose, version v2.15.1
- Maven, version 3.8.7
- Java SDK, version 17.0.3.1
- Yarn, version 1.22.9
- Node, version v12.13.0

## Quick Start
```sh
docker-compose up
```

- visit `localhost:8080`


### Test
```sh
make test
```

### Build
```sh
make build
```

### React Web Client
See [webapp setup guide](./webapp/README.md)


## GitLab CI
- ssh key setup
    - visit `gitlab.com` and login with `chirp.cmu.webapp`
    - go to account -> preference -> SSH Keys
    - add the ssh public key to the repo

- add remote branch `gitlab`
```sh
git remote add gitlab git@gitlab.com:chirp.cmu.webapp/s23_team_24.git
```

- push the code to branch `gitlab` to trigger GitLab CI
    - normally, we can automate the process with `GitHub Webhook`, but the `settings` is disabled in the `s23_team_24` repo on GitHub


## Container Registry
- we're pushing images to `Docker Hub`, https://hub.docker.com/
    - login with `chirpcmuwebapp` to see the repositories

- we can manually `build` the image with `make` command
    - pass the `MODULE` parameter to specify which image to build
```sh
make docker-build MODULE=
```

- we can manually `push` the image with `make` command
    - pass the `MODULE` parameter to specify which image to build
```sh
make docker-push MODULE=
```


## Structures
```
- s23_team_24/    <- project root directory
  - webserver/    <- backend Spring Boot project
  - webapp/       <- frontend React.js project
```