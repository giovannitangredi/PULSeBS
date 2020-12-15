# PULSeBS

Pandemic University Lecture Seat Booking System SE2 Project

## Docker configuration

To run the app you must do the following :

- Pull the image from docker hub

```sh
docker pull giovannitangredi/pulsebs:<tag>
```

- then run it with the following command

```sh
docker run -p 3000:3000 -p 4001:4001 giovannitangredi/pulsebs:<tag>
```

User inside the system :

- s274930@studenti.polito.it student
- mario.rossi@polito.it teacher
- s280113@studenti.polito.it student
- behnam.lotfi@polito.it manager

the password for all accounts is password

## Install

To avoid errors, use **yarn** to manage node dependecies.

```sh
yarn install
```

## Usage

### Start server

```sh
yarn run start
```

### Format Code

```sh
yarn run format
```

### Run tests

```sh
yarn run test
```

### Produce coverage and test reports for SonarCube

```sh
yarn run test-full-reports
```
