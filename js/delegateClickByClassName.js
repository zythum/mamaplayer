var extend = require('./extend')

function makeArray (arrayLike) {
	return Array.prototype.slice.call(arrayLike);
}

function DelegateClickByClassName (rootElement) {
	this._eventMap = {}
	this._rootElement = rootElement
	this._isRootElementBindedClick = false
	
	this._bindClickFunction = function (e) {
		(function loop (handler, target) {
			if (target && target.nodeName) {
				target.classList &&
				makeArray(target.classList).forEach(function (className) {
					handler.trigger(className, target)
				})

				loop(handler, target.parentNode)
			}
		}(this, e.target));
	}.bind(this);
}

extend(DelegateClickByClassName.prototype, {
	on: function (type, func, context) {
		if (this._eventMap[type] === undefined) {
			this._eventMap[type] = [];
		}
		this._eventMap[type].push([func, context]);
		if (!this._isRootElementBindedClick) {
			_isRootElementBindedClick = true
			this._rootElement.addEventListener('click', this._bindClickFunction, false)
		}
	},
	off: function (type, func) {
		if (this._eventMap[type] != undefined) {
			var l = this._eventMap[type].length;
			while( l-- ) {
				if (this._eventMap[type][l][0] === func) {
					this._eventMap[type].splice(l, 1)
					break
				}
			}
		}
		for (var index in this._eventMap) break
		if (index === undefined && !!this._isRootElementBindedClick) {
			_isRootElementBindedClick = false
			this._rootElement.removeEventListener('click', this._bindClickFunction, false)
		}
	},
	trigger: function (type, el) {
		el = el === undefined ? this._rootElement.getElementsByTagNames(type) : [el]
		el.forEach(function (el) {
			(this._eventMap[type] || []).forEach(function (func) {
				func[0].call(func[1], el)
			})
		}.bind(this))
	}
})

module.exports = function (rootElement) {
	return new DelegateClickByClassName(rootElement)
}
