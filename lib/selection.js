/**
 * Module dependencies
 */

var isArray = Array.isArray;
var type = require('./type');
var match = require('./match');
var expand = require('./expand');
var intersect = require('intersect');

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
  this.maxrow = grid.maxrow;
  this.maxcol = grid.maxcol;
}

/**
 * each
 */

Selection.prototype.forEach = function(fn) {
  var grid = this.grid.grid;
  var sel = this.selection;

  for (var i = 0, at; at = sel[i]; i++) {
    var ret = fn(grid[at], at, i);
    if (undefined !== ret) grid[at] = ret;
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

  this.forEach(function(v, at, i) {
    return arr[i];
  });

  return this;
};

/**
 * max
 */

Selection.prototype.max = function() {
  var max = 0;
  
  this.forEach(function(v, at) {
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
  var expanded = this.expandRight().selection.reverse();
  var grid = this.grid.grid;
  var maxcol = this.maxcol;

  // shift the cells
  for (var i = 0, at; at = expanded[i]; i++) {
    var m = match(at);
    var l = ntol(lton(m[1]) + s);
    if (l > maxcol) continue;
    var shifted = l + m[2];
    grid[shifted] = grid[at];
    delete grid[at];
  }

  return this;
};


/**
 * Shift rows
 */

Selection.prototype.shiftrows = function(s) {
  var expanded = this.expandDown().selection.reverse();
  var grid = this.grid.grid;
  var maxrow = this.maxrow;

  // shift the cells
  for (var i = 0, at; at = expanded[i]; i++) {
    var m = match(at);
    var n = +m[2] + s;
    if (n > maxrow) continue;
    var shifted = m[1] + n;
    grid[shifted] = grid[at];
    delete grid[at];
  }

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
  this.forEach(function() { return v; });
  return this;
};

/**
 * get
 */

Selection.prototype.get = function(i) {
  var sel = this.selection;
  i = i < 0 ? sel.length + i : i;
  var grid = this.grid.grid;
  var at = sel[i];

  return at
    ? new Selection(at, this)
    : null;
};


/**
 * rows
 */

Selection.prototype.rows = function() {
  var sel = this.selection;
  var buckets = {};
  var rows = [];
  var number;

  this.forEach(function(v, at) {
    number = match(at)[2];
    if (!buckets[number]) buckets[number] = [];
    buckets[number].push(at);
  });

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

  this.forEach(function(v, at) {
    letter = match(at)[1];
    if (!buckets[letter]) buckets[letter] = [];
    buckets[letter].push(at);
  })

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
  for (var k in rows) maxrow = maxrow > +k ? maxrow : +k
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
 * Expand Right
 */

Selection.prototype.expandRight = function() {
  var sel = this.selection;
  var last = this.maxcol;
  var sels = [];

  this.forEach(function(v, at) {
    sels.push(at + ':' + last + match(at)[2]);
  });

  return new Selection(sels.join(','), this);
};

/**
 * Expand Down
 */

Selection.prototype.expandDown = function() {
  var sel = this.selection;
  var last = this.maxrow;
  var sels = [];

  this.forEach(function(v, at) {
    sels.push(at + ':' + match(at)[1] + last);
  });

  return new Selection(sels.join(','), this);
};

/**
 * json
 */

Selection.prototype.json = function() {
  var obj = {};
  
  this.forEach(function(v, at) {
    obj[at] = v;
  });

  return obj;
};

/**
 * find
 */

Selection.prototype.find = function(expr) {
  var filtered = Selection(expr, this).selection;
  var sel = intersect(this.selection, filtered);
  return new Selection(sel.join(','), this.grid);
};



/**
 * Delegate back to grid
 */

['select', 'all', 'at'].forEach(function(fn) {
  Selection.prototype[fn] = function() {
    return this.grid[fn].apply(this.grid, arguments);
  }
});

