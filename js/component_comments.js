var createElement = require('./createElement')
var commentLoopSpeed = 0.1 // px/ms
var commentRowHeight = 25 // px
var commentButtonOrTopShowDuration = 4000// ms
var fontStyle = 'bold 18px "PingHei","Lucida Grande", "Lucida Sans Unicode", "STHeiti", "Helvetica","Arial","Verdana","sans-serif"'
module.exports = {
	init: function () {
		setInterval(this.onCommentTimeUpdate.bind(this), 80)
		this.lastCommnetUpdateTime = 0
		this.lastCommnetIndex = 0
		
		this.commentLoopPreQueue = []
		this.commentLoopQueue = []

		this.commentButtonPreQueue = []
		this.commentButtonQueue = []

		this.commentTopPreQueue = []
		this.commentTopQueue = []

		this.enableComment = this.comments === undefined ? false : true

		this.canvas = this.DOMs.comments.getContext('2d')
		
		this.DOMs.player.classList.add('has-comments')
		this.DOMs['comments-btn'].classList.add('enable')
		this.DOMs.comments.display = this.enableComment ? 'block' : 'none'
	},
	drawText: function (text, left, top, color) {
		this.canvas.fillStyle = color
		this.canvas.strokeText(text, left|0, top|0)
		this.canvas.fillText(text, left|0, top|0)
	},
	drawCommentTop: function () {
		var t = Date.now()
		
		this.canvas.textAlign = 'center'

		this.commentTopQueue.forEach(function (comment, index) {
			if (comment != undefined) {
				if (t > comment.startTime + commentButtonOrTopShowDuration) {
					this.commentTopQueue[index] = undefined
				} else {
					this.drawText(comment.text, this.canvasWidth/2,  commentRowHeight * (index+1), comment.color)
				}
			}
		}.bind(this))
		var comment
		while(comment = this.commentTopPreQueue.shift()) {
			comment = {
				startTime: t,
				text: comment.text,
				color: comment.color
			}
			this.commentTopQueue.forEach(function (_comment, index) {
				if (comment && _comment === undefined) {
					_comment = this.commentTopQueue[index] = comment
					this.drawText(_comment.text, this.canvasWidth/2,  commentRowHeight * (index+1), _comment.color)
					comment = undefined
				}
			}.bind(this))
			if (comment) {
				this.commentTopQueue.push(comment)
				this.drawText(comment.text, this.canvasWidth/2,  commentRowHeight * this.commentTopQueue.length, comment.color)
			}
		}
	},
	drawCommentBottom: function () {
		var t = Date.now()
		var videoHeight = this.video.offsetHeight + 10
		
		this.canvas.textAlign = 'center'

		this.commentButtonQueue.forEach(function (comment, index) {
			if (comment != undefined) {
				if (t > comment.startTime + commentButtonOrTopShowDuration) {
					this.commentButtonQueue[index] = undefined
				} else {					
					this.drawText(comment.text, this.canvasWidth/2,  videoHeight - commentRowHeight * (index+1), comment.color)
				}
			}
		}.bind(this))
		var comment
		while(comment = this.commentButtonPreQueue.shift()) {
			comment = {
				startTime: t,
				text: comment.text,
				color: comment.color
			}
			this.commentButtonQueue.forEach(function (_comment, index) {
				if (comment && _comment === undefined) {
					_comment = this.commentButtonQueue[index] = comment
					this.drawText(_comment.text, this.canvasWidth/2,  videoHeight - commentRowHeight * (index+1), _comment.color)
					comment = undefined
				}
			}.bind(this))
			if (comment) {
				this.commentButtonQueue.push(comment)
				this.drawText(comment.text, this.canvasWidth/2, videoHeight - commentRowHeight * (this.commentButtonQueue.length), comment.color)
			}
		}
	},
	createLoopComment: function (comment, startTime) {
		if (comment === undefined) return false
		return {
			startTime: startTime,
			text: comment.text,
			color: comment.color,
			width: this.canvas.measureText(comment.text).width + 20
		}
	},
	drawCommentLoop: function () {
		var t = Date.now()

		var videoWidth  = this.video.offsetWidth
		var videoHeight = this.video.offsetHeight
		
		var canvasWidth = this.canvasWidth
		var canvasHeight = this.canvasHeight
		
		this.canvas.textAlign = 'left'

		var rows = (videoHeight / commentRowHeight) | 0

		var i = -1
		while (++i < rows) {
			var thisCommentLoopQueue = this.commentLoopQueue[i]
			if (thisCommentLoopQueue === undefined) thisCommentLoopQueue = this.commentLoopQueue[i] = []
			if (this.commentLoopPreQueue.length > 0) {
				var last = thisCommentLoopQueue.length === 0 ? undefined : thisCommentLoopQueue[thisCommentLoopQueue.length - 1]
				if ( last === undefined || (t - last.startTime) * commentLoopSpeed > last.width ) {
					var newCommentLoop = this.createLoopComment(this.commentLoopPreQueue.shift(), t)
					newCommentLoop && thisCommentLoopQueue.push(newCommentLoop)
				}
			}
			this.commentLoopQueue[i] = thisCommentLoopQueue.filter(function (comment) {
				var nowPos = (t - comment.startTime) * commentLoopSpeed
				if (nowPos < 0 || nowPos > comment.width + videoWidth) {
					return false
				} else {										
					this.drawText(comment.text, canvasWidth - nowPos, commentRowHeight * i + 20, comment.color)
					return true
				}
			}.bind(this))
		}
		var j = this.commentLoopQueue.length - rows
		while (j-- > 0) {
			this.commentLoopQueue.pop()
		}
	},
	drawComment: function () {
		var canvasWidth = this.DOMs['video-frame'].offsetWidth
		var canvasHeight = this.DOMs['video-frame'].offsetHeight
		if (canvasWidth != this.canvasWidth) {
			this.DOMs.comments.setAttribute('width',  canvasWidth)
			this.canvasWidth = canvasWidth
		}
		if (canvasHeight != this.canvasHeight) {
			this.DOMs.comments.setAttribute('height',  canvasHeight)	
			this.canvasHeight = canvasHeight
		}
		this.canvas.clearRect(0, 0, this.canvasWidth, this.canvasHeight)
		this.canvas.strokeStyle = 'black'
		this.canvas.lineWidth = 2
		this.canvas.font = fontStyle

		this.drawCommentLoop()
		this.drawCommentTop()
		this.drawCommentBottom()		
	},
	onCommentTimeUpdate: function () {
		if (this.enableComment === false) return
		var currentTime = this.video.currentTime
		if (Math.abs(currentTime - this.lastCommnetUpdateTime) <= 1 && currentTime > this.lastCommnetUpdateTime) {
			var startIndex = 0
			if (this.lastCommnetIndex && this.comments[this.lastCommnetIndex].time <= this.lastCommnetUpdateTime  ) {
				startIndex = this.lastCommnetIndex
			}
			while (++startIndex < this.comments.length) {
				if (this.comments[startIndex].time <= this.lastCommnetUpdateTime) continue
				if (this.comments[startIndex].time > currentTime) break
				switch (this.comments[startIndex].pos) {
					case 'bottom': this.commentButtonPreQueue.push(this.comments[startIndex]); break
					case 'top': this.commentTopPreQueue.push(this.comments[startIndex]); break
					default: this.commentLoopPreQueue.push(this.comments[startIndex])
				}
				this.lastCommnetIndex = startIndex
			}			
		}
		try{ this.drawComment() }catch(e){}
		this.lastCommnetUpdateTime = currentTime
	}
}