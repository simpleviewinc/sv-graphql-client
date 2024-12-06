import isPlainObject from "./isPlainObject";

/**
 * Take an object with null values and recursively drop the null values. Useful for cleaning up graphQL responses. This will mutate the passed in object
 */
export default function nullToUndefined(obj: any) {
	if (obj instanceof Array) {
		for (const [, val] of Object.entries(obj)) {
			if (val === null) {
				const index = obj.indexOf(val);
				obj.splice(index, 1);
			} else {
				nullToUndefined(val);
			}
		}
	} else {
		for (const i in obj) {
			if (obj[i] === undefined) {
				continue;
			} else if (obj[i] === null) {
				delete obj[i];
			} else if (obj[i] instanceof Array) {
				nullToUndefined(obj[i]);
			} else if (isPlainObject(obj[i])) {
				nullToUndefined(obj[i]);
			}
		}
	}
}
