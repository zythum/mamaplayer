function extend(target) {
	var length = arguments.length, i = 1, mixin
	while (i < length) {
		mixin = arguments[i++]
		for (var name in mixin) if (mixin.hasOwnProperty(name)) target[name] = mixin[name]
	}
	return target
}
module.exports = extend