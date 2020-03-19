const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");

const generateRandomString = () => {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( let i = 0; i < 6; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

let users = {"QTVpp9": {
  id: "QTVpp9", 
  email: "user2@example.com", 
  password: "dishwasher-funk"
}};

const emailLookUp = (email) => {
  for (let user in users) {
    if(users[user].email === email) {
      return users[user]; 
    } 
  }
};

app.get("/urls", (req, res) => {
  const { user_id } = req.cookies;
  const user = users[user_id]
  let templateVars = {
    user,
    urls: urlDatabase
  };
  res.render("urls_index", templateVars)
});

app.get("/urls/new", (req, res) => {
  const { user_id } = req.cookies;
  const user = users[user_id];
  let templateVars = { user };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const { user_id } = req.cookies;
  const user = users[user_id];
  let templateVars = {
    user,
    shortURL, LongURL: urlDatabase[shortURL]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  shortURL = req.params.shortURL;
  if(urlDatabase.hasOwnProperty(shortURL)) {
    let longURL = urlDatabase[shortURL];
    res.redirect(longURL);
  };
});

app.get("/register", (req, res) => {
  const { user_id } = req.cookies;
  const user = users[user_id]
  let templateVars = {user};
  res.render("urls_form", templateVars);
})

app.get("/login", (req, res) => {
  const { user_id } = req.cookies;
  const user = users[user_id]
  let templateVars = {user}
  res.render("urls_login", templateVars);
})

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] =  req.body.longURL;
  res.redirect(`urls/${shortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  if (urlDatabase.hasOwnProperty(shortURL)) {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  };
});

app.post("/urls/:shortURL/update", (req, res) => {
  const shortURL = req.params.shortURL;
  if (urlDatabase.hasOwnProperty(shortURL)) {
    res.redirect(`/urls/${shortURL}`);
  };
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect("/urls");
})

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const existingData = emailLookUp(email);
  if(!existingData) {
    res.sendStatus(403);
  } else if(existingData.password !== password) {
    res.sendStatus(403);
  } else {
    res.cookie("user_id", existingData.id);
    res.redirect("/urls");
  }
})

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
})

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const { email, password } = req.body;
  if(email === '' || password === '') {
    res.send("Error 400");
  } else if (emailLookUp(email)) {
    res.send("Error 400");
  } else {
    users[id] = {id, email, password};
    res.cookie("user_id", id);
    res.redirect("/urls");
  }
})

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`)
});
