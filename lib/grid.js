/**
 * Module dependencies
 */

var isArray = Array.isArray;
var expand = require('./expand');

/**
 * Export `Grid`
 */

module.exports = Grid;

/**
 * Initialize `Grid`
 */

function Grid(col, row) {
  if (!(this instanceof Grid)) return new Grid(col, row);
  this.maxcol = col || 5;
  this.maxrow = row || 5;
  this.grid = {};
}

/**
 * Select
 *
 * @param {String} selection
 * @return {Grid}
 * @api public
 */

Grid.prototype.select = function(selection) {
  this.selection = expand(selection, this.maxcol, this.maxrow);
  return this;
};

/**
 * Insert
 *
 * @param {Array|String} arr
 * @return {Grid}
 * @api public
 */

Grid.prototype.insert = function(arr) {
  arr = isArray(arr) ? arr : [arr];
  var selection = this.selection;
  var grid = this.grid;

  for (var i = 0, len = arr.length; i < len; i++) {
    if (!selection[i]) break;
    grid[selection[i]] = arr[i];
  }

  return this;
};


/**
 * Loop through each cell in the selection
 *
 * @param {Function} fn
 * @return {Grid}
 * @api public
 */

Grid.prototype.each = function(fn) {
  var selection = this.selection;
  var grid = this.grid;

  for (var i = 0, at; at = selection[i]; i++) {
    grid[at] && fn(grid[at], at);
  }

  return this;
};
