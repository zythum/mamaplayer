var extend = require('./extend')

function component (Base, components) {
	var inits = [];

	for (var i=1; i<arguments.length; i++) {
		var _component = arguments[i]
		var _init = _component.init

		inits.push(_init)
		delete _component.init
		extend(Base.prototype, _component);
	}
	Base.prototype.init = function () {
		inits.forEach(function (initFunction) {
			initFunction.call(this)
		}.bind(this))
	}
}
module.exports = component