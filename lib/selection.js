/**
 * Module dependencies
 */

var isArray = Array.isArray;
var type = require('./type');
var match = require('./match');
var expand = require('./expand');

/**
 * Export `Selection`
 */

module.exports = Selection;

/**
 * Initialize `Selection`
 */

function Selection(expr, grid) {
  if (!(this instanceof Selection)) return new Selection(expr, grid);
  this.selection = expand(expr, grid.maxcol, grid.maxrow);
  this.expr = expr;
  this.type = type(expr);
  this.grid = grid;
  this.maxcol = grid.maxcol;
}

/**
 * each
 */

Selection.prototype.each = function(fn) {
  var selection = this.selection;
  var grid = this.grid.grid;

  for (var i = 0, at; at = selection[i]; i++) {
    var ret = fn(grid[at], at, i);
    if (false === ret) break;
  }

  return this;
};

/**
 * Insert
 *
 * @param {Array|String} arr
 * @return {Selection}
 * @api public
 */

Selection.prototype.insert = function(arr) {
  arr = isArray(arr) ? arr : [arr];
  var selection = this.selection;
  var grid = this.grid.grid;

  for (var i = 0, len = arr.length; i < len; i++) {
    if (!selection[i]) break;
    grid[selection[i]] = arr[i];
  }

  return this;
};

/**
 * max
 */

Selection.prototype.max = function() {
  var max = 0;
  
  this.each(function(v, at) {
    max = !v || max > v ? max : v;
  });

  return max;
};

/**
 * shift
 */

Selection.prototype.shift = function(s) {
  var type = this.type;

  if (/^cols?/.test(type)) {
    return this.shiftcols(s);
  } else if (/^rows?/.test(type)) {
    return this.shiftrows(s);
  }

  return this;
};

/**
 * Shift columns
 */

Selection.prototype.shiftcols = function(s) {
  var grid = this.grid.grid;
  var sel = [];

  this.each(function(v, at) {
    var m = match(at);
    var shifted = ntol(lton(m[1]) + s) + m[2];
    sel.push(shifted);
    delete grid[at];
    grid[shifted] = v;
  });

  this.selection = sel;
  return this;
};


/**
 * Shift rows
 */

Selection.prototype.shiftrows = function(s) {
  var grid = this.grid.grid;
  var sel = [];

  this.each(function(v, at) {
    var m = match(at);
    var shifted = m[1] + (+m[2] + s);
    sel.push(shifted);
    delete grid[at];
    grid[shifted] = v;
  });

  this.selection = sel;
  return this;
};

/**
 * is
 */

Selection.prototype.is = function() {
  var types = slice.call(arguments);
  var re = new RegExp('^(' + types.join('|') + ')$');
  return re.test(type(this.expr));
};


/**
 * fill
 */

Selection.prototype.fill = function(v) {
  var sel  = this.selection;
  var grid = this.grid.grid;
  for (var i = 0, at; at = sel[i]; i++) grid[at] = v;
  return this;
};

/**
 * rows
 */

Selection.prototype.rows = function() {
  var sel = this.selection;
  var buckets = {};
  var rows = [];
  var number;

  for (var i = 0, cell; cell = sel[i]; i++) {
    number = match(cell)[2];
    if (!buckets[number]) buckets[number] = [];
    buckets[number].push(cell);
  }

  return buckets;  
};

/**
 * cols
 */

Selection.prototype.cols = function() {
  var sel = this.selection;
  var buckets = {};
  var cols = [];
  var letter;

  for (var i = 0, cell; cell = sel[i]; i++) {
    letter = match(cell)[1];
    if (!buckets[letter]) buckets[letter] = [];
    buckets[letter].push(cell);
  }

  return buckets;
};

/**
 * empty
 */

Selection.prototype.empty = function() {
  var grid = this.grid.grid;
  var sel = this.selection;

  for (var i = 0, at; at = sel[i]; i++) {
    if (grid[at]) return false;
  }

  return true;
};


/**
 * toString
 */

Selection.prototype.toString = function() {
  var max = this.max();
  var maxlen = (''+max).length;
  var grid = this.grid.grid;
  var rows = this.rows();
  var cols = this.cols();
  var maxrow = 0;
  var out = [];
  var row;
  var r;

  // get the maxrow length
  for (var k in rows) maxrow = maxrow > k ? maxrow : k
  maxrow = (''+maxrow).length;

  // add the column headers
  row = pad('', maxrow) + ' ';
  for (var l in cols) row += pad(l, maxlen);
  row += ' ';
  out.push(row);

  // iterate over the rows
  for (var k in rows) {
    r = rows[k];
    row = pad(k, maxrow) + '|';
    for (var i = 0, at; at = r[i]; i++) {
      row += pad(grid[at] || '·', maxlen);
    }
    row += '|';
    out.push(row);
  }

  return out.join('\n');

  // padding function
  function pad(n, max, str) {
    str = str || ' '
    var len = max - (''+n).length;
    var padding = new Array(len + 1).join(str);
    return str + padding + n + str;
  }
};

/**
 * Delegate back to grid
 */

['select', 'all'].forEach(function(fn) {
  Selection.prototype[fn] = function() {
    return this.grid[fn].apply(this.grid, arguments);
  }
});
