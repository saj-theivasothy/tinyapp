const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['user_id']
}));
app.set("view engine", "ejs");

const generateRandomString = () => {
  let result           = '';
  let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const urlDatabase = {};

let users = {};

const emailLookUp = (email, database) => {
  for (let user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
};

const isLoggedIn = (userId) => {
  if (users[userId]) {
    return true;
  } else {
    return false;
  }
};

const urlsForUser = (id) => {
  const userUrlsDatabase = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      userUrlsDatabase[url] = urlDatabase[url];
    }
  }
  return userUrlsDatabase;
};

app.get("/urls", (req, res) => {
  const { user_id } = req.session;
  const user = users[user_id];
  const userUrlsDatabase = urlsForUser(user_id);
  let templateVars = {
    user,
    urls: userUrlsDatabase
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const { user_id } = req.session;
  const user = users[user_id];
  let templateVars = { user };
  isLoggedIn(user_id) ? res.render("urls_new", templateVars) : res.redirect("/login");
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const { user_id } = req.session;
  const user = users[user_id];
  const userUrlsDatabase = urlsForUser(user_id);
  let templateVars = {
    user,
    shortURL, userUrlsDatabase
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (urlDatabase.hasOwnProperty(shortURL)) {
    const longURL = urlDatabase[shortURL].longURL;
    res.redirect(longURL);
  }
});

app.get("/register", (req, res) => {
  const { user_id } = req.session;
  const user = users[user_id];
  let templateVars = {user};
  res.render("urls_form", templateVars);
});

app.get("/login", (req, res) => {
  const { user_id } = req.session;
  const user = users[user_id];
  let templateVars = {user};
  res.render("urls_login", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] =  { longURL: req.body.longURL, userID: req.session.user_id };
  res.redirect(`urls/${shortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  const userUrlsDatabase = urlsForUser(req.session.user_id);
  if (userUrlsDatabase.hasOwnProperty(shortURL)) {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  } else {
    res.redirect("/urls");
  }
});

app.post("/urls/:shortURL/update", (req, res) => {
  const shortURL = req.params.shortURL;
  const userUrlsDatabase = urlsForUser(req.session.user_id);
  if (userUrlsDatabase.hasOwnProperty(shortURL)) {
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.redirect("/urls");
  }
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const userUrlsDatabase = urlsForUser(req.session.user_id);
  if (!userUrlsDatabase[shortURL]) {
    res.redirect("urls");
  }
  urlDatabase[shortURL].longURL = req.body.longURL;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const existingData = emailLookUp(email, users);
  if (!existingData) {
    res.sendStatus(403);
  } else if (!bcrypt.compareSync(password, existingData.hashedPassword)) {
    res.sendStatus(403);
  } else {
    req.session.user_id = existingData.id;
    res.redirect("/urls");
  }
});

app.post("/logout", (req, res) => {
  req.session.user_id = "";
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const { email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (email === '' || password === '') {
    res.send("Error 400");
  } else if (emailLookUp(email, users)) {
    res.send("Error 400");
  } else {
    users[id] = {id, email, hashedPassword};
    console.log(users);
    req.session.user_id = id;
    res.redirect("/urls");
  }
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});
