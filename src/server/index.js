let path2 = require('node:path')
console.log(path2)
require('dotenv').config()
const https = require("https")
const express = require("express")
const app = express()
const router = express.Router()

// Requiring file system to use local files
const fs = require("fs")
const port = 443

app.use(express.static('../../demos/',   {
  setHeaders: function(res, path, stat) {
    let extension = path2.extname(path)
console.log('inside setHeaders')
    console.log(extension + path)
    console.log(Object.keys(stat))
    console.log('extension is:' + extension)
    if (extension == '.js') {
console.log('js detected')
      res.set({'Content-Type': 'application/javascript'}) 
    }
  }
}))

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