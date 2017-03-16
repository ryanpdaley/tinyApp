const express = require("express");
const cookieParser = require('cookie-parser')
const bodyParser = require("body-parser");

var app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())
app.set("view engine", "ejs")


const PORT = process.env.PORT || 8080; // default port 8080

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const urlDatabase = {
  "b2xVn2": {
    shortURL: "b2xVn2",
    longURL: "http://www.lighthouselabs.ca",
    userID: "test"
  },
  "9sm5xK": {
    shortURL: "9sm5xK",
    longURL: "http://www.google.com",
    userID: "test"
  }
};

app.get("/login", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    user: req.cookies
  };
  res.render("users_login", templateVars);
});

app.get("/urls", (req, res) => {
  user = req.cookies
  userURLs = {}
  for (let item in urlDatabase) {
    if (urlDatabase[item]['userID'] === user.user_id) {
      userURLs[item] = urlDatabase[item]
    }
  }
  let templateVars = {
    urls: userURLs,
    user: user
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: req.cookies
  };
  if (! req.cookies.user_id){
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    urls: urlDatabase,
    user: req.cookies
  };
  res.render("urls_show", templateVars);
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
  res.end("Hello!");
});

app.get("/404", (req, res) => {
  res.sendStatus(404);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/register", (req, res) => {
  let templateVars = {
    user: req.cookies
  };
  res.render("users_register", templateVars);
});

app.post("/login", (req, res) => {
  let email = req.body.email
  let password = req.body.password
  let validUser = false
  for (let userID in users){
    if (users[userID]['email'] === email && users[userID]['password'] === password){
      validUser = userID
    }
  }
  if (! validUser === false ){
    res.cookie('user_id', validUser)
    res.redirect('/urls');
  } else {
    res.sendStatus(403);
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id')
  res.redirect('/urls');
});

app.post("/register", (req, res) => {
  let emailExist = false
  let id = generateRandomString()
  let email = req.body.email
  let password = req.body.password
  for (var addr in users){
    if (users[addr]['email'] === email) emailExist = true
  }
  if (email === '' || password === '' || emailExist) res.sendStatus(404);
  else {
    res.cookie('user_id', id)
    users[id] = {
      id: id,
      email: email,
      password: password
    }
    console.log(users)
    res.redirect('/urls');
  }
});

//  Adds a URL
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let longURL = req.body.longURL
  let userID = req.cookies.user_id
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
  let userID = req.cookies.user_id
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

//  Deletes an existing URL
app.post("/urls/:id/delete", (req, res) => {
  let userID = req.cookies.user_id
  let shortURL = req.params.id
  if (urlDatabase[shortURL]['userID'] === userID) {
    delete urlDatabase[req.params.id];
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
