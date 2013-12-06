module.exports = ()->
	ID = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace /[xy]/g, (c)->
		r = Math.random() * 16 | 0
		if c is 'x' then v = r else v = (r&0x3|0x8)
		v.toString(16)
	ID.toUpperCase()