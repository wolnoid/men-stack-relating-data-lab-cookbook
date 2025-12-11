const express = require('express');
const router = express.Router();

const User = require('../models/user.js');
const Recipe = require('../models/recipe.js');

router.get('/', async (req, res) => {
  try {
    // Look up the user from req.session
    const currentUser = await User.findById(req.session.user._id);
    console.log(currentUser)
    // Render index.ejs, passing in all of the current user's
    // applications as data in the context object.
    res.render('recipes/index.ejs', {
      recipes: currentUser.recipes,
    });
  } catch (error) {
    // If any errors, log them and redirect back home
    console.log(error);
    res.redirect('/');
  }
});

router.get('/new', async (req, res) => {
  res.render('recipes/new.ejs');
});

router.post('/', async (req, res) => {
  try {
    const newRecipe = new Recipe(req.body);
    newRecipe.owner = req.session.user._id;
    if (newRecipe.owner.equals(req.session.user._id)) {
      await newRecipe.save()
      // Redirect to recipe index or show page
    } else {
      // Redirect or show an error message
    };
  } catch (error) {
    // Handle errors
  }
});

module.exports = router;