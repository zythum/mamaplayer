var css            = require('./player.css')
var html           = require('./player.html')

var extend         = require('./extend')
var createElement  = require('./createElement')
var parseDOM       = require('./parseDOMByClassNames')

module.exports = {
	init: function () {
		var setContent = (function () {
			var head = this.iframe.contentDocument.getElementsByTagName('head')[0]
			var body = this.iframe.contentDocument.body
			//处理样式
			createElement('style', function () {
				head.appendChild(this);
				try {
					this.styleSheet.cssText = css
				} catch (e) {
					this.appendChild( document.createTextNode(css) )
				}
			})
			createElement('link', {
				appendTo: head,
				href: "http://libs.cncdn.cn/font-awesome/4.3.0/css/font-awesome.min.css",
				rel: "stylesheet",
				type: "text/css"
			})

			//处理页面html
			body.innerHTML = html
			this.DOMs = parseDOM(body, ['player', 'video', 'video-frame', 'comments', 'comments-btn', 'play', 'progress_anchor', 'buffered_anchor', 'fullscreen', 'allscreen', 'hd', 'volume_anchor', 'current', 'duration'])

			//处理video标签
			this.video = this.DOMs.video

		}).bind(this)

		var placeHolder = document.getElementById(this.id)
		var iframe = this.iframe = createElement('iframe', {
			allowTransparency: true,
			frameBorder: 'no',
			scrolling: 'no',
			src: 'about:blank',
			mozallowfullscreen: "mozallowfullscreen",
			webkitallowfullscreen: "webkitallowfullscreen",
			style: {
				width: this.size[0] + 'px',
				height: this.size[1] + 'px',
				overflow: 'hidden'
			}
		})
		if (placeHolder && placeHolder.parentNode) {
			placeHolder.parentNode.replaceChild(iframe, placeHolder)
			setContent();
		} else {
			document.body.appendChild(iframe)
			setContent();
			document.body.removeChild(iframe)
		}
	}
}
