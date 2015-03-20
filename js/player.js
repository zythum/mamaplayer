function _MAMAPlayer (id, size, sourceList, comments) {
	this.id         = id
	this.size       = size.split('x')
	this.sourceList = sourceList || []
	this.comments   = comments
	this.init()
}

require('./component')(
	_MAMAPlayer, 
	require('./component_build'),
	require('./component_event'),
	require('./component_video'),
	require('./component_source'),
	require('./component_comments')
)

MAMAPlayer = _MAMAPlayer
