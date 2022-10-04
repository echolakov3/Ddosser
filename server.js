//kill process on PORT
//sudo lsof -i :8080
//kill -9 <PID>

//sudo chmod 755 "./main.js"

//https://github.com/beautify-web/js-beautify
// js-beautify foo.js

const express = require('express');
const path = require('path');
const exec = require('child_process').exec;

const port = process.env.PORT || 8080;

(function main() {

  const app = express();

  //parse post body data
  app.use(express.urlencoded({
    extended: true
  }));
  app.use(express.json());

  app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, '/index.html'));
  });

  app.post('/ddos', (req, res) => {
    let response = res;
    let path = parsePostData(req)
    executeDdos(path, function() {
      res.send("<h1>Ddosser</h1><hr><h2>Response:</h2><pre>" + this.stdout + "</pre>")
    })
  })

  app.listen(port);

})();

function parsePostData(req) {
  //settings, body, headers
  const passedArgs = req.body;

  let path = "";

  for (const arg in passedArgs) {
    path += arg + "=" + passedArgs[arg] + " ";
  }

  return path;
}

function executeDdos(path, resCallback) {
  const childProcess = "node " + __dirname + '/main.js ' + path;

  console.log(childProcess)

  exec(childProcess, function callback(error, stdout, stderr) {
    console.log(error)
    console.log(stderr)

    resCallback.call({
      stdout: stdout
    });
  });
}
