const express = require("express");
const cookieParser = require('cookie-parser')
const bodyParser = require("body-parser");

var app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs")


const PORT = process.env.PORT || 8080; // default port 8080
let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

app.post("/urls/:id", (req, res) => {
  console.log(urlDatabase)
  urlDatabase[req.params.id] = req.body.longURL;
  console.log(urlDatabase)
  res.redirect('/urls/');
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, urls: urlDatabase };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let myShortURL = req.params.shortURL;
  if (myShortURL in urlDatabase){
    let longURL = urlDatabase[req.params.shortURL];
    if (!(longURL.startsWith('http://') || longURL.startsWith('https://'))){
      longURL = 'http://' + longURL;
    }
    res.redirect(301, longURL);
  } else {
    res.redirect(404, "404");
  }
});

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/404", (req, res) => {
  res.render("404");
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
  return Math.random().toString(36).substr(2, 6)
}
