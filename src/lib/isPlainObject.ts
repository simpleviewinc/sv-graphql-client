export default function isPlainObject(obj) {
	return Object.getPrototypeOf(obj) === Object.prototype;
}
