# P2P ChatJS Express
JavaScript Node.js Express.js WebSocket P2P Chat Service with HTML and JavaScript Chat Client


## Project Structure
```shell
p2p-chatjs/
├── Dockerfile
├── docker-compose.yml
├── package.json
├── .env
├── certs/
│   ├── ca-cert.pem
│   ├── ca-key.pem
│   ├── server-cert.pem
│   ├── server-key.pem
├── node_modules/
├── public/
│   ├── index.html
│   ├── styles.css
│   ├── chat-script.mjs
├── src/
│   ├── server.mjs
│   ├── peersocket.mjs
│   └── peersocket_payload.mjs
└── README.md (optional)
```



## Generating the TLS Certificates
```shell
# Navigate to the certs directory
cd certs

# Generate a Certificate Authority (CA)
openssl genpkey -algorithm RSA -out ca-key.pem
openssl req -x509 -new -nodes -key ca-key.pem -sha256 -days 365 -out ca-cert.pem -subj "/CN=ChatCA"

# Generate Server Certificate
openssl genpkey -algorithm RSA -out server-key.pem
openssl req -new -key server-key.pem -out server.csr -subj "/CN=localhost"
openssl x509 -req -in server.csr -CA ca-cert.pem -CAkey ca-key.pem -CAcreateserial -out server-cert.pem -days 365 -sha256
```


## Running the Chat Service

This service uses `docker compose` using the included `docker-compose.yaml` file. The dependency for the chat service is the `redis` server and the use of `depends_on` directive forces the `redis` server to startup and serve prior to the chat service starting. 

Here is the `docker-compose.yaml` for reference.

```yaml
version: "3.8"
services:
  chat:
    build: .
    ports:
      - "${HTTP_PORT}:${HTTP_PORT}"
      - "${HTTPS_PORT}:${HTTPS_PORT}"
    volumes:
      - ./certs:/app/certs
    environment:
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis

  redis:
    image: "redis:alpine"
    ports:
      - "6379:6379"
```

To rebuild the Docker image and start the service run the following.

```shell
docker-compose up --build
```
Or for `no-cache` builds follow the two steps of.

```shell
docker-compose build --no-cache
docker-compose up
```

To stop the service run the following.

```shell
docker-compose down
```
