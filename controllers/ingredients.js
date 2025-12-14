const express = require('express');
const router = express.Router();

const User = require('../models/user.js');
const Ingredient = require('../models/ingredient.js');

const isSignedIn = require('../middleware/is-signed-in.js');

router.post('/', isSignedIn, async (req, res) => {
  const redirectTo = req.body.redirectTo || '/recipes/new';

  req.session.recipeFields = {
      name: req.body.name,
      instructions: req.body.instructions,
      ingredients: req.body.ingredients,
    }
  
  try {
    const ingredientName = req.body.ingredientName.trim();

    const existingIngredient = await Ingredient.findOne({
      name: ingredientName,
      owner: req.session.user._id,
    });

    if (existingIngredient) {
      req.session.ingredientError = 'Ingredient already exists.';
      return res.redirect(redirectTo);
    }

    await Ingredient.create({
      name: ingredientName,
      owner: req.session.user._id,
    });

    res.redirect(redirectTo);

  } catch (error) {
    if (error.code === 11000) {
      req.session.ingredientError = 'Ingredient already exists.';
    }
    console.log(error);
    res.redirect(redirectTo);
  }
});

router.delete('/delete', isSignedIn, async (req, res) => {
  const redirectTo = req.body.redirectTo || '/recipes/new';

  req.session.recipeFields = {
    name: req.body.name,
    instructions: req.body.instructions,
    ingredients: req.body.ingredients,
  }

  try {
    const ingredient = await Ingredient.findOne({
      name: req.body.ingredientName,
      owner: req.session.user._id,
    });

    if (ingredient.owner.equals(req.session.user._id)) {
      await ingredient.deleteOne();
      res.redirect(redirectTo);
    } else {
      res.send("You don't have permission to do that.");
    }
  } catch (error) {
    console.error(error);
    res.redirect(redirectTo);
  }
});

module.exports = router;
