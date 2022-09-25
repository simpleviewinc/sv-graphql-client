import { readdir } from "fs/promises";

/**
 * Finds all files in a folder matching a regex.
 */
export default async function readdirRegex(dir: string, regex: RegExp) {
	const files = await readdir(dir);
	const rtn = files.filter((file) => {
		return file.match(regex) !== null;
	});
	return rtn;
}
