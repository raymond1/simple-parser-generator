* Server Information for running the demo programs

In order to see the To start the server, use the command:

```
node index
```

This should be done from the src/server directory.

Then, you will have to set up a TLS certificate for the server and configure src/server/index.js to point to the certificate you set up, as well as the private key for the server. Basically, you need the demos folder in the root of the project to be a web-accessible folder accessible from a browser.
