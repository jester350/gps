const http = require('http');

const hostname = '0.0.0.0';
const port = 8068;


const server = http.createServer((req, res) => {
  console.log("BOOBS")
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World\n');
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
