function pad(num, n) { 
	return (Array(n).join(0) + num).slice(-n)
}
function timeFormat (s) {
	var rs = [], t
	[3600, 60, 1].forEach(function (p) {
		rs.push(pad(t = (s / p) | 0, 2))
		s -= t * p
	})
	return rs.join(':')
}
module.exports = timeFormat