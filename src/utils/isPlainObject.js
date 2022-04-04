//@ts-check
function isPlainObject(obj) {
	return Object.getPrototypeOf(obj) === Object.prototype;
}

module.exports = isPlainObject;
