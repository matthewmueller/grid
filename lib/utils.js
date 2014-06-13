/**
 * Module Dependencies
 */

var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * Letter to number
 *
 * @param {String} l
 * @return {Number}
 */

exports.lton = lton = function(l) {
  return letters.indexOf(l);
}

/**
 * Number to letter
 *
 * TODO: support Y, Z, AA, AB, AC, ...
 *
 * @param {String} l
 * @return {Number}
 */

exports.ntol = ntol = function(n) {
  return letters[n];
}
