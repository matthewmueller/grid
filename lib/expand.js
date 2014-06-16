/**
 * Module Dependencies
 */

var regexp = require('./regexp');
var tokens = require('./tokens');
var type = require('./type');
var utils = require('./utils');
var lton = utils.lton;
var ntol = utils.ntol;

/**
 * Export `expand`
 */

module.exports = expand;

/**
 * Expand the selection
 *
 * @param {String|Array} selection
 * @param {Number} maxcol
 * @param {Number} maxrow
 * @return {Array}
 */

function expand(selection, maxcol, maxrow) {
  var toks = tokens(selection);
  var out = [];

  for (var i = 0, tok; tok = toks[i]; i++) {
    switch (type(tok)) {
      case 'block':
        m = regexp.block.exec(tok);
        out = out.concat(range(m[1], m[2], maxcol, maxrow));
        break;
      case 'row':
        m = regexp.row.exec(tok);
        var n = +m[1];
        var start = 'A' + n;
        var end = ntol(maxcol - 1) + n;
        out = out.concat(range(start, end, maxcol, maxrow));
        break;
      case 'rows':
        m = regexp.rows.exec(tok);
        var start = 'A' + m[1];
        var end = ntol(maxcol - 1) + m[2];
        out = out.concat(range(start, end, maxcol, maxrow));
        break;
      case 'col':
        m = regexp.col.exec(tok);
        var l = m[1];
        var start = l + 1;
        var end = l + maxrow;
        out = out.concat(range(start, end, maxcol, maxrow));
        break;
      case 'cols':
        m = regexp.cols.exec(tok);
        var start = m[1] + '1';
        var end = m[2] + maxrow;
        out = out.concat(range(start, end, maxcol, maxrow));
        break;
      case 'cell':
        out = out.concat(range(tok, tok, maxcol, maxrow));
    }
  }

  return out
};

/**
 * Expand a selection into it's range
 *
 * @param {String} from
 * @param {String} to
 * @return {Array}
 */

function range(from, to, maxcol, maxrow) {
  var out = [];

  var start = regexp.cell.exec(from);
  if (!start) throw new Error('invalid expansion: ' + from);
  var sc = Math.min(lton(start[1]), maxcol);
  var sr = Math.min(+start[2], maxrow);

  var end = regexp.cell.exec(to);
  if (!end) throw new Error('invalid expansion: ' + to);
  var ec = Math.min(lton(end[1]), maxcol);
  var er = Math.min(+end[2], maxrow);

  for (var i = sr; i <= er; i++) {
    for (var j = sc; j <= ec; j++) {
      out[out.length] = ntol(j) + i;
    }
  }

  return out;
}
