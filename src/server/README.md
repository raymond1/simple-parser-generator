* Server Information for running the demo programs

In order to start the demo server in order to see the demos, use the command:

```
node index
```

This should be done from the src/server directory.

For the demo server to work, you will also need a TLS private key and certificate for the server. You will also need to configure src/server/index.js to point to the certificate you set up, as well as the private key for the server. Basically, you need the demos folder in the root of the project to be a web-accessible folder accessible from a browser.
