function parseDomByClassNames (rootElement, classNames) {
	var rs = {};
	classNames.forEach(function (className) {
		rs[className] = rootElement.getElementsByClassName(className)[0]
	})
	return rs;
}

module.exports = parseDomByClassNames