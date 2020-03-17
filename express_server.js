const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

const generateRandomString = () => {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( let i = 0; i < 6; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
}

app.get("/urls", (req, res) => {
  let templateVars = {urls: urlDatabase};
  res.render("urls_index", templateVars)
})

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
})

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  let templateVars = {shortURL, LongURL: urlDatabase[shortURL]};
  res.render("urls_show", templateVars);
})

app.get("/u/:shortURL", (req, res) => {
  shortURL = req.params.shortURL;
  console.log("longURL", urlDatabase[shortURL]);
  if(urlDatabase.hasOwnProperty(shortURL)) {
    let longURL = urlDatabase[shortURL];
    console.log("inside longURL", longURL);
    res.redirect(longURL);
  }

})

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] =  req.body.longURL;
  res.redirect(`urls/${shortURL}`);
})



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
});
