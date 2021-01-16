# PULSeBS

Pandemic University Lecture Seat Booking System SE2 Project

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=giovannitangredi_PULSeBS&metric=alert_status)](https://sonarcloud.io/dashboard?id=giovannitangredi_PULSeBS)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=giovannitangredi_PULSeBS&metric=reliability_rating)](https://sonarcloud.io/dashboard?id=giovannitangredi_PULSeBS)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=giovannitangredi_PULSeBS&metric=security_rating)](https://sonarcloud.io/dashboard?id=giovannitangredi_PULSeBS)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=giovannitangredi_PULSeBS&metric=sqale_rating)](https://sonarcloud.io/dashboard?id=giovannitangredi_PULSeBS)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=giovannitangredi_PULSeBS&metric=coverage)](https://sonarcloud.io/dashboard?id=giovannitangredi_PULSeBS)

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

the final version is the one tagged as Release2

User inside the system :

- mario.rossi@polito.it teacher
- federico.quarta@polito.it  supportOfficer
- behnam.lotfi@polito.it manager
- s900000@students.politu.it student
- Ines.Beneventi@politu.it teacher
- Nino.Lucciano@politu.it teacher

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
