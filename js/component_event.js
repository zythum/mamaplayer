var createElement  = require('./createElement')
var delegateClick  = require('./delegateClickByClassName')
var timeFormat     = require('./timeFormat')

function makeArray (arrayLike) {
	return Array.prototype.slice.call(arrayLike);
}

function progressAnchor (anchor, document, willSet, set) {
	var draging = false

	willSet = willSet || function () {}
	set     = set     || function () {}

	function getPst (e) {
		var pst = (e.clientX - anchor.parentNode.getBoundingClientRect().left) / (anchor.parentNode.offsetWidth)
		return Math.min(Math.max(pst, 0), 1)
	}

	function mousedown (e) {
		if (e.which == 1) {
			draging = true
			anchor.draging = true
			mousemove(e)
		}
	}
	function mousemove (e) {
		if (e.which == 1 && draging === true) {
			var pst = getPst(e)
			willSet( pst )
		}
	}
	function mouseup (e) {
		if (e.which == 1 && draging === true) {
			var pst = getPst(e)
			willSet(pst)
			set(pst)
			draging = false
			delete anchor.draging
		}
	}

	anchor.parentNode.addEventListener('mousedown', mousedown)
	document.addEventListener('mousemove', mousemove)
	document.addEventListener('mouseup', mouseup)
}


module.exports = {
	init: function () {
		var doc        = this.iframe.contentDocument;
		var clickEvent = delegateClick(doc)
		
		clickEvent.on('play', this.onPlayClick, this)
		clickEvent.on('video-frame', this.onVideoClick, this)
		clickEvent.on('source', this.onSourceClick, this)
		clickEvent.on('allscreen', this.onAllScreenClick, this)
		clickEvent.on('fullscreen', this.onfullScreenClick, this)
		clickEvent.on('normalscreen', this.onNormalScreenClick, this)
		clickEvent.on('comments-btn', this.oncommentsBtnClick, this)

		this.DOMs.player.addEventListener('mousemove', this.onMouseActive.bind(this));

		progressAnchor(this.DOMs.progress_anchor, doc, this.onProgressAnchorWillSet.bind(this), this.onProgressAnchorSet.bind(this))
		progressAnchor(this.DOMs.volume_anchor, doc, this.onVolumeAnchorWillSet.bind(this))
	},
	onVideoClick: function () {		
		if (this.videoClickDblTimer == undefined) {
			this.videoClickDblTimer = setTimeout(function () {				
				this.videoClickDblTimer = undefined
				//single click
				this.onPlayClick();

			}.bind(this), 300)
		} else {
			clearTimeout(this.videoClickDblTimer)
			this.videoClickDblTimer = undefined
			//dbl click
			document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement ? 
				this.onNormalScreenClick() : this.onfullScreenClick()
		}
	},
	onMouseActive: function () {
		this.DOMs.player.classList.add('active')
		clearTimeout(this.MouseActiveTimer)
		this.MouseActiveTimer = setTimeout(function () {
			this.DOMs.player.classList.remove('active')
		}.bind(this), 1000)
	},
	onPlayClick: function () {
		if (this.DOMs.play.classList.contains('paused')) {
			this.video.play()
			this.DOMs.play.classList.remove('paused')
		} else {
			this.video.pause()
			this.DOMs.play.classList.add('paused')
		}
	},
	onSourceClick: function (el) {
		if (el.classList.contains('curr')) return
		this.video.preloadStartTime = this.video.currentTime
		this.video.src = this.sourceList[el.getAttribute('sourceIndex') | 0][1]
		makeArray(el.parentNode.childNodes).forEach(function (_el) {
			el === _el ? _el.classList.add('curr') : _el.classList.remove('curr')
		}.bind(this))
	},
	onProgressAnchorWillSet: function (pst) {
		var duration    = this.video.duration
		var currentTime = duration * pst
		this.DOMs.current.innerHTML  = timeFormat(currentTime)
		this.DOMs.duration.innerHTML = timeFormat(duration)
		this.DOMs.progress_anchor.style.width = pst*100 + '%'
	},
	onProgressAnchorSet: function (pst) {
		this.video.currentTime = this.video.duration * pst
	},
	onVolumeAnchorWillSet: function (pst) {
		this.video.volume = pst
		this.DOMs.volume_anchor.style.width = pst*100 + '%'
	},
	onAllScreenClick: function () {
		var width = document.documentElement["clientWidth"]
		var height = document.documentElement["clientHeight"]
		this.iframe.style.cssText = ';position:fixed;top:0;left:0;width:'+width+'px;height:'+height+'px;z-index:999999;';

		this.allScreenWinResizeFunction = this.allScreenWinResizeFunction || function () {
			this.iframe.style.width  = document.documentElement["clientWidth"]  + 'px'
			this.iframe.style.height = document.documentElement["clientHeight"] + 'px'
		}.bind(this)
		window.removeEventListener('resize', this.allScreenWinResizeFunction)
		window.addEventListener('resize', this.allScreenWinResizeFunction)
		this.DOMs.player.classList.add('allscreen')
	},
	onfullScreenClick: function () {
		['webkitRequestFullScreen', 'mozRequestFullScreen', 'requestFullScreen'].forEach((function (fullScreen) {
			if (this.DOMs.player[fullScreen]) {
				this.DOMs.player[fullScreen]()
			}
		}).bind(this))
		this.onMouseActive()
	},
	onNormalScreenClick: function () {
		window.removeEventListener('resize', this.allScreenWinResizeFunction)
		this.iframe.style.cssText = ';width:'+this.size[0]+'px;height:'+this.size[1]+'px;';
		['webkitCancelFullScreen', 'mozCancelFullScreen', 'cancelFullScreen'].forEach(function (fullScreen) {
			if (document[fullScreen]) {
				document[fullScreen]()
			}
		})
		this.DOMs.player.classList.remove('allscreen')
	},
	oncommentsBtnClick: function () {
		this.enableComment = !this.DOMs['comments-btn'].classList.contains('enable')
		if (this.enableComment) {
			setTimeout(function () {
				this.DOMs.comments.style.display = 'block'
			}.bind(this), 80)
			this.DOMs['comments-btn'].classList.add('enable')
		} else {
			this.DOMs.comments.style.display = 'none'
			this.DOMs['comments-btn'].classList.remove('enable')
		}
		
	}
}