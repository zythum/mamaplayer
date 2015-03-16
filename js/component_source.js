var extend         = require('./extend')
var createElement  = require('./createElement')
var parseDOM       = require('./parseDOMByClassNames')

module.exports = {
	init: function () {
		//处理sourceList	
		var loadIndex = 0	
		this.sourceList.forEach(function(source, index) {
			createElement('li', {
				appendTo: this.DOMs.hd,
				sourceIndex: index,
				className: 'source ' + (index === loadIndex ? 'curr' : ''),
				innerHTML: source[0]
			})
		}.bind(this))
		this.DOMs.video.src = this.sourceList[loadIndex][1]
	}
}