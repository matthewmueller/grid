/**
 * Module dependencies
 */

var isArray = Array.isArray;
var Selection = require('./selection');
var utils = require('./utils');
var ntol = utils.ntol;

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
 * @param {String} expr
 * @return {Grid}
 * @api public
 */

Grid.prototype.select = function(expr) {
  return new Selection(expr, this);
};

/**
 * all
 */

Grid.prototype.all = function() {
  var largest = ntol(this.maxcol - 1) + this.maxrow;
  return new Selection('A1:' + largest, this);
};

/**
 * Delegate functions to Selection
 */

['each', 'max', 'toString', 'cols', 'rows', 'fill', 'json']
.forEach(function(fn) {
  Grid.prototype[fn] = function() {
    var sel = this.all();
    return sel[fn].apply(sel, arguments);
  }
});
