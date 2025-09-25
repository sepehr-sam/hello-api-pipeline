const http = require('http');
const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  if (req.url === '/hello') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: "Hello World" }));
  } 
  if (req.url === '/health') {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  return res.end(JSON.stringify({ status: "ok" }));
  }
  else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(PORT, () => console.log(`Server running on ${PORT}`));
