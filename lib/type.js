/**
 * Module Dependencies
 */

var tokens = require('./tokens');
var regex = require('./regexp');
var unique = require('unique');

/**
 * Export `type`
 */

module.exports = type;

/**
 * Initialize `type`
 */

function type(str) {
  return parse(str);
}

/**
 * Parse the type
 *
 * TODO: consider type('A, C') => cols instead of col
 */

function parse(str) {
  var types = [];
  var toks = tokens(str);

  for (var i = 0, tok; tok = toks[i]; i++) {
    if (regex.block.test(tok)) types.push('block');
    else if (regex.cell.test(tok)) types.push('cell');
    else if (regex.rows.test(tok)) types.push('rows');
    else if (regex.cols.test(tok)) types.push('cols');
    else if (regex.row.test(tok)) types.push('row');
    else if (regex.col.test(tok)) types.push('col');
  }

  switch(unique(types).length) {
    case 0: return null;
    case 1: return types[0];
  }

  // pluralize and test again
  for (var i = 0, type; type = types[i]; i++) {
    if ('col' == type) types[i] = 'cols';
    if ('row' == type) types[i] = 'rows';
  }

  switch(unique(types).length) {
    case 1: return types[0];
    default: return 'mixed';
  }
};
