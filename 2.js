const http = require('node:http'); 
const fs = require('node:fs');
const hostname = '127.0.0.1';
const port = 5000 ;

const htmlFile = fs.readFileSync('frontFiles/1.html');
const cssFile = fs.readFileSync('frontFiles/1.css');

const server = http.createServer((req, res) => {
    console.log ("===req.url===");
    console.log (req.url);
    
  res.statusCode = 200;
  if (req.url==="/"){
    res.write(htmlFile)}
  else if (req.url==="/about"){
    res.write("aboutPage")}
  else if (req.url==="/style.css"){
    res.write(cssFile)}
  else{
    res.statusCode=404;
    res.write("<h1>not found page</h1>")
  }  
  res.end();
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
