const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

ingredientSchema.index({ name: 1, owner: 1 }, { unique: true });

const Ingredient = mongoose.model('Ingredient', ingredientSchema);

module.exports = Ingredient;