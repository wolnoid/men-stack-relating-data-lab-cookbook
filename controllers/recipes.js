const express = require('express');
const router = express.Router();

const User = require('../models/user.js');
const Recipe = require('../models/recipe.js');
const Ingredient = require('../models/ingredient.js');

const isSignedIn = require('../middleware/is-signed-in.js');


router.get('/', isSignedIn, async (req, res) => {
  try {
    const populatedRecipes = await Recipe.find({
      owner: req.session.user._id
    }).populate('owner');

    res.render('recipes/index.ejs', {
      recipes: populatedRecipes,
    });
  } catch (error) {
    console.log(error);
    res.redirect('/recipes');
  }
});

router.get('/new', isSignedIn, async (req, res) => {
  try {
    const fields = req.session.recipeFields;
    req.session.recipeFields = null;
    
    const populatedIngredients = await Ingredient.find({
      owner: req.session.user._id
    }).populate('owner');

    const selectedIngredientIds = fields ? fields.ingredients : null;

    res.render('recipes/new.ejs', {
      fields,
      ingredients: populatedIngredients,
      selectedIngredients: selectedIngredientIds,
    });
  } catch (error) {
    console.log(error);
    res.redirect('/recipes/new');
  }
});

router.post('/', isSignedIn, async (req, res) => {
  try {
    req.session.recipeFields = null

    const newRecipe = new Recipe(req.body);
    newRecipe.owner = req.session.user._id;

    await newRecipe.save();
    // Redirect to recipe index or show page
    res.redirect('/recipes');
  } catch (error) {
    // console.log(error);
    req.session.recipeFields = {
      name: req.body.name,
      instructions: req.body.instructions,
    }
    res.redirect('/recipes/new');
  }
});

router.get('/:recipeId', isSignedIn, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.recipeId)
      .populate('owner')
      .populate('ingredients')

    res.render('recipes/show.ejs', {
      recipe,
    });
  } catch (error) {
    console.log(error);
    res.redirect('/recipes');
  }
});

router.delete('/:recipeId', isSignedIn, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.recipeId);
    if (recipe.owner.equals(req.session.user._id)) {
      await recipe.deleteOne();
      res.redirect('/recipes');
    } else {
      res.send("You don't have permission to do that.");
    }
  } catch (error) {
    console.error(error);
    res.redirect('/recipes');
  }
});

router.get('/:recipeId/edit', isSignedIn, async (req, res) => {
  try {
    const fields = req.session.recipeFields;
    req.session.recipeFields = null;

    const currentRecipe = await Recipe.findById(req.params.recipeId);
    const populatedIngredients = await Ingredient.find({ owner: req.session.user._id }).populate('owner');
    
    const baseSelectedIngredientIds = currentRecipe.ingredients.map(id => id.toString());
    const selectedIngredientIds = fields ? fields.ingredients : baseSelectedIngredientIds;

    res.render('recipes/edit.ejs', {
      fields,
      recipe: currentRecipe,
      ingredients: populatedIngredients,
      selectedIngredients: selectedIngredientIds,
    });
  } catch (error) {
    console.log(error);
    res.redirect('/recipes');
  }
});

router.put('/:recipeId', isSignedIn, async (req, res) => {
  try {
    const currentRecipe = await Recipe.findById(req.params.recipeId);
    
    if (currentRecipe.owner.equals(req.session.user._id)) {
      await currentRecipe.updateOne(req.body);
      res.redirect(`/recipes/${req.params.recipeId}`);
    } else {
      res.send("You don't have permission to do that.");
    }
  } catch (error) {
    console.log(error);
    res.redirect(`/recipes/${req.params.recipeId}`);
  }
});

module.exports = router;