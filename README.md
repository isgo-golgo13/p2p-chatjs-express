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
openssl req -x509 -new -nodes -key ca-key.pem -sha256 -days 365 -out ca-cert.pem -subj "/CN=MyCA"

# Generate Server Certificate
openssl genpkey -algorithm RSA -out server-key.pem
openssl req -new -key server-key.pem -out server.csr -subj "/CN=localhost"
openssl x509 -req -in server.csr -CA ca-cert.pem -CAkey ca-key.pem -CAcreateserial -out server-cert.pem -days 365 -sha256
```
