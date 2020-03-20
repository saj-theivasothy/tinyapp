const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const {
  getUserByEmail,
  isLoggedIn,
  getUserUrls,
  generateRandomString } = require('./helpers');

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(cookieSession({
  name: 'session',
  keys: ['user_id']
}));

const urlDb = {
  'JSer45': {
    longURL: 'http://www.google.com',
    userId: 'FDG43s'
  },
  'LrDvGs': {
    longURL: 'http://www.facebook.com',
    userId: 'FDG43s'
  },
  'QBJd42': {
    longURL: 'http://www.gmail.com',
    userId: 'FDG43s'
  }
};

let usersDb = {'FDG43s': {
  id: 'FDG43s',
  email: 'saj@example.com',
  hashedPassword: bcrypt.hashSync('1234', 10)
}
};

/**
 * Routes for rendering pages
 */
app.get('/urls', (req, res) => {
  const { user_id } = req.session;
  const user = usersDb[user_id];
  const userUrlsDb = getUserUrls(user_id, urlDb);
  let templateVars = {
    user,
    urls: userUrlsDb
  };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  const { user_id } = req.session;
  const user = usersDb[user_id];
  let templateVars = { user };
  isLoggedIn(user_id, usersDb) ? res.render('urls_new', templateVars) : res.redirect('/login');
});

app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const { user_id } = req.session;
  const user = usersDb[user_id];
  const userUrlsDb = getUserUrls(user_id, urlDb);
  let templateVars = {
    user,
    shortURL, userUrlsDb
  };
  res.render('urls_show', templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  if (shortURL in urlDb) {
    const longURL = urlDb[shortURL].longURL;
    res.redirect(longURL);
  }
});

/**
 * Route handles creation of new URL
 */
app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  urlDb[shortURL] =  { longURL: req.body.longURL, userId: req.session.user_id };
  res.redirect(`urls/${shortURL}`);
});

/**
 * Urls edit/delete routes
 * 
 * POST requests for editing URLs
 * POST requests for deleting URLs
 */
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  const userUrlsDb = getUserUrls(req.session.user_id, urlDb);
  if (shortURL in userUrlsDb) {
    delete urlDb[shortURL];
    res.redirect('/urls');
  } else {
    res.redirect('/urls');
  }
});

app.post('/urls/:shortURL/update', (req, res) => {
  const shortURL = req.params.shortURL;
  const userUrlsDb = getUserUrls(req.session.user_id, urlDb);
  if (shortURL in userUrlsDb) {
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.redirect('/urls');
  }
});

app.post('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const userUrlsDb = getUserUrls(req.session.user_id, urlDb);
  if (!userUrlsDb[shortURL]) {
    res.redirect('/urls');
  }
  urlDb[shortURL].longURL = req.body.longURL;
  res.redirect('/urls');
});

/**  
 * User registration/login routes
 * 
 * handles login requests
 * handles registration requests
 * handles logout requests
*/
app.get('/login', (req, res) => {
  const { user_id } = req.session;
  const user = usersDb[user_id];
  let templateVars = {user};
  res.render('urls_login', templateVars);
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email, usersDb);
  if (user && bcrypt.compareSync(password, user.hashedPassword)) {
    req.session.user_id = user.id;
    res.redirect('/urls');
  } else {
    res.send('Error 403: Please check your email and password and try again');
  }
});

app.post('/logout', (req, res) => {
  req.session.user_id = '';
  res.redirect('/urls');
});

app.get('/register', (req, res) => {
  const { user_id } = req.session;
  const user = usersDb[user_id];
  let templateVars = {user};
  res.render('urls_form', templateVars);
});

app.post('/register', (req, res) => {
  const id = generateRandomString();
  const { email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (email === '' || password === '' || getUserByEmail(email, usersDb)) {
    res.send('Error 400: Please check the details you entered and try again!');
  } else {
    usersDb[id] = {id, email, hashedPassword};
    req.session.user_id = id;
    res.redirect('/urls');
  }
});

// Server listening for requests
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});
