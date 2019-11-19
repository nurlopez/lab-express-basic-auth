var express = require('express');
const User = require('./../models/User');
var router = express.Router();

const bcrypt = require('bcrypt');
const saltRounds = 10;

// POST - user sign UP conditions '/signup'
router.post('/signup', (req, res, next) => {
  const {
    username,
    password
  } = req.body;
console.log('caca');
  if (username === '' || password === '') {
    res.render('auth-views/signup', {
      errorMessage: 'Please enter a username and password.',
    });
  return;
  }

  // Check if username taken - yes: return error
  User.findOne({ username })
      .then(user => {
    if (user) {
      res.render('auth-views/signup', { errorMessage: 'Ups! Username taken. Try another one.'
      });
      return;
    }

    // no : generate salts and hash the password
    const salt = bcrypt.genSaltSync(saltRounds);
    const hashedPassword = bcrypt.hashSync(password, salt);

    // add user to DB
    User.create({ username, password: hashedPassword })
        .then(newUserObj => { res.redirect('/'); })
        .catch(err => { res.render('auth-views/signup', { errorMessage: 'Ups! Error while creating new username.'        });
        })
  .catch(err => console.log(err));  
  });

})

// POST - user log IN conditions 'auth/login'
router.post('/login', (req, res, next) => {
  const { username, password: enteredPassword } = req.body;
    if (username === '' || enteredPassword === '') {
    res.render('auth-views/login', {
      errorMessage: 'Please enter a username and password.',
    });
    return;
    }

  User.findOne({ username })
    .then(userData => {
      if (!userData) {
        res.render('auth-views/login', { errorMessage: 'Ups! Username not found!' });
        return;
      }

      // username correct. Now check pw
      const hashedPasswordFromDB = userData.password; 
      const passwordCorrect = bcrypt.compareSync(
        enteredPassword,
        hashedPasswordFromDB,
      );

      //- yes: create session (& cookie) and redirect
      if (passwordCorrect) {
        // Save the login in the session ( and create cookie )
        // And redirect the user
        req.session.currentUser = userData;
        res.redirect('/');
      }
    })
    .catch(err => console.log(err));
});

module.exports = router;
