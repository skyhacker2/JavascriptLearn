define(function(require) {
	var $ = require('jquery');
	var array = require('./array');
	
	var _escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
	var _meta = {
		'\b': '\\b',
		'\t': '\\t',
		'\n': '\\n',
		'\f': '\\f',
		'\r': '\\r',
		'"' : '\\"',
		'\\': '\\\\'
	};
	
	function _quote(str) {
		_escapable.lastIndex = 0;
		return _escapable.test(str) ? '"' + str.replace(_escapable, function(c) {
			return _meta[c] || '\\u' + ('0000' + c.charCodeAt(0).toString(16)).slice(-4)
		}) + '"' : '"' + str + '"';
	};
	
	return {
		parse: function(str) {
			return typeof JSON != 'undefined' ? JSON.parse(str) : eval('(' + str + ')');
		},
		
		stringify: function(obj, prettify, objIndentLevel) {
			if(typeof JSON != 'undefined') {
				return JSON.stringify(obj);
			}
			var self = this;
			var res, tmp, indent, newLine, colon, comma;
			if(prettify) {
				objIndentLevel = objIndentLevel || 1;
				newLine = '\n';
				colon = ': ';
				comma = ', ';
			} else {
				objIndentLevel = 0;
				newLine = '';
				colon = ':';
				comma = ',';
			}
			switch(typeof obj) {
			case 'string':
				res = _quote(obj);
				break;
			case 'boolean':
				res = obj.toString();
				break;
			case 'number':
				if(isNaN(obj)) {
					throw new Error('NaN not supported.');
				} else if(!isFinite(obj)) {
					throw new Error('Infinite number not supported.');
				} else {
					res = obj.toString();
				}
				break;
			case 'object':
				if(!obj) {
					res = 'null';
					break;
				}
				tmp = [];
				if(obj.__RFL_JSON_STRINGIFY_MARKED__) {
					throw new Error('rfl.json.stringify can not deal with circular reference.');
				}
				obj.__RFL_JSON_STRINGIFY_MARKED__ = 1;
				if(array.isArray(obj)) {
					$.each(obj, function(key, val) {
						var s = self.stringify(val, prettify, objIndentLevel);
						s && tmp.push(s);
					})
					res = '[' + tmp.join(comma) + ']';
				} else {
					indent = [];
					for(var i = 0; i < objIndentLevel; i++) {
						indent.push('    ');
					}
					$.each(obj, function(key, val) {
						if(key == '__RFL_JSON_STRINGIFY_MARKED__') {
							return;
						}
						if(obj.hasOwnProperty(key)) {
							var s = self.stringify(val, prettify, objIndentLevel + 1);
							s && tmp.push(indent.join('') + _quote(key) + colon + s);
						}
					})
					indent.pop();
					if(tmp.length) {
						res = '{' + newLine + tmp.join(comma + newLine) + newLine + indent.join('') + '}';
					} else {
						res = '{}';
					}
				}
				delete obj.__RFL_JSON_STRINGIFY_MARKED__;
				break
			default:
				throw new Error(typeof obj + ' type not supported.');
			}
			return res;
		}
	}
});
