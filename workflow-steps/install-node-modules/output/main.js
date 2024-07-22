// src/main.ts
var import_child_process = require("child_process");
var import_fs = require("fs");
moveToWorkingDirectory();
var command = getInstallCommand();
if (command) {
  console.log(`Installing dependencies using ${command.split(" ")[0]}`);
  console.log(`  Running command: ${command}
`);
  (0, import_child_process.execSync)(command, { stdio: "inherit" });
  patchJest();
} else {
  throw new Error(
    "Could not find lock file. Please ensure you have a lock file before running this command."
  );
}
function moveToWorkingDirectory() {
  const workingDirectory = process.env.NX_CLOUD_INPUT_working_directory;
  if (workingDirectory) {
    process.chdir(workingDirectory);
  }
}
function getInstallCommand() {
  if ((0, import_fs.existsSync)("package-lock.json")) {
    return "npm ci --legacy-peer-deps";
  } else if ((0, import_fs.existsSync)("yarn.lock")) {
    const [major] = (0, import_child_process.execSync)(`yarn --version`, {
      encoding: "utf-8"
    }).trim().split(".");
    const useBerry = +major >= 2;
    if (useBerry) {
      return "yarn install --immutable";
    } else {
      return "yarn install --frozen-lockfile";
    }
  } else if ((0, import_fs.existsSync)("pnpm-lock.yaml") || (0, import_fs.existsSync)("pnpm-lock.yml")) {
    return "pnpm install --frozen-lockfile";
  }
}
function patchJest() {
  try {
    const path = "node_modules/jest-config/build/readConfigFileAndSetRootDir.js";
    const contents = (0, import_fs.readFileSync)(path, "utf-8");
    (0, import_fs.writeFileSync)(
      path,
      contents.replace(
        "const tsNode = await import('ts-node');",
        "require('ts-node'); const tsNode = await import('ts-node');"
      )
    );
  } catch (e) {
    if (process.env.NX_VERBOSE_LOGGING == "true") {
      console.log(e);
    }
    console.log("no need to patch jest");
  }
}
