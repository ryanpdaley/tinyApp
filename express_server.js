const express = require("express");
const cookieSession = require('cookie-session')
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const methodOverride = require('method-override')

var app = express();
app.set("view engine", "ejs")
app.set('trust proxy', 1)
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}))
app.use(methodOverride('_method'))

const PORT = process.env.PORT || 3000; // default port 8080

const users = {};

const urlDatabase = {};

//  Deletes an existing URL
app.delete("/urls/:id/", (req, res) => {
  let userID = req.session.user_id
  let shortURL = req.params.id
  if (urlDatabase[shortURL]['userID'] === userID) {
    delete urlDatabase[req.params.id];
    res.redirect('/urls');
  } else {
    res.sendStatus(403);
  }
});

app.get("/login", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    user: req.session.user_id,
    users: users
  };
  res.render("users_login", templateVars);
});

app.get("/urls", (req, res) => {
  user = req.session.user_id
  userURLs = {}
  for (let item in urlDatabase) {
    if (urlDatabase[item]['userID'] === user) {
      userURLs[item] = urlDatabase[item]
    }
  }
  let templateVars = {
    urls: userURLs,
    user: user,
    users: users
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: req.session.user_id,
    users: users
  };
  if (! req.session.user_id){
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:id", (req, res) => {
  let myShortURL = req.params.id;
  let templateVars = {
    shortURL: req.params.id,
    urls: urlDatabase,
    user: req.session.user_id,
    users: users
  };
  if (myShortURL in urlDatabase){
    res.render("urls_show", templateVars);
  } else {
    res.sendStatus(404);
  }
});

app.get("/u/:shortURL", (req, res) => {
  let myShortURL = req.params.shortURL;
  if (myShortURL in urlDatabase){
    let longURL = urlDatabase[req.params.shortURL]['longURL'];
    if (!(longURL.startsWith('http://') || longURL.startsWith('https://'))){
      longURL = 'http://' + longURL;
    }
    res.redirect(301, longURL);
  } else {
    res.sendStatus(404);
  }
});

app.get("/", (req, res) => {
  res.redirect("/urls/new");
});

app.get("/404", (req, res) => {
  res.sendStatus(404);
});

app.get("/register", (req, res) => {
  let templateVars = {
    user: req.session.user_id,
    users: users
  };
  res.render("users_register", templateVars);
});

app.post("/login", (req, res) => {
  let email = req.body.email
  let password = req.body.password
  let validUser = false
  for (let userID in users){
    if (users[userID]['email'] === email && bcrypt.compareSync(password, users[userID]['password'])){
      validUser = userID
    }
  }
  if (! validUser === false ){
    req.session.user_id = validUser;
    res.redirect('/urls');
  } else {
    res.sendStatus(403);
  }
});

app.post("/logout", (req, res) => {
  req.session = null
  res.redirect('/urls');
});

app.post("/register", (req, res) => {
  let emailExist = false
  let id = generateRandomString()
  let email = req.body.email
  let password = req.body.password;
  for (var addr in users){
    if (users[addr]['email'] === email) emailExist = true
  }
  if (email === '' || password === '' || emailExist) res.sendStatus(404);
  else {
    req.session.user_id = id;
    users[id] = {
      id: id,
      email: email,
      password: bcrypt.hashSync(password, 10)
    }
    res.redirect('/urls');
  }
});

//  Adds a URL
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let longURL = req.body.longURL
  let userID = req.session.user_id
  if (!(longURL.startsWith('http://') || longURL.startsWith('https://'))){
    longURL = 'http://' + longURL;
  }
  urlDatabase[shortURL] = {
    shortURL: shortURL,
    longURL: longURL,
    userID: userID
  };
  res.redirect(`/urls/${shortURL}`);
});

//  Updates an existing URL
app.post("/urls/:id", (req, res) => {
  let shortURL = req.params.id
  let longURL = req.body.longURL
  let userID = req.session.user_id
  if (urlDatabase[shortURL]['userID'] === userID) {
    urlDatabase[shortURL] = {
      shortURL: shortURL,
      longURL: longURL,
      userID: userID
    };
    res.redirect('/urls');
  } else {
    res.sendStatus(403);
  }
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
  return Math.random().toString(36).substr(2, 6)
}
