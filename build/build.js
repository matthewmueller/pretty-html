
/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module._resolving && !module.exports) {
    var mod = {};
    mod.exports = {};
    mod.client = mod.component = true;
    module._resolving = true;
    module.call(this, mod.exports, require.relative(resolved), mod);
    delete module._resolving;
    module.exports = mod.exports;
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("component-domify/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Expose `parse`.\n\
 */\n\
\n\
module.exports = parse;\n\
\n\
/**\n\
 * Wrap map from jquery.\n\
 */\n\
\n\
var map = {\n\
  legend: [1, '<fieldset>', '</fieldset>'],\n\
  tr: [2, '<table><tbody>', '</tbody></table>'],\n\
  col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],\n\
  _default: [0, '', '']\n\
};\n\
\n\
map.td =\n\
map.th = [3, '<table><tbody><tr>', '</tr></tbody></table>'];\n\
\n\
map.option =\n\
map.optgroup = [1, '<select multiple=\"multiple\">', '</select>'];\n\
\n\
map.thead =\n\
map.tbody =\n\
map.colgroup =\n\
map.caption =\n\
map.tfoot = [1, '<table>', '</table>'];\n\
\n\
map.text =\n\
map.circle =\n\
map.ellipse =\n\
map.line =\n\
map.path =\n\
map.polygon =\n\
map.polyline =\n\
map.rect = [1, '<svg xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\">','</svg>'];\n\
\n\
/**\n\
 * Parse `html` and return the children.\n\
 *\n\
 * @param {String} html\n\
 * @return {Array}\n\
 * @api private\n\
 */\n\
\n\
function parse(html) {\n\
  if ('string' != typeof html) throw new TypeError('String expected');\n\
\n\
  // tag name\n\
  var m = /<([\\w:]+)/.exec(html);\n\
  if (!m) return document.createTextNode(html);\n\
\n\
  html = html.replace(/^\\s+|\\s+$/g, ''); // Remove leading/trailing whitespace\n\
\n\
  var tag = m[1];\n\
\n\
  // body support\n\
  if (tag == 'body') {\n\
    var el = document.createElement('html');\n\
    el.innerHTML = html;\n\
    return el.removeChild(el.lastChild);\n\
  }\n\
\n\
  // wrap map\n\
  var wrap = map[tag] || map._default;\n\
  var depth = wrap[0];\n\
  var prefix = wrap[1];\n\
  var suffix = wrap[2];\n\
  var el = document.createElement('div');\n\
  el.innerHTML = prefix + html + suffix;\n\
  while (depth--) el = el.lastChild;\n\
  console.log(el.firstChild, el.lastChild);\n\
  // one element\n\
  if (el.firstChild == el.lastChild) {\n\
    return el.removeChild(el.firstChild);\n\
  }\n\
\n\
  // several elements\n\
  var fragment = document.createDocumentFragment();\n\
  while (el.firstChild) {\n\
    fragment.appendChild(el.removeChild(el.firstChild));\n\
  }\n\
\n\
  return fragment;\n\
}\n\
//@ sourceURL=component-domify/index.js"
));
require.register("pretty-html/index.js", Function("exports, require, module",
"/**\n\
 * Module dependencies\n\
 */\n\
\n\
var slice = [].slice;\n\
\n\
/**\n\
 * Export `Pretty`\n\
 */\n\
\n\
module.exports = Pretty;\n\
\n\
/**\n\
 * Initialize `Pretty`\n\
 *\n\
 * @param {Object} dom\n\
 */\n\
\n\
function Pretty(dom) {\n\
  if (!(this instanceof Pretty)) return new Pretty(dom);\n\
  this.dom = dom;\n\
}\n\
\n\
/**\n\
 * Get an HTML representation\n\
 *\n\
 * @return {String} html\n\
 * @api public\n\
 */\n\
\n\
Pretty.prototype.html = function() {\n\
  var lines = [];\n\
  var prefix = '<div class=\"pretty-html\"><div class=\"line\">';\n\
  var suffix = '</div></div>';\n\
  var line;\n\
\n\
  this.walk(this.dom, function(node, depth) {\n\
    line = '<span class=\"depth depth-' + depth + '\">';\n\
    line += repeat('&nbsp;&nbsp;', depth);\n\
    line += '</span>';\n\
\n\
    if (3 == node.nodeType) {\n\
      line += '<span class=\"text\">' + htmlspaces(node.nodeValue) + '</span class=\"text\">';\n\
    } else if (1 == node.nodeType) {\n\
      line += '<span class=\"element\">';\n\
      line += node.nodeName.toLowerCase();\n\
\n\
      var attrs = attributes(node.attributes);\n\
      var arr = [];\n\
      if (!empty(attrs)) {\n\
        for (var k in attrs) arr.push(k + \" = '\" + attrs[k] + \"'\");\n\
        line += ' | ' + arr.join(', ') + '';\n\
      }\n\
\n\
      line += '</span>';\n\
    }\n\
\n\
    lines.push(line);\n\
  });\n\
\n\
  return prefix + lines.join('</div><div class=\"line\">') + suffix;\n\
};\n\
\n\
/**\n\
 * Get a console representation\n\
 *\n\
 * @return {String} html\n\
 * @api public\n\
 */\n\
\n\
Pretty.prototype.text = function() {\n\
  var lines = [];\n\
  var line;\n\
\n\
  this.walk(this.dom, function(node, depth) {\n\
    line = repeat('  ', depth);\n\
    if (3 == node.nodeType) {\n\
      line += \"'\" + spaces(node.nodeValue) + \"'\";\n\
    } else if (1 == node.nodeType) {\n\
      line += '[ ' + node.nodeName.toLowerCase();\n\
\n\
      var attrs = attributes(node.attributes);\n\
      var arr = [];\n\
      if (!empty(attrs)) {\n\
        for (var k in attrs) arr.push(k + \" = '\" + attrs[k] + \"'\");\n\
        line += ' | ' + arr.join(', ') + '';\n\
      }\n\
      line += ' ]';\n\
    }\n\
\n\
    lines.push(line);\n\
  })\n\
\n\
  return lines.join('\\n\
');\n\
};\n\
\n\
/**\n\
 * Walk the DOM tree\n\
 */\n\
\n\
Pretty.prototype.walk = function(node, fn, depth) {\n\
  depth = depth || 0;\n\
  fn(node, depth);\n\
\n\
  var children = node.childNodes;\n\
  for (var i = 0, len = children.length; i < len; i++) {\n\
    this.walk(children[i], fn, depth + 1);\n\
  }\n\
};\n\
\n\
/**\n\
 * Parse attributes\n\
 *\n\
 * @param {Object|NamedNodeMap} attrs\n\
 * @return {Object}\n\
 */\n\
\n\
function attributes(attrs) {\n\
  if (undefined == attrs.item && undefined == attrs.length) return attrs;\n\
  attrs = slice.call(attrs);\n\
  var out = {};\n\
\n\
  for (var i = 0, len = attrs.length; i < len; i++) {\n\
    out[attrs[i].name] = attrs[i].value;\n\
  }\n\
\n\
  return out;\n\
}\n\
\n\
/**\n\
 * Repeat a string `n` times\n\
 *\n\
 * @param {String} str\n\
 * @param {Number} n\n\
 * @return {String}\n\
 */\n\
\n\
function repeat(str, n) {\n\
  return new Array(+n + 1).join(str);\n\
}\n\
\n\
/**\n\
 * Check if the object is empty\n\
 *\n\
 * @param {Object} obj\n\
 * @return {Boolean}\n\
 */\n\
\n\
function empty(obj) {\n\
  for(var key in obj) {\n\
    if(obj.hasOwnProperty(key)) return false;\n\
  }\n\
  return true;\n\
}\n\
\n\
/**\n\
 * Convert text into visible spaces\n\
 *\n\
 * @param {String} str\n\
 * @return {String} str\n\
 * @api private\n\
 */\n\
\n\
function spaces(str) {\n\
  return str\n\
    .replace(/ /g, '·')\n\
    .replace(/\\r/g, '¬')\n\
    .replace(/\\t/g, '‣')\n\
    .replace(/\\n\
/g, '¬')\n\
}\n\
\n\
/**\n\
 * Convert text into (styleable) visible spaces\n\
 *\n\
 * @param {String} str\n\
 * @return {String} str\n\
 * @api private\n\
 */\n\
\n\
function htmlspaces(str) {\n\
  return str\n\
    .replace(/ /g, '<span class=\"whitespace space\">·</span>')\n\
    .replace(/\\r/g, '<span class=\"whitespace newline\">¬</span>')\n\
    .replace(/\\t/g, '<span class=\"whitespace tab\">‣</span>')\n\
    .replace(/\\n\
/g, '<span class=\"whitespace newline\">¬</span>')\n\
}\n\
//@ sourceURL=pretty-html/index.js"
));
require.alias("component-domify/index.js", "pretty-html/deps/domify/index.js");
require.alias("component-domify/index.js", "domify/index.js");

require.alias("pretty-html/index.js", "pretty-html/index.js");