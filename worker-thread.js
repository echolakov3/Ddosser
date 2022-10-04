const {
  parentPort
} = require('worker_threads');
const fs = require('fs');
const qs = require('querystring');
const https = require('https');
const http = require('http');

let delay;
let totalRequests;
let requestOptions;

let threadId;
let settings;
let body;
let protocol;

(function main() {

  parentPort.on('message', (message) => {
    loadSettings(message)
    makeInterval()
  });

})();

function loadSettings(message) {
  if (message.threadId != undefined && message.settings != undefined) {
    threadId = message.threadId;
    settings = message.settings;

    requestOptions = {
      'method': settings.method,
      'hostname': settings.hostname,
      'path': settings.path,
      'port': parseInt(settings.port),
      'headers': {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };

    delay = settings.delay;
    totalRequests = settings.totalRequests;

    attachHeaders(requestOptions, message.headers)

    body = message.body;

    protocol = settings.protocol.toUpperCase() === "HTTP".toUpperCase() ? http : https;
  }
}

function attachHeaders(requestOptions, headers) {
  Object.assign(requestOptions['headers'], ...headers);
}

function attachBody(req, body) {

  const bodyData = {}

  Object.assign(bodyData, ...body);

  //POST example key1=value1&key2=value2
  req.write(qs.stringify(bodyData));
}

function makeInterval() {
  let i = 0;

  const interval = setInterval(() => {

    if (i == totalRequests) {
      clearInterval(interval);
      parentPort.postMessage("exit");
    } else {
      makeRequest();
      i++;
    }

  }, delay); //ms

}

function makeRequest() {

  const req = protocol.request(requestOptions, function(res) {
    let chunks = [];

    res.on("data", function(chunk) {
      chunks.push(chunk);
    });

    res.on("end", function(chunk) {
      const body = Buffer.concat(chunks);
      console.log("WorkerThread" + threadId + " finised with response:");
      console.log(body.toString());
      console.log("------------------------------------")
    });

    res.on("error", function(error) {
      console.error(error);
    });
  });

  attachBody(req, body)

  req.end();

}
