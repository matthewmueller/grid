/**
 * Module Dependencies
 */

var tokens = require('mini-tokenizer');
var regex = require('./regexp');

/**
 * Export `tokens`
 */

module.exports = tokens(regex.any);
