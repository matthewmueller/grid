/**
 * Export `Cell`
 */

module.exports = Cell;

/**
 * Initialize `Cell`
 */

function Cell(val, at) {
  if (!(this instanceof Cell)) return new Cell(val, at);
  this.val = val;
  this.at = at;
}

/**
 * value
 */

Cell.prototype.value = function(val) {
  if (!arguments.length) return this.val;
  this.val = val;
};
