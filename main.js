//TEST API
//node main workerThreads=4 delay=3000 totalRequests=3 method=GET hostname=jsonplaceholder.typicode.com path=/posts/1
//https://jsonplaceholder.typicode.com/posts/1

const {
  Worker
} = require('worker_threads');

let workerThreadTotal;
const settings = {
  workerThreads: "",
  delay: "",
  totalRequests: "",
  method: "",
  hostname: "",
  path: "",
  port: "",
  protocol: ""
}
const body = []
const headers = []

function createThreadWorker() {
  const worker = new Worker('./worker-thread.js');

  worker.postMessage({
    "threadId": worker.threadId,
    "settings": settings,
    "body": body,
    "headers": headers
  });

  worker.on('message', (result) => {
    if (result == "exit") {
      worker.terminate();
    }
  });
}

function parseArgs() {
  const passedArgs = process.argv.slice(2);

  for (const arg of passedArgs) {
    //get first = only optimization
    const [keyOfArg, ...restOfArg] = arg.split('=')
    const valueOfArg = restOfArg.join('=')

    for (const setting in settings) {
      if (setting == keyOfArg) {
        settings[setting] = valueOfArg;
      }
    }

    extractBodyParam(keyOfArg, valueOfArg);
    extractHeaderParam(keyOfArg, valueOfArg);
  }

  workerThreadTotal = settings.workerThreads;
}

function executeThreadWorkers() {
  for (let i = 0; i < workerThreadTotal; i++) {
    createThreadWorker();
  }
}

function extractBodyParam(keyOfArg, valueOfArg) {
  if (keyOfArg.startsWith("body.")) {
    const rawKeyOfArg = keyOfArg.replace("body.", "");
    body.push({
      [rawKeyOfArg]: valueOfArg
    });
  }
}

function extractHeaderParam(keyOfArg, valueOfArg) {
  if (keyOfArg.startsWith("header.")) {
    const rawKeyOfArg = keyOfArg.replace("header.", "");
    headers.push({
      [rawKeyOfArg]: valueOfArg
    });
  }
}

(function main() {

  parseArgs();
  executeThreadWorkers();

})();
