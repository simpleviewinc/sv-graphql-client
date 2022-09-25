import { execSync } from "child_process";

describe(__filename, function () {
	this.timeout(15000);

	it("Check types", async () => {
		execSync("yarn run types", { stdio: "inherit" });
	});
});
