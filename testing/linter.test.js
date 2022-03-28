const { execSync } = require("child_process");

describe(__filename, function () {
	this.timeout(15000);

	it("Run linter", async () => {
		execSync("npm run style", { stdio: "inherit" });
	});
});
