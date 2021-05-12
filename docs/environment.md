Defining Environment Variables

For docker-compose:

[Fill in pre-defined variables](../docker-compose.yml):

```
environment:
    - "REACT_APP_API_AUTH=(API username and password in base64 encoding)"
    - "REACT_APP_API_ENDPOINT=https://openapi-stage.kartverket.no/v1/"
    - "REACT_APP_API_DATASET_NAME=tilgjengelighet"
```

```
environment:
    - "FTP_USER=brukernavn"
    - "FTP_PASS=passord"
```

For production or development:

Server environment:

CD kartverket-tilgjengelighet
Create file ".env"

```
FTP_USER=brukernavn
FTP_PASS=passord
```

Client environment:

CD kartverket-tilgjengelighet
Create file ".env.local"

```
BROWSER=none
EXTEND_ESLINT=true
REACT_APP_API_AUTH=API username and password in base64 encoding
REACT_APP_API_ENDPOINT=https://openapi-stage.kartverket.no/v1/
REACT_APP_API_DATASET_NAME=tilgjengelighet
```
