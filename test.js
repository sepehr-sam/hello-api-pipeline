const http = require('http');
const assert = require('assert');

const PORT = 3000;
require('./app'); // start server

setTimeout(() => {
  http.get(`http://localhost:${PORT}/hello`, res => {
    assert.strictEqual(res.statusCode, 200);
    console.log("Test passed: /hello returns 200");
    process.exit(0);
  }).on('error', err => {
    console.error(err);
    process.exit(1);
  });
}, 500);
