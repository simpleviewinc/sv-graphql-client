import { execSync } from "child_process";

describe(__filename, function () {
	this.timeout(15000);

	it("Run linter", async () => {
		execSync("yarn run style", { stdio: "inherit" });
	});
});
