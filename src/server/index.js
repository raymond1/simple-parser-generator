require('dotenv').config()
const https = require("https")
const express = require("express")
const app = express()
const router = express.Router()

// Requiring file system to use local files
const fs = require("fs")
const port = 443

console.log(process.env.server_private_key)

app.use(express.static('../../demos/'))

router.get('/os', (request,response)=>{

})

router.post('/os', (request,response)=>{

})


const options = {
  key: fs.readFileSync(process.env.server_private_key),
  cert: fs.readFileSync(process.env.server_certificate),
};

// Creating https server by passing
// options and app object
https.createServer(options, app)
.listen(port, function (req, res) {
console.log("Server started at port " + port);
});