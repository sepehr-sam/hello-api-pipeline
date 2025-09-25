// app.js
const http = require('http');
const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/hello')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ message: 'Hello World' }));
  }

  if (req.url.startsWith('/health')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ status: 'ok' }));
  }

  // default 404
  res.statusCode = 404;
  res.end();
});

server.listen(PORT, () => console.log(`Server running on ${PORT}`));

module.exports = server;
