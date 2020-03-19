const { assert } = require('chai');

const helpers = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
  hashedPassword: bcrypt.hashSync('purple-monkey-dinosaur', 10)
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    hashedPassword: bcrypt.hashSync('dishwasher-funk', 10)
  }
};

const testUrls = {
  "randomShortUrl1": {
    longURL: 'http://www.google.com',
    userId: 'userRandomID'
  },
  "randomShortUrl2": {
    longURL: 'http://www.facebook.com',
    userId: 'user2RandomID'
  },
  "randomShortUrl3": {
    longURL: 'http://www.gmail.com',
    userId: 'user2RandomID'
  }
}

describe('getUserByEmail', () => {
  it('should return a user with valid email', () => {
    const user = helpers.getUserByEmail('user@example.com', testUsers);
    const expectedOutput = 'userRandomID';
    assert.deepEqual(user.id, expectedOutput);
  })

  it('should return undefined if email is not in the database', () => {
    const user = helpers.getUserByEmail('user123@example.com', testUsers);
    assert.isUndefined(user)
  })
})

describe('isLoggedIn', () => {
  it('should return true if id is in the database', () => {
    const isLoggedIn = helpers.isLoggedIn('user2RandomID', testUsers);
    assert.isTrue(isLoggedIn); 
  })

  it('should return false if id is not in the database', () => {
    const isLoggedIn = helpers.isLoggedIn('user2Random', testUsers);
    assert.isFalse(isLoggedIn);
  })
})

describe('urlsForUser', () => {
  it('should return an object with all urls for a given user_id', () => {
    const urlsForUser = helpers.urlsForUser('user2RandomID', testUrls);
    const expectedOutput = {
      "randomShortUrl2": {
      longURL: 'http://www.facebook.com',
      userId: 'user2RandomID'
      },
      "randomShortUrl3": {
        longURL: 'http://www.gmail.com',
        userId: 'user2RandomID'
      }
    }
    assert.deepEqual(urlsForUser, expectedOutput);
  })

  it('should return an empty object if no urls match the given user_id', () => {
    const urlsForUser = helpers.urlsForUser('user2Random', testUrls);
    assert.isEmpty(urlsForUser);
  })
})