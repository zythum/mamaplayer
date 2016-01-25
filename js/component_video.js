var timeFormat = require('./timeFormat')

module.exports = {
	init: function () {
		this.video.addEventListener('timeupdate', this.onVideoTimeUpdate.bind(this))
		this.video.addEventListener('play', this.onVideoPlay.bind(this))
		this.video.addEventListener('pause', this.onVideoTimePause.bind(this))
		this.video.addEventListener('loadedmetadata', this.onVideoLoadedMetaData.bind(this))
		this.video.addEventListener('webkitplaybacktargetavailabilitychanged', this.onPlaybackTargetAvailabilityChanged.bind(this))

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
