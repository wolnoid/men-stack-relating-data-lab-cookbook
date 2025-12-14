const express = require('express');
const router = express.Router();

const User = require('../models/user.js');
const Recipe = require('../models/recipe.js');
const Ingredient = require('../models/ingredient.js');

const isSignedIn = require('../middleware/is-signed-in.js');


router.get('/', isSignedIn, async (req, res) => {
  try {
    const userList = await User.find({});

    res.render('users/index.ejs', {
      users: userList,
    });
  } catch (error) {
    console.log(error);
    res.redirect('../');
  }
});

router.get('/:userId', isSignedIn, async (req, res) => {
  try {
    const selectedUser = await User.findOne({ username: req.params.userId });

    const populatedRecipes = await Recipe.find({
      owner: selectedUser
    }).populate('owner');

    console.log(selectedUser)
    console.log(populatedRecipes)
    
    res.render('users/show.ejs', {
      user: selectedUser,
      recipes: populatedRecipes,
    });
  } catch (error) {
    console.log(error);
    res.redirect('/users');
  }
});

module.exports = router;