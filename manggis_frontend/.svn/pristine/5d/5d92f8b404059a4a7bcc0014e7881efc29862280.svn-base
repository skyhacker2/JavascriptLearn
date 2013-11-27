define(function(require) {
	function _getByteLength(str) {
		return str.replace(/[^\x00-\xff]/g, 'xx').length;
	};

	return function(item, maxLen) {
		item = $(item)[0];
		var inputLen = _getByteLength(item.value);
		var passed = inputLen <= maxLen;
		return {
			passed: passed,
			msgData: [maxLen, inputLen - maxLen]
		};
	};
});
