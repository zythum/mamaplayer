var createElement = require('./createElement')
var commentLoopSpeed = 0.1 // px/ms
var commentRowHeight = 25 // px
var commentButtonOrTopShowDuration = 4000// ms
var fontStyle = 'bold 20px "PingHei","Lucida Grande", "Lucida Sans Unicode", "STHeiti", "Helvetica","Arial","Verdana","sans-serif"'

function setCanvasStyle (canvas) {
	canvas.strokeStyle = 'black'
	canvas.lineWidth = 2
	canvas.font = fontStyle
}

var requestAnimationFrame = window.requestAnimationFrame
|| window.mozRequestAnimationFrame
|| window.webkitRequestAnimationFrame
|| window.msRequestAnimationFrame
|| window.oRequestAnimationFrame
|| function(callback) {
setTimeout(callback, 1000 / 60)
};

module.exports = {
	init: function () {		
		this.video.addEventListener('play', this.reStartComment.bind(this))
		this.video.addEventListener('pause', this.pauseComment.bind(this))
		this.lastCommnetUpdateTime = 0
		this.lastCommnetIndex = 0
		
		this.commentLoopPreQueue = []
		this.commentLoopQueue = []

		this.commentButtonPreQueue = []
		this.commentButtonQueue = []

		this.commentTopPreQueue = []
		this.commentTopQueue = []

		this.drawQueue = []

		this.preRenders = []
		this.preRenderMap = {}

		this.enableComment = this.comments === undefined ? false : true
		
		this.canvas = this.DOMs.comments.getContext('2d')
		
		this.DOMs.player.classList.add('has-comments')
		this.DOMs['comments-btn'].classList.add('enable')
		this.DOMs.comments.display = this.enableComment ? 'block' : 'none'

		var loop = function () {
			this.onCommentTimeUpdate()
			requestAnimationFrame(loop)
		}.bind(this)
		loop()
		// setInterval(this.onCommentTimeUpdate.bind(this), 40)
	},
	needDrawText: function (comment, left, top) {
		this.drawQueue.push([comment, left|0, top|0]);
	},
	drawText: function () {
		var canUseCanvasIndex = [];
		this.preRenders.forEach(function (canvas, index) {
			canvas.used = false;
			if (canvas.cid === undefined) {
				canUseCanvasIndex.push(index)
			}
		})

		var one
		while(one = this.drawQueue.shift()) {
			(function (one, _this) {
				var cid = one[0].text + one[0].color
				var index = _this.preRenderMap[cid]
				var canvas				
				if (index === undefined) {
					var index = canUseCanvasIndex.shift()
					if (index === undefined) {
						canvas = document.createElement('canvas')
						index  = _this.preRenders.push(canvas) - 1
					} else {
						canvas = _this.preRenders[index]
					}					
					var width   = canvas.width = one[0].width
					var height  = canvas.height = commentRowHeight+10
					var context = canvas.getContext('2d')
					context.clearRect(0, 0, width, height)
					setCanvasStyle(context)
					context.fillStyle = one[0].color
					context.strokeText(one[0].text, 0, commentRowHeight)					
					context.fillText(one[0].text, 0, commentRowHeight)
					canvas.cid = cid
					_this.preRenderMap[cid] = index
				} else {
					canvas = _this.preRenders[index]
				}
				canvas.used = true
				_this.canvas.drawImage(canvas, one[1], one[2])
			}(one, this))
		}

		this.preRenders.forEach(function (canvas, index) {
			if (canvas.used === false) {
				delete this.preRenderMap[canvas.cid]
				canvas.cid = undefined
			}
		}.bind(this))
		// var one
		// var lastColor		
		// setCanvasStyle(this.canvas)
		// while(one = this.drawQueue.shift()) {
		// 	if (lastColor != one[0].color) {
		// 		this.canvas.fillStyle = lastColor = one[0].color
		// 	}
		// 	this.canvas.strokeText(one[0].text, one[1], one[2])
		// 	this.canvas.fillText(one[0].text, one[1], one[2])
		// }
	},
	createComment: function (comment, startTime) {
		if (comment === undefined) return false
		setCanvasStyle(this.canvas)
		var size = this.canvas.measureText(comment.text);
		return {
			startTime: startTime,
			text: comment.text,
			color: comment.color,
			width: size.width + 20
		}
	},
	commentTop: function (videoWidth, videoHeight, t) {
		this.commentTopQueue.forEach(function (comment, index) {
			if (comment != undefined) {
				if (t > comment.startTime + commentButtonOrTopShowDuration) {
					this.commentTopQueue[index] = undefined
				} else {
					this.needDrawText(comment, (videoWidth-comment.width)/2,  commentRowHeight * index)
				}
			}
		}.bind(this))
		var comment
		while(comment = this.commentTopPreQueue.shift()) {
			comment = this.createComment(comment, t)
			this.commentTopQueue.forEach(function (_comment, index) {
				if (comment && _comment === undefined) {
					_comment = this.commentTopQueue[index] = comment
					this.needDrawText(_comment, (videoWidth-comment.width)/2,  commentRowHeight * index)
					comment = undefined
				}
			}.bind(this))
			if (comment) {
				this.commentTopQueue.push(comment)
				this.needDrawText(comment, (videoWidth-comment.width)/2,  commentRowHeight * this.commentTopQueue.length-1)
			}
		}
	},
	commentBottom: function (videoWidth, videoHeight, t) {
		videoHeight = videoHeight - 10
		this.commentButtonQueue.forEach(function (comment, index) {
			if (comment != undefined) {
				if (t > comment.startTime + commentButtonOrTopShowDuration) {
					this.commentButtonQueue[index] = undefined
				} else {					
					this.needDrawText(comment, (videoWidth-comment.width)/2,  videoHeight - commentRowHeight * (index+1))
				}
			}
		}.bind(this))
		var comment
		while(comment = this.commentButtonPreQueue.shift()) {
			comment = this.createComment(comment, t)
			this.commentButtonQueue.forEach(function (_comment, index) {
				if (comment && _comment === undefined) {
					_comment = this.commentButtonQueue[index] = comment
					this.needDrawText(_comment, (videoWidth-comment.width)/2,  videoHeight - commentRowHeight * (index+1))
					comment = undefined
				}
			}.bind(this))
			if (comment) {
				this.commentButtonQueue.push(comment)
				this.needDrawText(comment, (videoWidth-comment.width)/2, videoHeight - commentRowHeight * this.commentButtonQueue.length)
			}
		}
	},
	commentLoop: function (videoWidth, videoHeight, t) {
		var rows = (videoHeight / commentRowHeight) | 0
		var i = -1
		while (++i < rows) {
			var thisCommentLoopQueue = this.commentLoopQueue[i]
			if (thisCommentLoopQueue === undefined) thisCommentLoopQueue = this.commentLoopQueue[i] = []
			if (this.commentLoopPreQueue.length > 0) {
				var last = thisCommentLoopQueue.length === 0 ? undefined : thisCommentLoopQueue[thisCommentLoopQueue.length - 1]
				if ( last === undefined || (t - last.startTime) * commentLoopSpeed > last.width ) {
					var newCommentLoop = this.createComment(this.commentLoopPreQueue.shift(), t)
					newCommentLoop && thisCommentLoopQueue.push(newCommentLoop)
				}
			}
			this.commentLoopQueue[i] = thisCommentLoopQueue.filter(function (comment) {
				var nowPos = (t - comment.startTime) * commentLoopSpeed
				if (nowPos < 0 || nowPos > comment.width + videoWidth) {
					return false
				} else {										
					this.needDrawText(comment, videoWidth - nowPos, commentRowHeight * i)
					return true
				}
			}.bind(this))
		}
		var j = this.commentLoopQueue.length - rows
		while (j-- > 0) {
			this.commentLoopQueue.pop()
		}
	},
	pauseComment: function () {
		this.pauseCommentAt = Date.now();
	},
	reStartComment: function () {
		if (this.pauseCommentAt) {
			var _t = Date.now() - this.pauseCommentAt
			this.commentLoopQueue.forEach(function (queue) {
				queue.forEach(function (comment) {
					if (comment) comment.startTime += _t
				})
			})
			this.commentButtonQueue.forEach(function (comment) {
				if (comment) comment.startTime += _t
			})
			this.commentTopQueue.forEach(function (comment) {
				if (comment) comment.startTime += _t
			})
		}
		this.pauseCommentAt = undefined;	
	},
	drawComment: function () {
		if (!this.pauseCommentAt) {
			var t = Date.now()
			var canvasWidth = this.DOMs['video-frame'].offsetWidth
			var canvasHeight = this.DOMs['video-frame'].offsetHeight
			if (canvasWidth != this.canvasWidth) {
				this.DOMs.comments.width = canvasWidth
				this.canvasWidth = canvasWidth
			}
			if (canvasHeight != this.canvasHeight) {
				this.DOMs.comments.height = canvasHeight
				this.canvasHeight = canvasHeight
			}
			var videoWidth  = this.video.offsetWidth
			var videoHeight = this.video.offsetHeight
			this.commentLoop(videoWidth, videoHeight, t)
			this.commentTop(videoWidth, videoHeight, t)
			this.commentBottom(videoWidth, videoHeight, t)

			this.canvas.clearRect(0, 0, canvasWidth, canvasHeight)
			this.drawText()
		}
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