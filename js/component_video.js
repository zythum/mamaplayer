var timeFormat = require('./timeFormat')

module.exports = {
	init: function () {
		this.video.addEventListener('timeupdate', this.onVideoTimeUpdate.bind(this))
		this.video.addEventListener('play', this.onVideoPlay.bind(this))
		this.video.addEventListener('pause', this.onVideoTimePause.bind(this))
		this.video.addEventListener('loadedmetadata', this.onVideoLoadedMetaData.bind(this))
		this.video.addEventListener('webkitplaybacktargetavailabilitychanged', this.onPlaybackTargetAvailabilityChanged.bind(this))
		// var eventTester = function (e) {
		// 	this.video.addEventListener(e, function(){ console.log(e) })
		// }.bind(this)
		// eventTester("loadstart");   //客户端开始请求数据
		// eventTester("progress");    //客户端正在请求数据
		// eventTester("suspend");     //延迟下载
		// eventTester("abort");       //客户端主动终止下载（不是因为错误引起），
		// eventTester("error");       //请求数据时遇到错误
		// eventTester("stalled");     //网速失速
		// eventTester("play");        //play()和autoplay开始播放时触发
		// eventTester("pause");       //pause()触发
		// eventTester("loadedmetadata");  //成功获取资源长度
		// eventTester("loadeddata");  //
		// eventTester("waiting");     //等待数据，并非错误
		// eventTester("playing");     //开始回放
		// eventTester("canplay");     //可以播放，但中途可能因为加载而暂停
		// eventTester("canplaythrough"); //可以播放，歌曲全部加载完毕
		// eventTester("seeking");     //寻找中
		// eventTester("seeked");      //寻找完毕
		// eventTester("timeupdate");  //播放时间改变
		// eventTester("ended");       //播放结束
		// eventTester("ratechange");  //播放速率改变
		// eventTester("durationchange");  //资源长度改变
		// eventTester("volumechange");    //音量改变

		setInterval(this.videoBuffered.bind(this), 1000)

		this.DOMs.volume_anchor.style.width = this.video.volume*100 + '%'
	},
	onVideoTimeUpdate: function () {
		var currentTime = this.video.currentTime
		var duration    = this.video.duration
		this.DOMs.current.innerHTML  = timeFormat(currentTime)
		this.DOMs.duration.innerHTML = timeFormat(duration)
		if (!this.DOMs.progress_anchor.draging) {
			this.DOMs.progress_anchor.style.width = Math.min(Math.max(currentTime/duration, 0), 1)*100 + '%'
		}
	},
	videoBuffered: function () {
		var buffered = this.video.buffered
		var currentTime = this.video.currentTime
		var bufferedTime = buffered.length == 0 ? 0 : buffered.end(buffered.length - 1)
		this.DOMs.buffered_anchor.style.width = Math.min(Math.max(bufferedTime/this.video.duration, 0), 1)*100 + '%'
		if (bufferedTime == 0 || bufferedTime <= currentTime) {
			this.DOMs.player.classList.add('loading')
		} else {
			this.DOMs.player.classList.remove('loading')
		}
	},
	onVideoPlay: function () {
		this.DOMs.play.classList.remove('paused')
	},
	onVideoTimePause: function () {
		this.DOMs.play.classList.add('paused')
	},
	onVideoLoadedMetaData: function () {
		if (this.video.preloadStartTime) {
			this.video.currentTime = this.video.preloadStartTime
			delete this.video.preloadStartTime
		}
	},
	onPlaybackTargetAvailabilityChanged: function (evt) {
		var cls = 'support-airplay'
		if (evt.availability === "available") {
			this.DOMs.player.classList.add(cls)
		} else {
			this.DOMs.player.classList.remove(cls)
		}
	}
}
