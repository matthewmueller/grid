/**
 * Module dependencies
 */

var isArray = Array.isArray;
var expand = require('./expand');
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
 * @param {String} selection
 * @return {Grid}
 * @api public
 */

Grid.prototype.select = function(selection) {
  this.selection = expand(selection, this.maxcol, this.maxrow);
  return this;
};

/**
 * all
 */

Grid.prototype.all = function() {
  var l = ntol(this.maxcol - 1);
  var largest = l + this.maxrow;
  this.selection = expand('A1:' + largest, this.maxcol, this.maxrow);
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

/**
 * max
 */

Grid.prototype.max = function() {
  var max = 0;
  this.each(function(v) {
    max = max > v ? max : v;
  })

  return max;
};


/**
 * toString
 *
 * TODO: refactor
 */

Grid.prototype.toString = function() {
  var all = this.all().selection;
  var max = '' + (this.max());
  var maxlen = max.length + 1;
  var maxcol = this.maxcol;
  var maxrow = this.maxrow;
  var grid = this.grid;
  var out = [];
  var k = 0;
  var val;
  var len;
  var row;

  row = pad(' ', ('' + maxrow).length) + '  ';
  for (var i = 0; i < maxcol; i++) {
    row += pad(' ', maxlen - 1) + ntol(i);
  }
  out.push(row + '  ');


  for (var i = 0; i < maxrow; i++) {
    row = pad(' ', ('' + maxrow).length - ('' + (i + 1)).length) + (i + 1) + ' |';

    for (var j = 0; j < maxcol; j++, k++) {
      val = grid[all[k]] || '·';
      len = ('' + val).length;

      row += val == undefined
        ? pad(' ', maxlen)
        : pad(' ', maxlen - len) + val;
    }

    out.push(row + ' |');
  }

  function pad(str, n) {
    return new Array(+n + 1).join(str);
  }

  return out.join('\n');
};
