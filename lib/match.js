/**
 * Module Dependencies
 */

var regexp = require('./regexp');

/**
 * Export `match`
 */

module.exports = match;

/**
 * Find a match
 *
 * @param {String} str
 * @return {Array} match
 */

function match(str) {
  return str.match(regexp.block)
  || str.match(regexp.rows)
  || str.match(regexp.cols)
  || str.match(regexp.cell)
  || str.match(regexp.row)
  || str.match(regexp.col)
}
