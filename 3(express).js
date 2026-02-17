const express = require('express');
const fs = require('node:fs');
const path = require('node:path');
const morgan = require('morgan');

const app = express();
const port = 3000;

app.use('/about',(req, res, next)=>{
    console.log("METHOD:", req.method, "Request URL:", req.url);
    next();
});
// app.use(express.static("./frontFiles"));
app.get("/", (req, res) => {
    res.send("Home Page");
});    
// app.get("/index", (req, res) => {
//     res.sendFile(path.join(__dirname, "frontFiles", "1.html"));
// });

app.use(morgan('dev'));
app.get("/about", (req, res) => {
    res.send("aboutPage");
})
app.use((req, res)=>{
    res.status(404).send("<h1>not found page</h1>");
});
app.listen(port, ()=>{
    console.log(`Express server is running on http://localhost:${port}`);
});