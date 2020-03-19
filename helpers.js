const generateRandomString = () => {
  let result           = '';
  let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const getUsersByEmail = (email, database) => {
  for (let user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
};

const isLoggedIn = (userId, database) => {
  if (database[userId]) {
    return true;
  } else {
    return false;
  }
};

const urlsForUser = (id, database) => {
  const userUrlsDatabase = {};
  for (let url in database) {
    if (database[url].userId === id) {
      userUrlsDatabase[url] = database[url];
    }
  }
  return userUrlsDatabase;
};

module.exports = { getUsersByEmail, isLoggedIn, urlsForUser, generateRandomString };